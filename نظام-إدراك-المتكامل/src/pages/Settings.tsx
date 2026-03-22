import React from 'react';
import { Layout } from '../components/Layout';
import { 
  User, Shield, Moon, Sun, Languages, 
  Cpu, Save, Mic, Bell, Download, Trash2, 
  ChevronRight, Check, Sparkles, Zap
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';

export const Settings: React.FC = () => {
  const { 
    theme, setTheme, 
    language, setLanguage, 
    aiModel, setAiModel,
    autoSave, setAutoSave,
    voiceEnabled, setVoiceEnabled,
    t, user 
  } = useApp();
  
  const isGuest = user?.id?.startsWith('guest-');
  const isRTL = language === 'ar';

  const sections = [
    {
      id: 'account',
      title: t('settings.account'),
      icon: <User size={20} className="text-indigo-500" />,
      items: [
        { label: isRTL ? 'اسم المستخدم' : 'Username', value: user.username, type: 'text' },
        { label: isRTL ? 'نوع الحساب' : 'Account Type', value: isGuest ? (isRTL ? 'ضيف' : 'Guest') : (isRTL ? 'مستخدم مسجل' : 'Registered User'), type: 'text' },
      ]
    },
    {
      id: 'preferences',
      title: t('settings.preferences'),
      icon: <Moon size={20} className="text-purple-500" />,
      items: [
        { 
          label: t('settings.theme'), 
          value: theme === 'dark' ? (isRTL ? 'داكن' : 'Dark') : (isRTL ? 'فاتح' : 'Light'),
          action: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
          icon: theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />,
          type: 'button'
        },
        { 
          label: t('settings.lang'), 
          value: language === 'ar' ? 'العربية' : 'English',
          action: () => setLanguage(language === 'ar' ? 'en' : 'ar'),
          icon: <Languages size={18} />,
          type: 'button'
        },
      ]
    },
    {
      id: 'ai',
      title: t('settings.ai'),
      icon: <Cpu size={20} className="text-blue-500" />,
      items: [
        { 
          label: t('settings.ai_model'), 
          value: aiModel === 'gemini-3-flash-preview' ? 'Flash (Fast)' : 'Pro (Smart)',
          options: [
            { id: 'gemini-3-flash-preview', label: 'Flash', desc: isRTL ? 'سريع ومثالي للمهام البسيطة' : 'Fast, ideal for simple tasks' },
            { id: 'gemini-3.1-pro-preview', label: 'Pro', desc: isRTL ? 'أذكى وأفضل للمهام المعقدة' : 'Smarter, best for complex tasks' }
          ],
          current: aiModel,
          action: (val: any) => setAiModel(val),
          type: 'select'
        },
      ]
    },
    {
      id: 'features',
      title: isRTL ? 'الميزات المتقدمة' : 'Advanced Features',
      icon: <Zap size={20} className="text-amber-500" />,
      items: [
        { 
          label: t('settings.auto_save'), 
          value: autoSave,
          action: () => setAutoSave(!autoSave),
          type: 'toggle',
          icon: <Save size={18} />
        },
        { 
          label: t('settings.voice'), 
          value: voiceEnabled,
          action: () => setVoiceEnabled(!voiceEnabled),
          type: 'toggle',
          icon: <Mic size={18} />
        },
      ]
    },
    {
      id: 'data',
      title: t('settings.export'),
      icon: <Download size={20} className="text-emerald-500" />,
      items: [
        { 
          label: isRTL ? 'تصدير جميع الجلسات' : 'Export All Sessions', 
          action: () => alert(isRTL ? 'جاري تجهيز البيانات...' : 'Preparing data...'),
          icon: <Download size={18} />,
          type: 'action'
        },
      ]
    },
    {
      id: 'danger',
      title: t('settings.danger'),
      icon: <Trash2 size={20} className="text-red-500" />,
      items: [
        { 
          label: t('settings.delete_account'), 
          action: () => confirm(isRTL ? 'هل أنت متأكد؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure? This action cannot be undone.') && alert('Account deleted'),
          icon: <Trash2 size={18} />,
          type: 'action',
          danger: true
        },
      ]
    }
  ];

  return (
    <Layout>
      <div className="p-8 max-w-5xl mx-auto pb-24">
        <header className="mb-12">
          <h1 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white mb-4">
            {t('settings.title')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">
            {isRTL ? 'قم بتخصيص تجربة إدراك الخاصة بك لتناسب احتياجاتك.' : 'Customize your Idrak experience to fit your needs.'}
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar Navigation (Optional for desktop) */}
          <div className="lg:col-span-1 space-y-2 hidden lg:block">
            {sections.map((section) => (
              <a 
                key={section.id} 
                href={`#${section.id}`}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-slate-600 dark:text-slate-400 font-bold"
              >
                {section.icon}
                {section.title}
              </a>
            ))}
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-2 space-y-8">
            {sections.map((section, i) => (
              <motion.div 
                key={i} 
                id={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-[32px] p-8 border border-slate-200 dark:border-white/5 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-slate-100 dark:bg-white/5 rounded-xl flex items-center justify-center">
                    {section.icon}
                  </div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{section.title}</h2>
                </div>

                <div className="space-y-4">
                  {section.items.map((item: any, j) => (
                    <div key={j} className="group">
                      <div className="flex items-center justify-between py-4 px-2 rounded-2xl transition-colors">
                        <div className="flex items-center gap-4">
                          {item.icon && <div className="text-slate-400 group-hover:text-indigo-500 transition-colors">{item.icon}</div>}
                          <span className="text-slate-700 dark:text-slate-300 font-bold">{item.label}</span>
                        </div>

                        <div className="flex items-center gap-4">
                          {item.type === 'text' && (
                            <span className="text-slate-900 dark:text-white font-black bg-slate-100 dark:bg-white/5 px-4 py-2 rounded-xl text-sm">
                              {item.value}
                            </span>
                          )}

                          {item.type === 'button' && (
                            <button 
                              onClick={item.action}
                              className="flex items-center gap-3 px-4 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl hover:border-indigo-500/50 transition-all text-slate-900 dark:text-white font-black text-sm"
                            >
                              {item.value}
                              <ChevronRight size={16} className={isRTL ? "rotate-180" : ""} />
                            </button>
                          )}

                          {item.type === 'toggle' && (
                            <button 
                              onClick={item.action}
                              className={`w-12 h-6 rounded-full transition-all relative ${item.value ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-white/10'}`}
                            >
                              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isRTL ? (item.value ? 'left-1' : 'left-7') : (item.value ? 'left-7' : 'left-1')}`} />
                            </button>
                          )}

                          {item.type === 'action' && (
                            <button 
                              onClick={item.action}
                              className={`px-4 py-2 rounded-xl font-black text-sm transition-all flex items-center gap-2 ${item.danger ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-indigo-600/10 text-indigo-600 hover:bg-indigo-600 hover:text-white'}`}
                            >
                              {item.label}
                            </button>
                          )}
                        </div>
                      </div>

                      {item.type === 'select' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 px-2">
                          {item.options.map((opt: any) => (
                            <button
                              key={opt.id}
                              onClick={() => item.action(opt.id)}
                              className={`p-4 rounded-2xl border text-right transition-all flex flex-col gap-1 ${item.current === opt.id ? 'bg-indigo-600/10 border-indigo-500 ring-1 ring-indigo-500' : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10'}`}
                            >
                              <div className="flex items-center justify-between">
                                <span className={`font-black ${item.current === opt.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-white'}`}>{opt.label}</span>
                                {item.current === opt.id && <Check size={16} className="text-indigo-600 dark:text-indigo-400" />}
                              </div>
                              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{opt.desc}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {isGuest && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-12 p-12 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[48px] text-center shadow-2xl shadow-indigo-500/30 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <Sparkles className="absolute top-10 left-10 w-20 h-20" />
              <Zap className="absolute bottom-10 right-10 w-20 h-20" />
            </div>
            <h3 className="text-3xl md:text-4xl font-black mb-6 text-white tracking-tighter">
              {isRTL ? 'هل أعجبك إدراك؟' : 'Do you like Idrak?'}
            </h3>
            <p className="text-indigo-100 mb-10 max-w-xl mx-auto font-medium text-lg leading-relaxed">
              {isRTL 
                ? 'سجل حساباً الآن لحفظ جميع جلساتك التعليمية بشكل دائم والوصول إليها من أي مكان مع ميزات الذكاء الاصطناعي المتقدمة.' 
                : 'Sign up now to save all your educational sessions permanently and access them from anywhere with advanced AI features.'}
            </p>
            <button 
              onClick={() => {
                localStorage.removeItem('idrak_token');
                localStorage.removeItem('idrak_user');
                window.location.href = '/auth';
              }}
              className="px-10 py-5 bg-white text-indigo-600 rounded-2xl font-black text-xl hover:bg-indigo-50 transition-all shadow-xl hover:scale-105 active:scale-95"
            >
              {isRTL ? 'إنشاء حساب دائم' : 'Create Permanent Account'}
            </button>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};
