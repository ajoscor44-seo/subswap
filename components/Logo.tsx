import { useNavigator } from "@/providers/navigator";
import React from "react";
import zarLogo from "@/assets/zar-logo.png";

const Logo = ({ size }: { size?: number }) => {
  const { goTo } = useNavigator();

  return (
    <div
      onClick={() => goTo("home")}
      className="flex items-center gap-2 cursor-pointer group"
    >
      <img
        src={zarLogo}
        alt="DiscountZAR Logo"
        className={`h-${size || 10} rounded`}
      />
    </div>
  );
};

export default Logo;
