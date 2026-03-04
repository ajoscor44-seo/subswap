import React from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { AuthProvider } from "./providers/auth";
import View from "./pages";
import { Toaster } from "react-hot-toast";
import { NavigatorProvider } from "./providers/navigator";
import { Analytics } from "@vercel/analytics/react";

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <AuthProvider>
        <NavigatorProvider>
          <Navbar />
          <View />
          <Footer />
          <Toaster />
        </NavigatorProvider>
      </AuthProvider>
      <Analytics />
    </div>
  );
};

export default App;
