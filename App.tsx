
import React, { useState, useEffect, useCallback } from 'react';
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
import TransactionHistory from './components/TransactionHistory';

type ViewState = 'home' | 'dashboard' | 'admin' | 'settings' | 'about' | 'contact' | 'transactions';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Helper to sync view with hash without triggering re-renders in middle of render cycle
  const syncViewWithHash = useCallback((targetUser: User | null) => {
    const hash = window.location.hash.replace('#/', '') as ViewState;
    const validViews: ViewState[] = ['home', 'dashboard', 'admin', 'about', 'contact', 'transactions'];
    
    if (hash && validViews.includes(hash)) {
      if (hash === 'admin' && !targetUser?.isAdmin) {
        setCurrentView('dashboard');
      } else if ((hash === 'dashboard' || hash === 'transactions') && !targetUser) {
        setCurrentView('home');
      } else {
        setCurrentView(hash);
      }
    } else {
      setCurrentView(targetUser ? (targetUser.isAdmin ? 'admin' : 'dashboard') : 'home');
    }
  }, []);

  const fetchProfile = async (userId: string, email: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) return null;

      if (data.is_banned) {
        await supabase.auth.signOut();
        return null;
      }

      const isTargetAdmin = email.toLowerCase() === 'joscor@wsv.com.ng';
      
      return {
        id: data.id,
        email: email,
        name: data.name || 'User',
        username: data.username || 'user_' + data.id.slice(0, 4),
        avatar: data.avatar || `https://ui-avatars.com/api/?name=${data.name || email}&background=6366f1&color=fff`,
        balance: Number(data.balance) || 0,
        isAdmin: isTargetAdmin || data.role === 'admin',
        isVerified: Boolean(data.is_verified),
        hasDeposited: Boolean(data.has_deposited),
        totalSaved: Number(data.total_saved) || 0,
        is_banned: Boolean(data.is_banned)
      };
    } catch (err) {
      console.error("Profile sync exception:", err);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      // Safety timeout to prevent stuck preloader if Supabase hangs
      const timeoutId = setTimeout(() => {
        if (mounted && isAuthLoading) setIsAuthLoading(false);
      }, 5000);

      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user && mounted) {
          const profile = await fetchProfile(session.user.id, session.user.email!);
          if (profile) {
            setUser(profile);
            syncViewWithHash(profile);
          } else {
            syncViewWithHash(null);
          }
        } else if (mounted) {
          syncViewWithHash(null);
        }
      } catch (e) {
        console.error("Auth init error", e);
      } finally {
        clearTimeout(timeoutId);
        if (mounted) setIsAuthLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_IN' && session?.user) {
        setIsAuthLoading(true);
        const profile = await fetchProfile(session.user.id, session.user.email!);
        setUser(profile);
        syncViewWithHash(profile);
        setIsAuthLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setCurrentView('home');
        window.location.hash = '';
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [syncViewWithHash]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const navigateTo = (view: ViewState) => {
    setCurrentView(view);
    window.location.hash = `#/${view}`;
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-slate-100 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
        <div className="text-center">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.3em]">SubSwap</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Verifying Secure Session...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return (
          <>
            <Hero onGetStarted={() => user ? navigateTo('dashboard') : setIsLoginOpen(true)} />
            <HowItWorks />
            <div className="container mx-auto px-4 py-20" id="marketplace">
               <Marketplace user={user} onAuthRequired={() => setIsLoginOpen(true)} />
            </div>
          </>
        );
      case 'dashboard': 
        return user ? <Dashboard user={user} onLogout={handleLogout} /> : <Hero onGetStarted={() => setIsLoginOpen(true)} />;
      case 'admin': 
        return user?.isAdmin ? <AdminDashboard user={user} /> : <Dashboard user={user!} onLogout={handleLogout} />;
      case 'transactions': 
        return user ? <TransactionHistory user={user} /> : <Hero onGetStarted={() => setIsLoginOpen(true)} />;
      case 'about': return <AboutUs />;
      case 'contact': return <ContactUs />;
      default: return <Hero onGetStarted={() => setIsLoginOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar user={user} currentView={currentView} onNavigate={navigateTo as any} onLogin={() => setIsLoginOpen(true)} onLogout={handleLogout} />
      <main className="flex-grow">{renderContent()}</main>
      <Footer onNavigate={navigateTo as any} />
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onSuccess={() => setIsLoginOpen(false)} />
    </div>
  );
};

export default App;
