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
  signUp: (data: ISignUp) => Promise<AuthError>;
  login: (email: string, password: string) => Promise<AuthError>;
  logout: () => void;
  refreshSession?: () => Promise<void>;
  showLoginModal: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}>({
  loading: true,
  user: null,
  session: null,
  signUp: async () => Promise.resolve({ error: null }),
  login: async () => Promise.resolve({ error: null }),
  logout: () => {},
  refreshSession: async () => Promise.resolve(),
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
      }
      if (event === "SIGNED_IN" && session?.user) {
        const isNewUser = // check if created_at is within last 60 seconds
          Date.now() - new Date(session.user.created_at).getTime() < 60_000;
        if (isNewUser) {
          await triggerEmail("welcome", {
            email: session.user.email,
            username: session.user.user_metadata?.username ?? "there",
          });
        }
      }
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (session?.user) {
      fetchUserProfile(session.user.id).then((profile) => {
        setUser(profile);
        setLoading(false);
      });
    }
  }, [session]);

  const login = async (email: string, password: string): Promise<AuthError> => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
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
    window.location.href = "/#/dashboard";

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

    const isAdmin =
      data.email.toLowerCase() === "joscor@wsv.com.ng" || data.role === "admin";

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

  const data = {
    loading,
    user,
    session,
    login,
    logout,
    signUp,
    refreshSession,
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
