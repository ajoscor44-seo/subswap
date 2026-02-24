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
import { Features } from './components/Features';
import { Faq } from './components/Faq';
import { PopularServices } from './components/PopularServices';
import TransactionHistory from './components/TransactionHistory';

type ViewState = 'home' | 'dashboard' | 'admin' | 'settings' | 'about' | 'contact' | 'transactions';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [dashboardTab, setDashboardTab] = useState<string>('overview');
  
  const syncViewWithHash = useCallback((targetUser: User | null) => {
    const hash = window.location.hash.replace('#/', '') as ViewState;
    const validViews: ViewState[] = ['home', 'dashboard', 'admin', 'about', 'contact', 'transactions', 'settings'];
    
    if (hash && validViews.includes(hash)) {
      if (hash === 'admin' && !targetUser?.isAdmin) {
        setCurrentView('dashboard');
      } else if ((hash === 'dashboard' || hash === 'transactions' || hash === 'settings') && !targetUser) {
        setCurrentView('home');
      } else {
        setCurrentView(hash);
      }
    } else {
      // Default behavior: If no hash, keep on home if not logged in, or go to dashboard if logged in
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

      if (error) {
        console.error("Profile fetch error:", error.message);
        return {
          id: userId,
          email: email,
          name: email.split('@')[0],
          username: email.split('@')[0],
          avatar: `https://ui-avatars.com/api/?name=${email}&background=6366f1&color=fff`,
          balance: 0,
          isAdmin: email.toLowerCase() === 'joscor@wsv.com.ng',
          isVerified: false,
          hasDeposited: false,
          totalSaved: 0
        };
      }

      if (data.is_banned) {
        await supabase.auth.signOut();
        return null;
      }

      const isTargetAdmin = email.toLowerCase() === 'joscor@wsv.com.ng' || data.role === 'admin';
      
      return {
        id: data.id,
        email: email,
        name: data.name || data.username || email.split('@')[0],
        username: data.username || 'user_' + data.id.slice(0, 4),
        avatar: data.avatar || `https://ui-avatars.com/api/?name=${data.name || email}&background=6366f1&color=fff`,
        balance: Number(data.balance) || 0,
        isAdmin: isTargetAdmin,
        isVerified: Boolean(data.is_verified),
        hasDeposited: Boolean(data.has_deposited),
        totalSaved: Number(data.total_saved) || 0,
        is_banned: Boolean(data.is_banned)
      };
    } catch (err) {
      console.error("Unexpected error fetching profile:", err);
      return null;
    }
  };

  const refreshUserData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const profile = await fetchProfile(session.user.id, session.user.email!);
      setUser(profile);
      return profile;
    }
    return null;
  };

  useEffect(() => {
    const initApp = async () => {
      setLoading(true);
      const profile = await refreshUserData();
      syncViewWithHash(profile);
      setLoading(false);
    };

    initApp();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          const profile = await fetchProfile(session.user.id, session.user.email!);
          setUser(profile);
          if (event === 'SIGNED_IN') {
            syncViewWithHash(profile);
            setIsLoginOpen(false);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setCurrentView('home');
        window.location.hash = '';
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [syncViewWithHash]);

  const handleLogout = async () => {
    // Force clear session to prevent cookie staleness
    await supabase.auth.signOut({ scope: 'global' });
    setUser(null);
    setCurrentView('home');
    window.location.hash = '';
  };

  const navigateTo = (view: ViewState, tab?: string) => {
    setCurrentView(view);
    if (tab) setDashboardTab(tab);
    window.location.hash = `#/${view}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePurchaseSuccess = () => {
    refreshUserData();
    navigateTo('dashboard', 'stacks');
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex-grow flex items-center justify-center">
          <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    switch (currentView) {
      case 'home':
        return (
          <div className="animate-in fade-in duration-700">
            <Hero onGetStarted={() => user ? navigateTo('dashboard') : setIsLoginOpen(true)} />
            <PopularServices />
            <HowItWorks />
            <Features />
            <div className="container mx-auto px-4 py-20" id="marketplace">
               <div className="text-center mb-16 max-w-2xl mx-auto">
                 <h2 className="text-sm font-black text-indigo-600 uppercase tracking-[0.3em] mb-4">Marketplace</h2>
                 <h3 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Available Premium Stacks</h3>
               </div>
               <Marketplace 
                 user={user} 
                 onAuthRequired={() => setIsLoginOpen(true)} 
                 onPurchaseSuccess={handlePurchaseSuccess}
               />
            </div>
            <Faq />
          </div>
        );
      case 'dashboard': 
      case 'settings':
        return user ? (
          <Dashboard 
            user={user} 
            onLogout={handleLogout} 
            initialTab={(currentView === 'settings' ? 'settings' : dashboardTab) as any} 
            onPurchaseSuccess={handlePurchaseSuccess}
          />
        ) : <Hero onGetStarted={() => setIsLoginOpen(true)} />;
      case 'admin': 
        return user?.isAdmin ? (
          <AdminDashboard user={user} onRefreshUser={refreshUserData} />
        ) : (
          user ? <Dashboard user={user} onLogout={handleLogout} /> : <Hero onGetStarted={() => setIsLoginOpen(true)} />
        );
      case 'transactions': 
        return user ? <TransactionHistory user={user} /> : <Hero onGetStarted={() => setIsLoginOpen(true)} />;
      case 'about': return <AboutUs />;
      case 'contact': return <ContactUs />;
      default: return (
        <Hero onGetStarted={() => user ? navigateTo('dashboard') : setIsLoginOpen(true)} />
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar user={user} currentView={currentView} onNavigate={navigateTo as any} onLogin={() => setIsLoginOpen(true)} onLogout={handleLogout} />
      <main className="flex-grow">{renderContent()}</main>
      <Footer onNavigate={navigateTo as any} />
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        onSuccess={() => {
          // Modal closing is now handled by onAuthStateChange for SIGNED_IN
          // but we keep this as a fallback and to refresh data if needed
          refreshUserData().then(p => {
            syncViewWithHash(p);
            setIsLoginOpen(false);
          });
        }} 
      />
    </div>
  );
};

export default App;