import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Clock, Trash2, ChevronRight, LayoutGrid, List, Sparkles, Mic, Loader2, Database, FileText, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Layout } from '../components/Layout';
import { useApp } from '../context/AppContext';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { t, language, user } = useApp();
  const isGuest = user?.id?.startsWith('guest-');
  
  const [items, setItems] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setIsLoading(true);
    if (isGuest) {
      const saved = localStorage.getItem('idrak_guest_items');
      if (saved) setItems(JSON.parse(saved));
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(language === 'ar' ? 'هل أنت متأكد؟' : 'Are you sure?')) return;

    if (isGuest) {
      const newItems = items.filter(i => i.id !== id);
      setItems(newItems);
      localStorage.setItem('idrak_guest_items', JSON.stringify(newItems));
      return;
    }

    try {
      const { error } = await supabase.from('items').delete().eq('id', id);
      if (error) throw error;
      setItems(items.filter(i => i.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="p-8 max-w-7xl mx-auto space-y-10">
        {/* Welcome Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-white">
              {t('dash.welcome')} <span className="text-indigo-600">{user.username}</span>
            </h1>
            <p className="text-slate-500 font-bold flex items-center gap-2">
              <Clock size={16} />
              {language === 'ar' ? `لديك ${items.length} جلسات تعليمية مخزنة` : `You have ${items.length} stored sessions`}
            </p>
          </div>
          
          <button 
            onClick={() => navigate('/board/new')}
            className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-[24px] font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 hover:scale-105 active:scale-95"
          >
            <Plus size={24} />
            {t('dash.new')}
          </button>
        </header>

        {isGuest && (
          <div className="bg-indigo-600/10 border border-indigo-500/20 p-4 rounded-2xl flex items-center gap-3 text-indigo-600 dark:text-indigo-400 font-bold">
            <Sparkles size={20} />
            {t('dash.guest_msg')}
          </div>
        )}

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className={cn("absolute top-1/2 -translate-y-1/2 text-slate-400", language === 'ar' ? "right-4" : "left-4")} size={20} />
            <input 
              type="text"
              placeholder={t('dash.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-[20px] py-4 focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-slate-900 dark:text-white",
                language === 'ar' ? "pr-12 pl-6" : "pl-12 pr-6"
              )}
            />
          </div>
          <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-[20px] border border-slate-200 dark:border-white/5">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-white/10 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-400'}`}
            >
              <LayoutGrid size={20} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white dark:bg-white/10 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-400'}`}
            >
              <List size={20} />
            </button>
          </div>
        </div>

        {/* Items Grid/List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-slate-100 dark:bg-white/5 rounded-[32px] animate-pulse" />
            ))}
          </div>
        ) : filteredItems.length > 0 ? (
          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            <AnimatePresence>
              {filteredItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => navigate(`/board/${item.id}`)}
                  className={`group relative bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 hover:border-indigo-500/50 transition-all cursor-pointer overflow-hidden ${
                    viewMode === 'grid' ? 'rounded-[32px] p-8 h-64 flex flex-col' : 'rounded-2xl p-6 flex items-center justify-between'
                  }`}
                >
                  <div className={viewMode === 'grid' ? 'flex-1' : 'flex items-center gap-6'}>
                    <div className="w-12 h-12 bg-indigo-600/10 rounded-2xl flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-110 transition-transform">
                      <FileText size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 group-hover:text-indigo-500 transition-colors">{item.title}</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 font-medium">{item.content}</p>
                    </div>
                  </div>
                  
                  <div className={`flex items-center justify-between mt-4 ${viewMode === 'list' ? 'mt-0' : ''}`}>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {new Date(item.created_at).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                    </span>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => handleDelete(item.id, e)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={18} />
                      </button>
                      <ChevronRight size={20} className={cn("text-slate-300 transition-transform", language === 'ar' ? "group-hover:-translate-x-1 rotate-180" : "group-hover:translate-x-1")} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-32 bg-slate-100 dark:bg-white/5 rounded-[48px] border-2 border-dashed border-slate-200 dark:border-white/10">
            <div className="w-20 h-20 bg-slate-200 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
              <Database size={32} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{t('dash.empty')}</h3>
            <p className="text-slate-500 font-bold">{language === 'ar' ? 'ابدأ أول جلسة تعليمية لك الآن' : 'Start your first session now'}</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
