import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useCallback,
  useEffect,
} from "react";
import { TViewState } from "@/constants/types";
import { useAuth } from "./auth";
import { pageViews } from "@/constants/data";

const NavigatorContext = createContext<{
  dashboardTab: string;
  currentView: TViewState;
  isReady: boolean;
  goTo: (view: TViewState) => void;
  changeTab: (tab: string) => void;
}>({
  dashboardTab: "overview",
  currentView: "home",
  isReady: false,
  goTo: () => {},
  changeTab: () => {},
});

export const PROTECTED: TViewState[] = [
  "dashboard",
  "transactions",
  "settings",
  "admin",
];

const parseHash = (): TViewState | null => {
  // Handle complex hashes like #/reset-password#access_token=...
  // Use regex to pull out the first segment after the hash/slash
  const hash = window.location.hash;
  const match = hash.match(/^#\/?([^#?\/]+)/);
  if (!match) return null;
  
  const path = match[1] as TViewState;
  return pageViews.includes(path) ? path : null;
};

const resolveView = (
  hash: TViewState | null,
  user: ReturnType<typeof useAuth>["user"],
  session: ReturnType<typeof useAuth>["session"],
  emailVerified: boolean,
): TViewState => {
  // Always prioritize reset-password if it's in the URL
  if (hash === "reset-password") return "reset-password";
  
  if (session && !emailVerified) return "verify-email";

  if (!hash) {
    return user ? (user.isAdmin ? "admin" : "dashboard") : "home";
  }

  if (hash === "admin") {
    if (!user) return "home";
    if (!user.isAdmin) return "dashboard";
    return "admin";
  }

  if (PROTECTED.includes(hash) && !user) return "home";

  return hash;
};

export const NavigatorProvider = ({ children }: { children: ReactNode }) => {
  const { user, session, emailVerified, loading: authLoading } = useAuth();
  const [currentView, setCurrentView] = useState<TViewState>("home");
  const [dashboardTab, setDashboardTab] = useState<string>("overview");
  const [isReady, setIsReady] = useState(false);

  const syncView = useCallback(() => {
    const resolved = resolveView(parseHash(), user, session, emailVerified);
    setCurrentView(resolved);
  }, [user, session, emailVerified]);

  useEffect(() => {
    if (authLoading) return;
    syncView();
    setIsReady(true);
  }, [authLoading, syncView]);

  useEffect(() => {
    if (isReady) return;
    const t = setTimeout(() => {
      syncView();
      setIsReady(true);
    }, 6000);
    return () => clearTimeout(t);
  }, [isReady, syncView]);

  useEffect(() => {
    window.addEventListener("hashchange", syncView);
    return () => window.removeEventListener("hashchange", syncView);
  }, [syncView]);

  const goTo = useCallback(
    (view: TViewState) => {
      const resolved = resolveView(view, user, session, emailVerified);
      window.location.hash = `#/${resolved}`;
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [user, session, emailVerified],
  );

  const changeTab = useCallback((tab: string) => setDashboardTab(tab), []);

  return (
    <NavigatorContext.Provider
      value={{ currentView, dashboardTab, isReady, goTo, changeTab }}
    >
      {children}
    </NavigatorContext.Provider>
  );
};

export const useNavigator = () => useContext(NavigatorContext);
