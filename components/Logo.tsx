import { useNavigator } from "@/providers/navigator";
import React from "react";
import zarLogo from "@/assets/zar-logo.png";
import discountZarWhiteLogo from "@/assets/discount-zar-white.png";
import discountZarBlackLogo from "@/assets/discount-zar-black.png";

const Logo = () => {
  const { changeView } = useNavigator();

  return (
    <div
      onClick={() => changeView("home")}
      className="flex items-center gap-2 cursor-pointer group"
    >
      <img
        src={discountZarWhiteLogo}
        alt="DiscountZAR Logo"
        className="h-16 w-24 object-cover rounded"
      />
    </div>
  );
};

export default Logo;
