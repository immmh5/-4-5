import React from 'react';
import { Navbar } from './Navbar';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { language, theme } = useApp();
  
  return (
    <div className={`flex min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white selection:bg-indigo-500/30 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      <Navbar />
      <main className="flex-1 relative overflow-hidden flex flex-col">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/5 blur-[120px] rounded-full" />
        </div>
        <motion.div
          key={language + theme}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative z-10 flex-1 flex flex-col"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
};
