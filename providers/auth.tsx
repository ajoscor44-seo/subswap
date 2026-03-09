import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { User } from "@/constants/types";
import LoginModal from "@/components/LoginModal";
import { supabase } from "@/lib/supabase";
import { ISignUp } from "@/constants/interfaces";
import { AuthError, Session } from "@supabase/supabase-js";
import toast from "react-hot-toast";
import { triggerEmail } from "@/lib/send-email";

const AuthContext = createContext<{
  loading: boolean;
  user: User | null;
  session: Session | null;
  /** True when the current session's email has been verified (email_confirmed_at set). */
  emailVerified: boolean;
  signUp: (data: ISignUp) => Promise<AuthError>;
  login: (email: string, password: string) => Promise<AuthError>;
  logout: () => void;
  refreshSession?: () => Promise<void>;
  /** Resend the verification email (for the current session user's email). */
  resendVerificationEmail?: (email: string) => Promise<{ error: unknown }>;
  showLoginModal: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}>({
  loading: true,
  user: null,
  session: null,
  emailVerified: false,
  signUp: async () => Promise.resolve({ error: null }),
  login: async () => Promise.resolve({ error: null }),
  logout: () => {},
  refreshSession: async () => Promise.resolve(),
  resendVerificationEmail: async () => Promise.resolve({ error: null }),
  showLoginModal: false,
  openLoginModal: () => {},
  closeLoginModal: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 3000);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      clearTimeout(timeout);
      setSession(session);
      if (!session) {
        setUser(null);
        setLoading(false);
        return;
      }
      // Only fetch profile and allow access when email is verified
      const verified = !!session.user.email_confirmed_at;
      if (!verified) {
        setUser(null);
        setLoading(false);
        return;
      }
      const profile = await fetchUserProfile(session.user.id);
      if (profile) {
        setUser(profile);
        // Sync is_verified on profile when they've just verified
        const { data: row } = await supabase
          .from("profiles")
          .select("is_verified, welcome_email_sent")
          .eq("id", session.user.id)
          .single();
        const updates: Record<string, unknown> = {};
        if (!row?.is_verified) updates.is_verified = true;
        if (!row?.welcome_email_sent) {
          updates.welcome_email_sent = true;
          await triggerEmail("welcome", {
            email: session.user.email ?? "",
            username:
              session.user.user_metadata?.username ??
              profile.username ??
              "there",
          });
        }
        if (Object.keys(updates).length > 0) {
          await supabase
            .from("profiles")
            .update(updates)
            .eq("id", session.user.id);
          if (updates.welcome_email_sent) {
            const refreshed = await fetchUserProfile(session.user.id);
            if (refreshed) setUser(refreshed);
          }
        }
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const login = async (email: string, password: string): Promise<AuthError> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return error;
    if (data?.user && !data.user.email_confirmed_at) {
      await supabase.auth.signOut();
      return new AuthError(
        "Please verify your email before signing in. Check your inbox for the verification link.",
        400,
        "EmailNotConfirmed",
      );
    }
    window.location.href = "/#/dashboard";
    return error;
  };

  const signUp = async ({
    email,
    password,
    username,
    name,
  }: ISignUp): Promise<AuthError> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          name,
        },
      },
    });
    if (error) return error;
    // Do not redirect: user must verify email first. UI shows verify-email screen.
    return error;
  };

  const logout = async () => {
    await supabase.auth.signOut({ scope: "global" });
    window.location.href = "/#/home";
  };

  const refreshSession = async () => {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error) {
      console.error("Refresh Session: Error refreshing session", error);
      return;
    }
    setSession(session);
  };

  const resendVerificationEmail = async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });
    return error;
  };

  const fetchUserProfile = async (userId: string): Promise<User | null> => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching user profile");
      return null;
    }

    if (data.is_banned) {
      await logout();
      toast.error(
        "Your account has been banned. Please contact support for assistance.",
      );
      return null;
    }

    const isAdmin = data.role === "admin" || data.is_admin === true;

    const profile: User = {
      id: data.id,
      email: data.email,
      name: data.name || data.email.split("@")[0],
      username: data.username,
      avatar:
        data.avatar ||
        `https://lh6.googleusercontent.com/proxy/ZLGihPRfkkerdJBqfRKKFRWQcXDCfMMuuK_6_IDH6Mfhu0VI3Du2L9eOTiz0yKsIftOesQQnj0whQCZFudjFH-cXgBKnebrpknuWtjKkDcRC5Ik`,
      balance: Number(data.balance) || 0,
      isAdmin,
      isVerified: Boolean(data.is_verified),
      hasDeposited: Boolean(data.has_deposited),
      totalSaved: Number(data.total_saved) || 0,
      is_banned: Boolean(data.is_banned),
      joinedAt: data.created_at,
    };

    return profile;
  };

  const openLoginModal = () => setShowLoginModal(true);
  const closeLoginModal = () => setShowLoginModal(false);

  const emailVerified = !!session?.user?.email_confirmed_at;

  const data = {
    loading,
    user,
    session,
    emailVerified,
    login,
    logout,
    signUp,
    refreshSession,
    resendVerificationEmail,
    showLoginModal,
    openLoginModal,
    closeLoginModal,
  };

  return (
    <AuthContext.Provider value={data}>
      {children}
      {showLoginModal && <LoginModal />}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
