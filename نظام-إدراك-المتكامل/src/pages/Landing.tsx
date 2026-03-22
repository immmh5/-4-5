import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mic, Sparkles, Shield, Zap, ArrowRight, Globe, Layout as LayoutIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Landing: React.FC = () => {
  const { theme, language, t, user, loading } = useApp();
  const isRTL = language === 'ar';

  return (
    <div className={`min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white overflow-hidden selection:bg-indigo-500/30 transition-colors duration-300 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 dark:bg-indigo-600/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 dark:bg-purple-600/20 blur-[120px] rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
            <Mic size={20} />
          </div>
          <span className="text-2xl font-black tracking-tighter">IDRAK</span>
        </div>
        <div className="flex items-center gap-4">
          {!loading && (
            <>
              {user ? (
                <Link to="/dashboard" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/25 text-white">
                  {t('nav.dashboard')}
                </Link>
              ) : (
                <>
                  <Link to="/auth" className="text-sm font-bold hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    {t('landing.login')}
                  </Link>
                  <Link to="/auth" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/25 text-white">
                    {t('landing.start')}
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-8 uppercase tracking-widest">
            <Sparkles size={14} />
            {isRTL ? 'مستقبل التعليم الذكي هنا' : 'The Future of Smart Learning is Here'}
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9] text-slate-900 dark:text-white">
            {isRTL ? (
              <>
                حول كلماتك إلى <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
                  معرفة رقمية
                </span>
              </>
            ) : (
              <>
                Turn your words into <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
                  Digital Knowledge
                </span>
              </>
            )}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
            {t('landing.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {!loading && (
              <Link to={user ? "/dashboard" : "/auth"} className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 rounded-2xl text-lg font-bold transition-all shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 group text-white">
                {user ? t('nav.dashboard') : (isRTL ? 'ابدأ مجاناً' : 'Start for Free')}
                <ArrowRight size={20} className={cn("transition-transform", isRTL ? "group-hover:-translate-x-1 rotate-180" : "group-hover:translate-x-1")} />
              </Link>
            )}
          </div>
        </motion.div>

        {/* Feature Grid */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 ${isRTL ? 'text-right' : 'text-left'}`}>
          {[
            {
              icon: <Mic className="text-indigo-600 dark:text-indigo-400" />,
              title: isRTL ? "تحويل الصوت الذكي" : "Smart Voice Transcription",
              desc: isRTL ? "تعرف دقيق على الكلام باللغتين العربية والإنجليزية مع دعم كامل للهجات." : "Accurate speech recognition in Arabic and English with full dialect support."
            },
            {
              icon: <Sparkles className="text-purple-600 dark:text-purple-400" />,
              title: isRTL ? "ملخصات فورية" : "Instant Summaries",
              desc: isRTL ? "حول ساعات من المحاضرات إلى نقاط رئيسية وخرائط ذهنية في ثوانٍ." : "Turn hours of lectures into key points and mind maps in seconds."
            },
            {
              icon: <Zap className="text-pink-600 dark:text-pink-400" />,
              title: isRTL ? "اختبارات تفاعلية" : "Interactive Quizzes",
              desc: isRTL ? "أنشئ اختبارات تقييمية فورية بناءً على المحتوى الذي تم شرحه." : "Create instant assessment quizzes based on the explained content."
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl hover:bg-slate-200 dark:hover:bg-white/10 transition-colors group"
            >
              <div className="w-12 h-12 bg-white dark:bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">{feature.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Pre-footer CTA */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="bg-indigo-600 dark:bg-indigo-500 rounded-[48px] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl shadow-indigo-500/20">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-white blur-[120px] rounded-full" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-400 blur-[120px] rounded-full" />
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative z-10"
          >
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-8 leading-tight">
              {isRTL ? 'جاهز لتحويل محاضراتك؟' : 'Ready to transform your lectures?'}
            </h2>
            <p className="text-indigo-100 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-medium">
              {isRTL ? 'انضم إلى آلاف المعلمين والطلاب الذين يستخدمون إدراك يومياً.' : 'Join thousands of teachers and students using Idrak every day.'}
            </p>
            <Link to="/auth" className="inline-flex items-center gap-3 px-10 py-5 bg-white text-indigo-600 rounded-2xl text-xl font-black hover:bg-indigo-50 transition-all shadow-xl">
              {t('landing.start')}
              <ArrowRight size={24} className={isRTL ? "rotate-180" : ""} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200 dark:border-white/5 pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-1 md:col-span-2 space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                  <Mic size={24} />
                </div>
                <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">IDRAK</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-lg max-w-sm leading-relaxed font-medium">
                {isRTL 
                  ? 'إدراك هو السبورة الذكية التي تفهمك. سجل محاضراتك، لخص أفكارك، وأنشئ اختبارات تفاعلية فورية.' 
                  : 'Idrak is the smart board that understands you. Record lectures, summarize ideas, and create instant interactive quizzes.'}
              </p>
              <div className="flex gap-4">
                {[Globe, Shield, LayoutIcon].map((Icon, i) => (
                  <button key={i} className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-all">
                    <Icon size={20} />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">{isRTL ? 'المنتج' : 'Product'}</h4>
              <ul className="space-y-4">
                {[
                  { label: isRTL ? 'المميزات' : 'Features', href: '#' },
                  { label: isRTL ? 'الذكاء الاصطناعي' : 'AI Assistant', href: '#' },
                  { label: isRTL ? 'الأسعار' : 'Pricing', href: '#' },
                  { label: isRTL ? 'التحديثات' : 'Updates', href: '#' }
                ].map((link, i) => (
                  <li key={i}>
                    <a href={link.href} className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white font-bold transition-colors">{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">{isRTL ? 'الشركة' : 'Company'}</h4>
              <ul className="space-y-4">
                {[
                  { label: isRTL ? 'عن إدراك' : 'About Us', href: '#' },
                  { label: isRTL ? 'الخصوصية' : 'Privacy', href: '#' },
                  { label: isRTL ? 'الشروط' : 'Terms', href: '#' },
                  { label: isRTL ? 'اتصل بنا' : 'Contact', href: '#' }
                ].map((link, i) => (
                  <li key={i}>
                    <a href={link.href} className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white font-bold transition-colors">{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-12 border-t border-slate-200 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-slate-500 text-sm font-bold">
              {isRTL ? '© 2026 إدراك. جميع الحقوق محفوظة.' : '© 2026 Idrak. All rights reserved.'}
            </p>
            <div className="flex items-center gap-8">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                {isRTL ? 'جميع الأنظمة تعمل' : 'All systems operational'}
              </span>
              <p className="text-slate-500 text-sm font-bold">
                {isRTL ? 'صنع بكل حب للتعليم' : 'Made with love for education'}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

