import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Mic, LayoutDashboard, Settings, LogOut, User, Moon, Sun, ChevronRight, ChevronLeft, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { theme, setTheme, language, setLanguage, isSidebarCollapsed, setIsSidebarCollapsed, t, user } = useApp();
  const isGuest = user?.id?.startsWith('guest-');

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('idrak_token');
    localStorage.removeItem('idrak_user');
    window.location.href = '/';
  };

  const navItems = [
    { path: '/dashboard', icon: <LayoutDashboard size={20} />, label: t('nav.dashboard') },
    { path: '/settings', icon: <Settings size={20} />, label: t('nav.settings') },
  ];

  return (
    <aside 
      className={`bg-slate-50 dark:bg-slate-950 border-x border-slate-200 dark:border-white/5 flex flex-col h-screen sticky top-0 z-50 transition-all duration-300 ${
        isSidebarCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <Link 
        to="/" 
        className={`p-6 flex items-center hover:opacity-80 transition-opacity ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`}
      >
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 shrink-0">
          <Mic size={20} />
        </div>
        {!isSidebarCollapsed && (
          <span className="text-xl font-black tracking-tighter text-slate-900 dark:text-white">IDRAK</span>
        )}
      </Link>

      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            title={isSidebarCollapsed ? item.label : ''}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
              location.pathname === item.path
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
            } ${isSidebarCollapsed ? 'justify-center' : ''}`}
          >
            <span className="shrink-0">{item.icon}</span>
            {!isSidebarCollapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-white/5 space-y-4">
        {/* Theme & Lang Toggles */}
        <div className={`flex items-center gap-2 ${isSidebarCollapsed ? 'flex-col' : 'justify-between'}`}>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-xl bg-slate-200 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-indigo-500 transition-colors"
            title={t('settings.theme')}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="p-2 rounded-xl bg-slate-200 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-indigo-500 transition-colors flex items-center gap-2"
            title={t('settings.lang')}
          >
            <Globe size={20} />
            {!isSidebarCollapsed && <span className="text-xs font-black uppercase">{language === 'ar' ? 'EN' : 'AR'}</span>}
          </button>
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-2 rounded-xl bg-slate-200 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-indigo-500 transition-colors"
          >
            {isSidebarCollapsed ? (language === 'ar' ? <ChevronLeft size={20} /> : <ChevronRight size={20} />) : (language === 'ar' ? <ChevronRight size={20} /> : <ChevronLeft size={20} />)}
          </button>
        </div>

        <div className={`flex items-center gap-3 px-4 py-3 bg-slate-200 dark:bg-white/5 rounded-2xl border border-slate-300 dark:border-white/5 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 bg-slate-300 dark:bg-slate-800 rounded-full flex items-center justify-center text-indigo-500 shrink-0">
            <User size={20} />
          </div>
          {!isSidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.username}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">
                {isGuest ? t('nav.guest') : t('nav.user')}
              </p>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-red-500 hover:bg-red-500/10 transition-all ${isSidebarCollapsed ? 'justify-center' : ''}`}
          title={isSidebarCollapsed ? t('nav.logout') : ''}
        >
          <LogOut size={20} className="shrink-0" />
          {!isSidebarCollapsed && <span>{t('nav.logout')}</span>}
        </button>
      </div>
    </aside>
  );
};
