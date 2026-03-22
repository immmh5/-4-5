import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogIn, UserPlus, Shield, Loader2, Mic, ArrowRight, UserCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';

export const Auth: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, language, t } = useApp();
  const isRTL = language === 'ar';
  
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('guest') === 'true') {
      handleGuestLogin();
    }
  }, [location]);

  const handleGuestLogin = () => {
    const guestUser = { id: 'guest-' + Math.random().toString(36).substr(2, 9), username: isRTL ? 'ضيف' : 'Guest' };
    localStorage.setItem('idrak_token', 'guest-token');
    localStorage.setItem('idrak_user', JSON.stringify(guestUser));
    window.location.href = '/dashboard';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const email = `${username}@system.com`;

    try {
      if (isLogin) {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (authError) throw authError;
        if (data.session && data.user) {
          localStorage.setItem('idrak_token', data.session.access_token);
          localStorage.setItem('idrak_user', JSON.stringify({ id: data.user.id, username }));
          window.location.href = '/dashboard';
        }
      } else {
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username
            }
          }
        });
        if (authError) throw authError;
        setIsLogin(true);
        setError(isRTL ? 'تم التسجيل بنجاح! يمكنك الآن تسجيل الدخول' : 'Registration successful! You can now login');
      }
    } catch (err: any) {
      setError(err.message || (isRTL ? 'حدث خطأ ما' : 'Something went wrong'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-white dark:bg-slate-950 p-4 transition-colors duration-300 selection:bg-indigo-500/30 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-slate-100 dark:bg-slate-900/50 backdrop-blur-xl rounded-[32px] p-8 shadow-2xl border border-slate-200 dark:border-white/10 relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-indigo-500/20">
            <Mic size={32} />
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">
            {isLogin ? t('auth.login') : t('auth.signup')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-center font-medium">
            {isLogin 
              ? (isRTL ? 'أهلاً بك مجدداً في إدراك' : 'Welcome back to Idrak') 
              : (isRTL ? 'انضم إلينا اليوم وابدأ رحلتك التعليمية' : 'Join us today and start your learning journey')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 mx-1">{t('auth.username')}</label>
            <input 
              type="text" 
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-2xl py-4 px-6 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
              placeholder={isRTL ? "أدخل اسم المستخدم" : "Enter username"}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 mx-1">{t('auth.password')}</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-2xl py-4 px-6 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className={`text-xs font-bold text-center ${error.includes('بنجاح') || error.includes('successful') ? "text-emerald-500" : "text-red-500"}`}>
              {error}
            </p>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white rounded-2xl py-4 font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-500/20"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? <LogIn size={20} /> : <UserPlus size={20} />)}
            {isLogin ? t('auth.submit.login') : t('auth.submit.signup')}
          </button>
        </form>

        <div className="mt-4">
          <button 
            onClick={handleGuestLogin}
            className="w-full bg-slate-200 dark:bg-white/5 text-slate-900 dark:text-white border border-slate-300 dark:border-white/10 rounded-2xl py-4 font-bold hover:bg-slate-300 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-2"
          >
            <UserCircle size={20} />
            {t('auth.guest')}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/5 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-colors"
          >
            {isLogin 
              ? (isRTL ? 'ليس لديك حساب؟ سجل الآن' : "Don't have an account? Sign up") 
              : (isRTL ? 'لديك حساب بالفعل؟ سجل دخولك' : 'Already have an account? Login')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

