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

const PROTECTED: TViewState[] = [
  "dashboard",
  "transactions",
  "settings",
  "admin",
];

const parseHash = (): TViewState | null => {
  const raw = window.location.hash.replace(/^#\/?/, "").trim() as TViewState;
  return pageViews.includes(raw) ? raw : null;
};

const resolveView = (
  hash: TViewState | null,
  user: ReturnType<typeof useAuth>["user"],
): TViewState => {
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
  const { user, loading: authLoading } = useAuth();
  const [currentView, setCurrentView] = useState<TViewState>("home");
  const [dashboardTab, setDashboardTab] = useState<string>("overview");
  const [isReady, setIsReady] = useState(false);

  const syncView = useCallback(() => {
    const resolved = resolveView(parseHash(), user);
    setCurrentView(resolved);
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    syncView();
    setIsReady(true);
  }, [authLoading, syncView]);

  useEffect(() => {
    window.addEventListener("hashchange", syncView);
    return () => window.removeEventListener("hashchange", syncView);
  }, [syncView]);

  const goTo = useCallback(
    (view: TViewState) => {
      const resolved = resolveView(view, user);
      window.location.hash = `#/${resolved}`;
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [user],
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
