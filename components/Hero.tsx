
import React from 'react';

export const Hero: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => {
  return (
    <section className="relative pt-24 pb-32 overflow-hidden bg-white">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-50">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-50 blur-[120px] rounded-full"></div>
         <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-blue-50 blur-[120px] rounded-full"></div>
         <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-emerald-50 blur-[100px] rounded-full"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-100 mb-8 animate-fade-in shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-ping"></span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live: 4,000+ Active Slots in Nigeria</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 tracking-tight leading-[0.95] mb-8">
            The Smartest Way to <br />
            <span className="text-indigo-600">Enjoy Premium.</span>
          </h1>
          
          <p className="max-w-3xl mx-auto text-lg md:text-xl text-slate-500 font-medium leading-relaxed mb-12">
            Join a secure community of savers. Share your existing subscriptions and earn, or join a verified group and save up to 80% on the world's best digital services.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button 
              onClick={onGetStarted}
              className="w-full sm:w-auto bg-slate-900 text-white px-12 py-6 rounded-2xl text-base font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-2xl shadow-slate-300 flex items-center justify-center gap-3 active:scale-95"
            >
              Start Saving Now
              <i className="fa-solid fa-arrow-right text-xs"></i>
            </button>
            <div className="flex items-center gap-4 px-6 py-4">
               <div className="flex -space-x-3">
                 {[1,2,3,4].map(i => (
                   <img key={i} src={`https://i.pravatar.cc/100?u=${i + 10}`} className="h-10 w-10 rounded-full border-4 border-white shadow-sm" alt="User" />
                 ))}
               </div>
               <div className="text-left">
                  <p className="text-xs font-black text-slate-900 uppercase tracking-tighter">Trusted by 2.4k+</p>
                  <p className="text-[10px] font-bold text-slate-400">Verified community members</p>
               </div>
            </div>
          </div>
        </div>

        {/* Trust Logos / Partnership Section */}
        <div className="pt-20 border-t border-slate-100">
           <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-300 text-center mb-10">Supporting your favorite services</p>
           <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
              <i className="fa-brands fa-netflix text-4xl"></i>
              <i className="fa-brands fa-spotify text-4xl"></i>
              <i className="fa-brands fa-apple text-4xl"></i>
              <i className="fa-brands fa-youtube text-4xl"></i>
              <i className="fa-brands fa-amazon text-4xl"></i>
              <span className="text-2xl font-black tracking-tighter italic">Canva</span>
           </div>
        </div>
      </div>
    </section>
  );
};
