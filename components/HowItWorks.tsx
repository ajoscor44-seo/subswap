
import React from 'react';

export const HowItWorks: React.FC = () => {
  return (
    <section className="py-24 bg-white relative overflow-hidden" id="how-it-works">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className="text-sm font-black text-indigo-600 uppercase tracking-[0.3em] mb-4">How it Works</h2>
          <h3 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Offer a subscription in minutes</h3>
          <p className="mt-6 text-slate-500 font-medium leading-relaxed">
            Turn your extra subscription slots into cash. SubSwap makes it easy for Nigerians to share costs securely and automatically.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {/* Step 1 */}
          <div className="relative p-10 rounded-[3rem] bg-slate-50 border border-slate-100 hover:border-indigo-600/20 hover:bg-white transition-all duration-500 group shadow-sm hover:shadow-xl">
            <div className="h-16 w-16 bg-white text-indigo-600 rounded-2xl flex items-center justify-center text-2xl font-black mb-8 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">1</div>
            <h4 className="text-xl font-black text-slate-900 mb-4">Create your subscription</h4>
            <p className="text-slate-500 font-medium leading-relaxed text-sm">
              Describe what it offers, indicate the number of slots available, and set your monthly price in Naira.
            </p>
            <div className="absolute -right-4 top-1/2 -translate-y-1/2 hidden lg:block text-slate-200">
                <i className="fa-solid fa-chevron-right text-4xl"></i>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative p-10 rounded-[3rem] bg-slate-50 border border-slate-100 hover:border-indigo-600/20 hover:bg-white transition-all duration-500 group shadow-sm hover:shadow-xl">
            <div className="h-16 w-16 bg-white text-emerald-600 rounded-2xl flex items-center justify-center text-2xl font-black mb-8 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">2</div>
            <h4 className="text-xl font-black text-slate-900 mb-4">Share it online</h4>
            <p className="text-slate-500 font-medium leading-relaxed text-sm">
              You will get a unique invite link. Share it with your friends or list it on our marketplace for the community.
            </p>
            <div className="absolute -right-4 top-1/2 -translate-y-1/2 hidden lg:block text-slate-200">
                <i className="fa-solid fa-chevron-right text-4xl"></i>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-10 rounded-[3rem] bg-slate-50 border border-slate-100 hover:border-indigo-600/20 hover:bg-white transition-all duration-500 group shadow-sm hover:shadow-xl">
            <div className="h-16 w-16 bg-white text-amber-600 rounded-2xl flex items-center justify-center text-2xl font-black mb-8 group-hover:bg-amber-600 group-hover:text-white transition-all shadow-sm">3</div>
            <h4 className="text-xl font-black text-slate-900 mb-4">Collect your payments</h4>
            <p className="text-slate-500 font-medium leading-relaxed text-sm">
              Receive your money automatically every month. We handle the collection and ensure your wallet is credited instantly.
            </p>
          </div>
        </div>

        <div className="mt-16 text-center">
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Built for the Nigerian Market</p>
            <div className="mt-4 flex items-center justify-center gap-6 opacity-40">
                <img src="https://upload.wikimedia.org/wikipedia/commons/7/79/Flag_of_Nigeria.svg" className="h-4" alt="Nigeria" />
                <span className="font-bold text-slate-900">₦ Naira Settlements</span>
                <span className="font-bold text-slate-900">Local Support</span>
            </div>
        </div>
      </div>
    </section>
  );
};
