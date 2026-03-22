import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'dark' | 'light';
type Language = 'ar' | 'en';
type AIModel = 'gemini-3-flash-preview' | 'gemini-3.1-pro-preview';

interface AppContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  aiModel: AIModel;
  setAiModel: (model: AIModel) => void;
  autoSave: boolean;
  setAutoSave: (autoSave: boolean) => void;
  voiceEnabled: boolean;
  setVoiceEnabled: (enabled: boolean) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  user: any;
  setUser: (user: any) => void;
  loading: boolean;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  ar: {
    'nav.dashboard': 'لوحة التحكم',
    'nav.settings': 'الإعدادات',
    'nav.logout': 'تسجيل الخروج',
    'nav.guest': 'حساب ضيف',
    'nav.user': 'مستخدم',
    'landing.title': 'حول كلماتك إلى معرفة رقمية',
    'landing.subtitle': 'إدراك هو السبورة الذكية التي تفهمك. سجل محاضراتك، لخص أفكارك، وأنشئ اختبارات تفاعلية فورية.',
    'landing.start': 'ابدأ الآن',
    'landing.guest': 'دخول كضيف',
    'landing.login': 'تسجيل الدخول',
    'auth.login': 'تسجيل الدخول',
    'auth.signup': 'إنشاء حساب جديد',
    'auth.username': 'اسم المستخدم',
    'auth.password': 'كلمة المرور',
    'auth.submit.login': 'دخول',
    'auth.submit.signup': 'تسجيل',
    'auth.guest': 'دخول كضيف',
    'dash.welcome': 'مرحباً،',
    'dash.sessions': 'جلسات تعليمية مخزنة',
    'dash.search': 'بحث في جلساتك...',
    'dash.new': 'جلسة جديدة',
    'dash.guest_msg': 'أنت تستخدم وضع الضيف. سيتم حفظ بياناتك محلياً فقط.',
    'dash.empty': 'لا توجد جلسات بعد',
    'board.new': 'جلسة جديدة',
    'board.save': 'حفظ',
    'board.summary': 'ملخص ذكي',
    'board.assistant': 'المساعد الذكي',
    'board.quiz': 'اختبار ذكي',
    'board.ask': 'اسأل المساعد...',
    'board.thinking': 'جاري التفكير...',
    'board.analyzing': 'جاري التحليل...',
    'board.upload': 'رفع ملف صوتي',
    'settings.title': 'الإعدادات',
    'settings.account': 'الحساب',
    'settings.preferences': 'التفضيلات',
    'settings.security': 'الأمان',
    'settings.theme': 'المظهر',
    'settings.lang': 'اللغة',
    'settings.ai': 'الذكاء الاصطناعي',
    'settings.ai_model': 'نموذج الذكاء الاصطناعي',
    'settings.auto_save': 'الحفظ التلقائي',
    'settings.voice': 'الأوامر الصوتية',
    'settings.notifications': 'التنبيهات',
    'settings.export': 'تصدير البيانات',
    'settings.danger': 'منطقة الخطر',
    'settings.delete_account': 'حذف الحساب',
  },
  en: {
    'nav.dashboard': 'Dashboard',
    'nav.settings': 'Settings',
    'nav.logout': 'Logout',
    'nav.guest': 'Guest Account',
    'nav.user': 'User',
    'landing.title': 'Turn your words into digital knowledge',
    'landing.subtitle': 'Idrak is the smart board that understands you. Record lectures, summarize ideas, and create instant interactive quizzes.',
    'landing.start': 'Start Now',
    'landing.guest': 'Guest Access',
    'landing.login': 'Login',
    'auth.login': 'Login',
    'auth.signup': 'Sign Up',
    'auth.username': 'Username',
    'auth.password': 'Password',
    'auth.submit.login': 'Login',
    'auth.submit.signup': 'Sign Up',
    'auth.guest': 'Guest Access',
    'dash.welcome': 'Welcome,',
    'dash.sessions': 'stored educational sessions',
    'dash.search': 'Search your sessions...',
    'dash.new': 'New Session',
    'dash.guest_msg': 'You are in guest mode. Your data will be saved locally only.',
    'dash.empty': 'No sessions yet',
    'board.new': 'New Session',
    'board.save': 'Save',
    'board.summary': 'AI Summary',
    'board.assistant': 'AI Assistant',
    'board.quiz': 'AI Quiz',
    'board.ask': 'Ask Assistant...',
    'board.thinking': 'Thinking...',
    'board.analyzing': 'Analyzing...',
    'board.upload': 'Upload Audio File',
    'settings.title': 'Settings',
    'settings.account': 'Account',
    'settings.preferences': 'Preferences',
    'settings.security': 'Security',
    'settings.theme': 'Theme',
    'settings.lang': 'Language',
    'settings.ai': 'Artificial Intelligence',
    'settings.ai_model': 'AI Model',
    'settings.auto_save': 'Auto Save',
    'settings.voice': 'Voice Commands',
    'settings.notifications': 'Notifications',
    'settings.export': 'Export Data',
    'settings.danger': 'Danger Zone',
    'settings.delete_account': 'Delete Account',
  }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

import { supabase } from '../lib/supabase';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('idrak_theme') as Theme) || 'dark');
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('idrak_lang') as Language) || 'ar');
  const [aiModel, setAiModel] = useState<AIModel>(() => (localStorage.getItem('idrak_ai_model') as AIModel) || 'gemini-3-flash-preview');
  const [autoSave, setAutoSave] = useState<boolean>(() => localStorage.getItem('idrak_auto_save') !== 'false');
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(() => localStorage.getItem('idrak_voice_enabled') === 'true');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => localStorage.getItem('idrak_sidebar_collapsed') === 'true');
  const [user, setUser] = useState<any>(() => JSON.parse(localStorage.getItem('idrak_user') || 'null'));
  const [loading, setLoading] = useState(true);

  // Initial session check
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const userData = { 
          id: session.user.id, 
          username: session.user.user_metadata.username || session.user.email?.split('@')[0] 
        };
        setUser(userData);
        localStorage.setItem('idrak_user', JSON.stringify(userData));
        localStorage.setItem('idrak_token', session.access_token);

        // Sync settings from metadata if they exist
        const metaTheme = session.user.user_metadata.theme as Theme;
        const metaLang = session.user.user_metadata.language as Language;
        const metaAI = session.user.user_metadata.aiModel as AIModel;
        const metaAutoSave = session.user.user_metadata.autoSave as boolean;
        const metaVoice = session.user.user_metadata.voiceEnabled as boolean;
        
        if (metaTheme) setTheme(metaTheme);
        if (metaLang) setLanguage(metaLang);
        if (metaAI) setAiModel(metaAI);
        if (typeof metaAutoSave === 'boolean') setAutoSave(metaAutoSave);
        if (typeof metaVoice === 'boolean') setVoiceEnabled(metaVoice);
      }
      setLoading(false);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const userData = { 
          id: session.user.id, 
          username: session.user.user_metadata.username || session.user.email?.split('@')[0] 
        };
        setUser(userData);
        localStorage.setItem('idrak_user', JSON.stringify(userData));
        localStorage.setItem('idrak_token', session.access_token);
      } else if (_event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('idrak_user');
        localStorage.removeItem('idrak_token');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sync theme to Supabase
  useEffect(() => {
    localStorage.setItem('idrak_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Update Supabase metadata if logged in and not guest
    if (user && !user.id.startsWith('guest-')) {
      supabase.auth.updateUser({ data: { theme } }).catch(console.error);
    }
  }, [theme]); // Removed user to prevent infinite loop

  // Sync language to Supabase
  useEffect(() => {
    localStorage.setItem('idrak_lang', language);
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;

    if (user && !user.id.startsWith('guest-')) {
      supabase.auth.updateUser({ data: { language } }).catch(console.error);
    }
  }, [language]); // Removed user to prevent infinite loop

  useEffect(() => {
    localStorage.setItem('idrak_sidebar_collapsed', String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  useEffect(() => {
    localStorage.setItem('idrak_ai_model', aiModel);
    if (user && !user.id.startsWith('guest-')) {
      supabase.auth.updateUser({ data: { aiModel } }).catch(console.error);
    }
  }, [aiModel]); // Removed user to prevent infinite loop

  useEffect(() => {
    localStorage.setItem('idrak_auto_save', String(autoSave));
    if (user && !user.id.startsWith('guest-')) {
      supabase.auth.updateUser({ data: { autoSave } }).catch(console.error);
    }
  }, [autoSave]); // Removed user to prevent infinite loop

  useEffect(() => {
    localStorage.setItem('idrak_voice_enabled', String(voiceEnabled));
    if (user && !user.id.startsWith('guest-')) {
      supabase.auth.updateUser({ data: { voiceEnabled } }).catch(console.error);
    }
  }, [voiceEnabled]); // Removed user to prevent infinite loop

  const t = (key: string) => translations[language][key] || key;

  return (
    <AppContext.Provider value={{ 
      theme, setTheme, 
      language, setLanguage, 
      aiModel, setAiModel,
      autoSave, setAutoSave,
      voiceEnabled, setVoiceEnabled,
      isSidebarCollapsed, setIsSidebarCollapsed, 
      user, setUser,
      loading,
      t 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
