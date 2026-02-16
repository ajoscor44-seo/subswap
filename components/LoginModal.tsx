
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  if (!isOpen) return null;

  const validateUsername = (name: string) => {
    return name.length >= 3 && /^[a-zA-Z0-9_]+$/.test(name);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        if (!validateUsername(username)) {
          throw new Error("Username must be at least 3 characters and contain only letters, numbers, or underscores.");
        }

        const { data: authData, error: signUpError } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: { 
              username: username.toLowerCase(),
              name: username
            }
          }
        });

        if (signUpError) throw signUpError;
        
        // If Supabase returns a session, the user is logged in (auto-confirm is on)
        if (authData.session) {
          onSuccess();
        } else {
          // Email confirmation is likely required
          setSignUpSuccess(true);
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        onSuccess();
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      setError(err.message || "An unexpected error occurred. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  if (signUpSuccess) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
        <div className="bg-white w-full max-w-md rounded-[2.5rem] p-12 shadow-2xl text-center border border-slate-100 animate-in zoom-in-95 duration-300">
          <div className="h-20 w-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-6 shadow-sm">
            <i className="fa-solid fa-paper-plane"></i>
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-4">Check your email!</h2>
          <p className="text-slate-500 font-medium mb-8 leading-relaxed">
            We've sent a verification link to <span className="text-slate-900 font-bold">{email}</span>. 
            Please confirm your email to start saving on SubSwap.
          </p>
          <button 
            onClick={onClose}
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-indigo-600 transition-all"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl relative animate-in zoom-in-95 duration-300 border border-slate-100">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>

        <div className="text-center mb-8">
          <div className="h-14 w-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black mx-auto mb-4 shadow-lg shadow-indigo-100">S</div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-slate-500 font-medium text-sm mt-1">
            {isSignUp ? 'Join the smart community of savers.' : 'Securely manage your shared access.'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-xs font-bold border border-red-100 flex items-start gap-3">
              <i className="fa-solid fa-triangle-exclamation mt-0.5"></i>
              <span>{error}</span>
            </div>
          )}
          
          {isSignUp && (
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 block mb-1.5">Choose Username</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold">@</span>
                <input 
                  type="text" 
                  required
                  placeholder="nigerian_saver"
                  className="w-full bg-slate-50 border border-slate-200 p-4 pl-9 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all placeholder:text-slate-300"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 block mb-1.5">Email Address</label>
            <input 
              type="email" 
              required
              placeholder="name@email.com"
              className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 block mb-1.5">Password</label>
            <input 
              type="password" 
              required
              placeholder="••••••••"
              className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 text-white py-4.5 rounded-xl font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-100 disabled:opacity-50 mt-4"
          >
            {loading ? <i className="fa-solid fa-spinner fa-spin mr-2"></i> : null}
            {isSignUp ? 'Start Saving' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
            className="text-xs font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            {isSignUp ? 'Already have an account? Login' : 'New here? Create Account'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
