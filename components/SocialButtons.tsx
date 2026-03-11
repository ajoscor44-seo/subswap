import React from "react";
import { supabase } from "@/lib/supabase";

interface SocialButtonsProps {
  onError: (msg: string) => void;
}

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path
      d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
      fill="#4285F4"
    />
    <path
      d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
      fill="#34A853"
    />
    <path
      d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"
      fill="#FBBC05"
    />
    <path
      d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"
      fill="#EA4335"
    />
  </svg>
);

// const AppleIcon = () => (
//   <svg width="17" height="18" viewBox="0 0 814 1000" fill="currentColor">
//     <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105.7-57.2-155.5-127.4C46 790.7 0 663 0 541.8c0-207.5 135.4-317.5 268.5-317.5 99.8 0 182.6 66.1 245.3 66.1 60.1 0 154.8-70 269.1-70 43.4 0 165.8 4 247.7 99.3zm-156.7-175.1c-39.5-47.5-100.5-82.5-164.4-82.5-8.3 0-16.6.6-24.9 1.9 1.3 54.9 28.6 108.9 63.4 145.3 37.1 39.5 99.3 72.8 159.5 72.8 6.4 0 12.8-.6 19.2-1.3-1.9-53.7-24.3-107.6-52.8-136.2z" />
//   </svg>
// );

const SocialButtons: React.FC<SocialButtonsProps> = ({ onError }) => {
  const [googleLoading, setGoogleLoading] = React.useState(false);
  // const [appleLoading, setAppleLoading] = React.useState(false);

  const handleGoogle = async () => {
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      onError(error.message);
      setGoogleLoading(false);
    }
  };

  // const handleApple = async () => {
  //   setAppleLoading(true);
  //   const { error } = await supabase.auth.signInWithOAuth({
  //     provider: "apple",
  //     options: { redirectTo: window.location.origin },
  //   });
  //   if (error) {
  //     onError(error.message);
  //     setAppleLoading(false);
  //   }
  // };

  return (
    <div className="flex flex-col gap-3">
      {/* Google */}
      <button
        type="button"
        onClick={handleGoogle}
        disabled={googleLoading}
        className="w-full flex items-center justify-center gap-3 border-2 border-slate-100 bg-white hover:bg-slate-50 hover:border-slate-200 py-3.5 rounded-2xl font-black text-sm text-slate-700 transition-all disabled:opacity-50 active:scale-95"
      >
        {googleLoading ? (
          <i className="fa-solid fa-spinner fa-spin text-slate-400" />
        ) : (
          <GoogleIcon />
        )}
        Continue with Google
      </button>

      {/* Apple */}
      {/* <button
        type="button"
        onClick={handleApple}
        disabled={appleLoading}
        className="w-full flex items-center justify-center gap-3 border-2 border-slate-900 bg-slate-900 hover:bg-slate-800 py-3.5 rounded-2xl font-black text-sm text-white transition-all disabled:opacity-50 active:scale-95"
      >
        {appleLoading ? (
          <i className="fa-solid fa-spinner fa-spin text-white/60" />
        ) : (
          <AppleIcon />
        )}
        Continue with Apple
      </button> */}
    </div>
  );
};

export default SocialButtons;
