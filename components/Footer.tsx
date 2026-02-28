import React from "react";

interface FooterProps {
  onNavigate: (view: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-white border-t border-slate-200 pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div
              onClick={() => onNavigate("home")}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl transition-transform group-hover:scale-110">
                S
              </div>
              <span className="text-xl font-black text-slate-900 tracking-tighter">
                DiscountZAR
              </span>
            </div>
            <p className="text-slate-400 font-medium max-w-sm leading-relaxed">
              The most secure and transparent way to share premium digital
              subscriptions globally. Trusted by thousands of savers.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6">
              Marketplace
            </h4>
            <ul className="space-y-4 text-sm font-bold text-slate-400">
              <li
                onClick={() => onNavigate("home")}
                className="hover:text-indigo-600 cursor-pointer transition-colors"
              >
                Streaming Services
              </li>
              <li
                onClick={() => onNavigate("home")}
                className="hover:text-indigo-600 cursor-pointer transition-colors"
              >
                Software & Tools
              </li>
              <li
                onClick={() => onNavigate("home")}
                className="hover:text-indigo-600 cursor-pointer transition-colors"
              >
                Education
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6">
              Company
            </h4>
            <ul className="space-y-4 text-sm font-bold text-slate-400">
              <li
                onClick={() => onNavigate("about")}
                className="hover:text-indigo-600 cursor-pointer transition-colors"
              >
                About Us
              </li>
              <li
                onClick={() => onNavigate("contact")}
                className="hover:text-indigo-600 cursor-pointer transition-colors"
              >
                Contact Support
              </li>
              <li
                onClick={() => onNavigate("home")}
                className="hover:text-indigo-600 cursor-pointer transition-colors"
              >
                Terms of Service
              </li>
            </ul>
          </div>
        </div>
        <div className="text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] pt-10 border-t border-slate-100">
          &copy; {new Date().getFullYear()} DiscountZAR INC. ALL RIGHTS
          RESERVED.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
