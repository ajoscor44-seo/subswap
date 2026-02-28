import { useNavigator } from "@/providers/navigator";
import React from "react";
import discountZarWhiteLogo from "@/assets/discount-zar-white.png";

const Logo = () => {
  const { goTo } = useNavigator();

  return (
    <div
      onClick={() => goTo("home")}
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
