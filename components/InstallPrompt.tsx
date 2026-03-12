import React, { useState, useEffect } from "react";

const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Only show if they haven't dismissed it this session
      const dismissed = sessionStorage.getItem("install-prompt-dismissed");
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Also check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowPrompt(false);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    sessionStorage.setItem("install-prompt-dismissed", "true");
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:bottom-8 md:left-auto md:right-8 md:w-80 z-250 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white rounded-3xl p-5 shadow-2xl border border-indigo-100 flex flex-col gap-4">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-200">
            <img src="/icons/icon-192x192.png" alt="App Icon" className="h-8 w-8" />
          </div>
          <div className="flex-1">
            <h4 className="font-display text-sm font-black text-slate-900 leading-tight">Install DiscountZAR</h4>
            <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed">
              Add to your home screen for faster access and a better experience.
            </p>
          </div>
          <button 
            onClick={handleDismiss}
            className="text-slate-300 hover:text-slate-500 transition-colors"
          >
            <i className="fa-solid fa-xmark text-sm" />
          </button>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleInstall}
            className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl font-display text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
          >
            Install Now
          </button>
          <button
            onClick={handleDismiss}
            className="px-4 bg-slate-50 text-slate-400 py-2.5 rounded-xl font-display text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
