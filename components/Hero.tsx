import { useAuth } from "@/providers/auth";
import { useNavigator } from "@/providers/navigator";
import React from "react";

// List of popular domains to fetch from Brandfetch CDN
const PARTNER_DOMAINS = [
  "netflix.com",
  "spotify.com",
  "apple.com",
  "youtube.com",
  "amazon.com",
  "canva.com",
  "chatgpt.com",
];

export const Hero: React.FC = () => {
  const { openLoginModal, user } = useAuth();
  const { changeView } = useNavigator();

  return (
    <section className="relative pt-24 pb-32 overflow-hidden bg-white">
      {/* Background Blurs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-40">
        <div className="absolute top-[-5%] left-[-5%] w-[45%] h-[45%] bg-indigo-100 blur-[130px] rounded-full"></div>
        <div className="absolute bottom-[5%] right-[-5%] w-[45%] h-[45%] bg-blue-100 blur-[130px] rounded-full"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-20">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-100 mb-8 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Live: 4,000+ Active Slots in Nigeria
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[0.9] mb-8">
            The Smartest Way to <br />
            <span className="text-indigo-600">Enjoy Premium.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-500 font-medium leading-relaxed mb-12">
            Share existing subscriptions or join verified groups. Save up to 80%
            on the world's best digital services.
          </p>

          {/* CTA Section */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            <button
              onClick={() =>
                user ? changeView("dashboard") : openLoginModal()
              }
              className="group w-full sm:w-auto bg-slate-900 text-white px-10 py-5 rounded-2xl text-base font-black tracking-widest hover:bg-indigo-600 transition-all shadow-xl hover:shadow-indigo-200 flex items-center justify-center gap-3 active:scale-95"
            >
              Start Saving Now
              <svg
                className="w-4 h-4 transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                ></path>
              </svg>
            </button>

            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <img
                    key={i}
                    src={`https://i.pravatar.cc/100?u=${i + 20}`}
                    className="h-12 w-12 rounded-full border-4 border-white shadow-sm"
                    alt="User"
                  />
                ))}
              </div>
              <div className="text-left">
                <p className="text-xs font-black text-slate-900 uppercase tracking-tight">
                  Trusted by 2.4k+
                </p>
                <p className="text-[10px] font-bold text-slate-400">
                  Verified members
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Brandfetch Logo Section */}
        <div className="pt-16 mt-16 border-t border-slate-100">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 text-center mb-12">
            Available Subscriptions
          </p>

          {/* Logo Grid / Marquee */}
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {PARTNER_DOMAINS.map((domain) => (
              <div
                key={domain}
                className="w-auto flex items-center rounded-full overflow-hidden bg-slate-50 p-2"
              >
                <img
                  src={`https://cdn.brandfetch.io/${domain}/w/100/h/100?fallback=transparent`}
                  alt={domain}
                  className="h-full w-auto rounded-full object-contain transition-transform hover:scale-110"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
