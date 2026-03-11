import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useRef,
} from "react";
import { MasterAccount, User } from "@/constants/types";
import LoginModal from "@/components/LoginModal";
import { supabase } from "@/lib/supabase";
import { ISignUp } from "@/constants/interfaces";
import { AuthError, Session } from "@supabase/supabase-js";
import toast from "react-hot-toast";
import { triggerEmail } from "@/lib/send-email";

function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  let t: ReturnType<typeof setTimeout> | null = null;
  const timeout = new Promise<T>((_, reject) => {
    t = setTimeout(() => reject(new Error(`Timeout: ${label}`)), ms);
  });
  return Promise.race([p, timeout]).finally(() => {
    if (t) clearTimeout(t);
  }) as Promise<T>;
}

const AuthContext = createContext<{
  loading: boolean;
  productsLoading: boolean;
  products: MasterAccount[];
  user: User | null;
  session: Session | null;
  subscriptions: any[];
  subscriptionsLoading: boolean;
  /** True when the current session's email has been verified (email_confirmed_at set). */
  emailVerified: boolean;
  signUp: (data: ISignUp) => Promise<AuthError | null>;
  login: (email: string, password: string) => Promise<AuthError | null>;
  logout: () => void;
  resetPassword: (email: string) => Promise<AuthError | null>;
  updatePassword: (password: string) => Promise<AuthError | null>;
  refreshSession?: () => Promise<void>;
  refreshProfile?: () => Promise<void>;
  refreshProducts?: () => Promise<void>;
  refreshSubscriptions?: () => Promise<void>;
  /** Resend the verification email (for the current session user's email). */
  resendVerificationEmail?: (email: string) => Promise<AuthError | null>;
  showLoginModal: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}>({
  loading: true,
  productsLoading: false,
  products: [],
  user: null,
  session: null,
  subscriptions: [],
  subscriptionsLoading: false,
  emailVerified: false,
  signUp: async () => Promise.resolve(null),
  login: async () => Promise.resolve(null),
  logout: () => {},
  resetPassword: async () => Promise.resolve(null),
  updatePassword: async () => Promise.resolve(null),
  refreshSession: async () => Promise.resolve(),
  resendVerificationEmail: async () => Promise.resolve(null),
  refreshProducts: async () => Promise.resolve(),
  refreshSubscriptions: async () => Promise.resolve(),
  showLoginModal: false,
  openLoginModal: () => {},
  closeLoginModal: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<MasterAccount[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(false);
  const welcomeEmailSending = useRef(false);

  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const { data, error } = await supabase
        .from("master_accounts")
        .select(
          `*, owner:profiles!owner_id (username, is_verified, avatar, merchant_rating)`,
        )
        .gt("available_slots", 0)
        .order("created_at", { ascending: false });

      if (data) setProducts(data as MasterAccount[]);
      if (error) throw error;
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setProductsLoading(false);
    }
  };

  const fetchSubscriptions = async (userId: string) => {
    setSubscriptionsLoading(true);
    try {
      const { data, error } = await supabase
        .from("user_subscriptions")
        .select("*, master_accounts(*)")
        .eq("user_id", userId);
      if (data) setSubscriptions(data);
      if (error) throw error;
    } catch (err) {
      console.error("Error fetching subscriptions:", err);
    } finally {
      setSubscriptionsLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const initTimeout = setTimeout(() => {
      if (!cancelled) setLoading(false);
    }, 3000);

    const loadProfileAndSync = async (sess: Session) => {
      const verified = !!sess.user.email_confirmed_at;
      if (!verified) {
        setUser(null);
        return;
      }

      const profile = await withTimeout(
        fetchUserProfile(sess.user.id),
        8000,
        "fetchUserProfile",
      ).catch((err) => {
        console.error("[auth] profile fetch failed", err);
        return null;
      });

      if (!profile) {
        setUser(null);
        return;
      }

      setUser(profile);

      await Promise.all([fetchProducts(), fetchSubscriptions(sess.user.id)]);
      
      try {
        const { data: row, error } = await supabase
          .from("profiles")
          .select("welcome_email_sent")
          .eq("id", sess.user.id)
          .single();
        if (error) {
          console.error("[auth] read profile flags failed", error);
          return;
        }

        const updates: Record<string, unknown> = {};

        if (!row?.welcome_email_sent && !welcomeEmailSending.current) {
          welcomeEmailSending.current = true;
          try {
            await triggerEmail("welcome", {
              email: sess.user.email ?? "",
              username:
                sess.user.user_metadata?.username ??
                profile.username ??
                "there",
            });
            updates.welcome_email_sent = true;
          } catch (err) {
            console.error("[auth] welcome email failed", err);
            welcomeEmailSending.current = false;
          }
        }

        if (Object.keys(updates).length > 0) {
          const { error: updateError } = await supabase
            .from("profiles")
            .update(updates)
            .eq("id", sess.user.id);
          if (updateError)
            console.error("[auth] update profile flags failed", updateError);
        }
      } catch (err) {
        console.error("[auth] post-verify sync failed", err);
      }
    };

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) console.error("[auth] getSession failed", error);
        setSession(data.session);
        if (!data.session) setUser(null);
        if (data.session) void loadProfileAndSync(data.session);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      clearTimeout(initTimeout);
      if (cancelled) return;
      if (event === "INITIAL_SESSION") return;

      setSession(session);
      setLoading(false);
      if (!session) {
        setUser(null);
        setSubscriptions([]);
        return;
      }
      void loadProfileAndSync(session);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
      clearTimeout(initTimeout);
    };
  }, []);

  const login = async (
    email: string,
    password: string,
  ): Promise<AuthError | null> => {
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
    return null;
  };

  const signUp = async ({
    email,
    password,
    username,
    name,
  }: ISignUp): Promise<AuthError | null> => {
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
    return null;
  };

  const logout = async () => {
    await supabase.auth.signOut({ scope: "global" });
    window.location.href = "/#/home";
  };

  const resetPassword = async (email: string): Promise<AuthError | null> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/#/reset-password`,
    });
    return error;
  };

  const updatePassword = async (password: string): Promise<AuthError | null> => {
    const { error } = await supabase.auth.updateUser({ password });
    return error;
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
    window.location.reload();
  };

  const refreshProfile = async () => {
    if (!session?.user) return;
    const profile = await fetchUserProfile(session.user.id);
    setUser(profile);
  };

  const refreshProducts = async () => {
    await fetchProducts();
  };

  const refreshSubscriptions = async () => {
    if (!session?.user) return;
    await fetchSubscriptions(session.user.id);
  };

  const resendVerificationEmail = async (
    email: string,
  ): Promise<AuthError | null> => {
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
        `https://ui-avatars.com/api/?name=${data.username}&background=ede9fe&color=7c5cfc&size=36`,
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
    productsLoading,
    user,
    products,
    session,
    subscriptions,
    subscriptionsLoading,
    emailVerified,
    login,
    logout,
    signUp,
    resetPassword,
    updatePassword,
    refreshSession,
    refreshProfile,
    resendVerificationEmail,
    refreshProducts,
    refreshSubscriptions,
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
