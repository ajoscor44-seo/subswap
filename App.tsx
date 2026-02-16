
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
import TransactionHistory from './components/TransactionHistory';

type ViewState = 'home' | 'dashboard' | 'admin' | 'settings' | 'about' | 'contact' | 'transactions';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const fetchProfile = async (userId: string, email: string, retryCount = 0): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (retryCount < 2) {
          await new Promise(resolve => setTimeout(resolve, 500));
          return fetchProfile(userId, email, retryCount + 1);
        }
        return null;
      }

      if (data) {
        // If user is banned, force signout
        if (data.is_banned) {
          await supabase.auth.signOut();
          alert("Your account has been suspended for violating terms of service.");
          setUser(null);
          setCurrentView('home');
          return null;
        }

        const isTargetAdmin = email.toLowerCase() === 'joscor@wsv.com.ng';
        
        const mappedUser: User = {
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
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const profile = await fetchProfile(session.user.id, session.user.email!);
          const hash = window.location.hash.replace('#/', '') as ViewState;
          
          if (profile) {
            if (hash === 'admin' && !profile.isAdmin) {
              setCurrentView('dashboard');
            } else if (hash && ['home', 'dashboard', 'admin', 'about', 'contact', 'transactions'].includes(hash)) {
              setCurrentView(hash);
            } else {
              setCurrentView(profile.isAdmin ? 'admin' : 'dashboard');
            }
          }
        }
      } finally {
        setIsAuthLoading(false);
      }
    };

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const profile = await fetchProfile(session.user.id, session.user.email!);
        if (profile) setCurrentView(profile.isAdmin ? 'admin' : 'dashboard');
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setCurrentView('home');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCurrentView('home');
  };

  const navigateTo = (view: ViewState) => {
    setCurrentView(view);
    window.location.hash = `#/${view}`;
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
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
      case 'dashboard': return user ? <Dashboard user={user} onLogout={handleLogout} /> : (navigateTo('home'), null);
      case 'admin': return user?.isAdmin ? <AdminDashboard user={user} /> : (navigateTo('dashboard'), null);
      case 'transactions': return user ? <TransactionHistory user={user} /> : (navigateTo('home'), null);
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
