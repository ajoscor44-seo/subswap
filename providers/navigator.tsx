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
  goTo: (view: TViewState) => void;
  changeView: (view: TViewState) => void;
  changeTab: (tab: string) => void;
}>({
  dashboardTab: "subscriptions",
  currentView: "home",
  goTo: () => {},
  changeView: () => {},
  changeTab: () => {},
});

export const NavigatorProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<TViewState>("home");
  const [dashboardTab, setDashboardTab] = useState<string>("subscriptions");

  const goTo = (id: string) => {
    window.location.hash = `#/${id}`;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const changeView = (view: TViewState) => {
    goTo(view);
    setCurrentView(view);
  };

  const changeTab = (tab: string) => {
    setDashboardTab(tab);
  };

  const syncViewWithHash = useCallback(() => {
    const hash = window.location.hash.replace("#/", "") as TViewState;

    if (hash && pageViews.includes(hash)) {
      if (hash === "admin" && !user?.isAdmin) {
        changeView("dashboard");
      } else if (hash === "marketplace") {
        changeView("marketplace");
      } else if (hash === "home" && !user) {
        changeView("home");
      } else if (hash === "about") {
        changeView("about");
      } else {
        changeView(hash);
      }
    } else {
      changeView(user ? (user.isAdmin ? "admin" : "dashboard") : "home");
    }
  }, [user]);

  useEffect(() => {
    syncViewWithHash();
    window.addEventListener("hashchange", syncViewWithHash);

    return () => {
      window.removeEventListener("hashchange", syncViewWithHash);
    };
  }, [user]);

  return (
    <NavigatorContext.Provider
      value={{ currentView, dashboardTab, goTo, changeView, changeTab }}
    >
      {children}
    </NavigatorContext.Provider>
  );
};

export const useNavigator = () => useContext(NavigatorContext);
