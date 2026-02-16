
import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { User } from './types';

// Components
import Navbar from './components/Navbar';
import { Hero } from './components/Hero';
import { Marketplace } from './components/Marketplace';
import { Dashboard } from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import LoginModal from './components/LoginModal';
import Footer from './components/Footer';
import AboutUs from './components/AboutUs';
import ContactUs from './components/ContactUs';
import { HowItWorks } from './components/HowItWorks';
import { Features } from './components/Features';
import { Faq } from './components/Faq';
import { PopularServices } from './components/PopularServices';
import TransactionHistory from './components/TransactionHistory';

type ViewState = 'home' | 'dashboard' | 'admin' | 'settings' | 'about' | 'contact' | 'transactions';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [connError, setConnError] = useState<string | null>(null);

  const fetchProfile = async (userId: string, email: string, retryCount = 0): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (retryCount < 3) {
          console.log(`Profile not found, retrying... (${retryCount + 1}/3)`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          return fetchProfile(userId, email, retryCount + 1);
        }
        console.warn("Profile fetch error:", error.message);
        return null;
      }

      if (data) {
        const mappedUser: User = {
          id: data.id,
          email: email,
          name: data.name || 'User',
          username: data.username || 'user_' + data.id.slice(0, 4),
          avatar: data.avatar || `https://ui-avatars.com/api/?name=${data.name || email}&background=6366f1&color=fff`,
          balance: Number(data.balance) || 0,
          isAdmin: data.role === 'admin',
          isVerified: Boolean(data.is_verified),
          hasDeposited: Boolean(data.has_deposited),
          totalSaved: Number(data.total_saved) || 0
        };
        setUser(mappedUser);
        return mappedUser;
      }
    } catch (err) {
      console.error("Profile sync exception:", err);
    }
    return null;
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session?.user) {
          const profile = await fetchProfile(session.user.id, session.user.email!);
          const hash = window.location.hash.replace('#/', '') as ViewState;
          if (profile) {
              if (!['about', 'contact', 'home'].includes(hash)) {
                setCurrentView(profile.isAdmin ? 'admin' : 'dashboard');
              } else if (hash) {
                setCurrentView(hash);
              }
          }
        }
      } catch (err: any) {
        console.error("Initialization failed:", err.message);
        if (err.message.includes('fetch')) {
          setConnError("Database connection could not be established. Please check your Supabase configuration.");
        }
      } finally {
        setIsAuthLoading(false);
      }
    };

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setIsAuthLoading(true);
        const profile = await fetchProfile(session.user.id, session.user.email!);
        setIsAuthLoading(false);
        if (profile) {
          setCurrentView(profile.isAdmin ? 'admin' : 'dashboard');
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setCurrentView('home');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Logout error:", err);
    }
    setUser(null);
    setCurrentView('home');
  };

  const navigateTo = (view: ViewState) => {
    setCurrentView(view);
    window.location.hash = `#/${view}`;
    window.scrollTo(0, 0);
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black animate-pulse shadow-xl shadow-indigo-200">S</div>
        <p className="mt-6 text-xs font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse">Syncing Session</p>
      </div>
    );
  }

  if (connError) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="h-20 w-20 bg-red-100 text-red-600 rounded-[2rem] flex items-center justify-center text-3xl mb-6">
          <i className="fa-solid fa-plug-circle-xmark"></i>
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Connection Error</h2>
        <p className="text-slate-500 max-w-sm mb-8">{connError}</p>
        <button onClick={() => window.location.reload()} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest">
          Retry Connection
        </button>
      </div>
    );
  }

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return (
          <>
            <Hero onGetStarted={() => user ? setCurrentView('dashboard') : setIsLoginOpen(true)} />
            <HowItWorks />
            <PopularServices />
            <div className="container mx-auto px-4 py-20" id="marketplace">
               <Marketplace user={user} onAuthRequired={() => setIsLoginOpen(true)} />
            </div>
            <Features />
            <Faq />
            <section className="py-24 bg-slate-900 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 blur-[120px] rounded-full"></div>
              <div className="container mx-auto px-4 text-center relative z-10">
                <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight">Save up to 80% now.</h2>
                <button 
                  onClick={() => user ? navigateTo('dashboard') : setIsLoginOpen(true)}
                  className="bg-indigo-600 text-white px-10 py-5 rounded-2xl text-lg font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-2xl"
                >
                  Join the Community
                </button>
              </div>
            </section>
          </>
        );
      case 'about': return <AboutUs />;
      case 'contact': return <ContactUs />;
      case 'dashboard': return user ? <Dashboard user={user} onLogout={handleLogout} /> : (setCurrentView('home'), null);
      case 'admin': return user?.isAdmin ? <AdminDashboard user={user} /> : (setCurrentView('dashboard'), null);
      case 'transactions': return user ? <TransactionHistory user={user} /> : (setCurrentView('home'), null);
      default: return <Hero onGetStarted={() => setIsLoginOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Inter']">
      <Navbar user={user} currentView={currentView} onNavigate={navigateTo as any} onLogin={() => setIsLoginOpen(true)} onLogout={handleLogout} />
      <main className="flex-grow">{renderContent()}</main>
      <Footer onNavigate={navigateTo as any} />
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onSuccess={() => setIsLoginOpen(false)} />
    </div>
  );
};

export default App;
