import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mic, MicOff, Languages, Settings, Trash2, Maximize2, Minimize2, Download, Moon, Sun, MessageSquare, Volume2, FileText, Sparkles, Send, X, ListChecks, HelpCircle, Save, ArrowRight, Upload, Edit3, Check, ChevronDown, FileJson, FileType } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BoardElement, generateFullSummary, askAI, generateQuiz, translateTranscript, generateBoardTitle, transcribeAudio } from '../services/aiService';
import { supabase } from '../lib/supabase';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import confetti from 'canvas-confetti';
import Markdown from 'react-markdown';
import { Layout } from '../components/Layout';
import { useApp } from '../context/AppContext';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Board: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language, theme, t, user, aiModel, autoSave } = useApp();
  const isGuest = user?.id?.startsWith('guest-');

  const [isListening, setIsListening] = useState(false);
  const isListeningRef = useRef(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [voiceLanguage, setVoiceLanguage] = useState<'ar-SA' | 'en-US'>(language === 'ar' ? 'ar-SA' : 'en-US');
  const [boardTitle, setBoardTitle] = useState(t('board.new'));
  
  const [summary, setSummary] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAskingAI, setIsAskingAI] = useState(false);
  const [showAI, setShowAI] = useState(false);

  const [quiz, setQuiz] = useState('');
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [showSaveOptions, setShowSaveOptions] = useState(false);
  const [lastSaveMethod, setLastSaveMethod] = useState<'db' | 'pdf' | 'word' | 'txt'>('db');
  const [saveMessage, setSaveMessage] = useState('');
  
  const showNotification = (msg: string) => {
    setSaveMessage(msg);
    setTimeout(() => setSaveMessage(''), 3000);
  };
  
  const recognitionRef = useRef<any>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (id && id !== 'new') {
      fetchBoardData();
    }
  }, [id]);

  const fetchBoardData = async () => {
    if (isGuest) {
      const saved = localStorage.getItem('idrak_guest_items');
      if (saved) {
        const items = JSON.parse(saved);
        const item = items.find((i: any) => i.id.toString() === id);
        if (item) {
          setTranscript(item.content);
          setBoardTitle(item.title);
        }
      }
      return;
    }

    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      if (data) {
        setTranscript(data.content);
        setBoardTitle(data.title);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Your browser does not support speech recognition. Please use Chrome or Edge.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = voiceLanguage;

    recognitionRef.current.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript + ' ';
        } else {
          interim += transcript;
        }
      }

      if (final) {
        setTranscript(prev => (prev + ' ' + final).trim());
      }
      setInterimTranscript(interim);
    };

    recognitionRef.current.onend = () => {
      if (isListeningRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.error("Restart error:", e);
        }
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, [voiceLanguage]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current.stop();
      isListeningRef.current = false;
      setIsListening(false);
    } else {
      isListeningRef.current = true;
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const handleSummarize = async () => {
    if (!transcript.trim()) return;
    setIsSummarizing(true);
    setShowSummary(true);
    try {
      const res = await generateFullSummary(transcript, language === 'ar' ? 'ar-SA' : 'en-US', aiModel);
      setSummary(res);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleAskAI = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!aiQuestion.trim()) return;
    setIsAskingAI(true);
    try {
      const res = await askAI(aiQuestion, transcript, language === 'ar' ? 'ar-SA' : 'en-US', aiModel);
      setAiResponse(res);
      setAiQuestion('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsAskingAI(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!transcript.trim()) return;
    setIsGeneratingQuiz(true);
    setShowQuiz(true);
    try {
      const res = await generateQuiz(transcript, language === 'ar' ? 'ar-SA' : 'en-US', aiModel);
      setQuiz(res);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleGenerateTitle = async () => {
    if (!transcript.trim()) return;
    setIsGeneratingTitle(true);
    try {
      const newTitle = await generateBoardTitle(transcript, language === 'ar' ? 'ar-SA' : 'en-US', aiModel);
      setBoardTitle(newTitle);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGeneratingTitle(false);
    }
  };

  const handleSave = async () => {
    if (!transcript.trim()) return;
    setIsSaving(true);
    setLastSaveMethod('db');
    try {
      let title = boardTitle;
      if (title === t('board.new')) {
        title = await generateBoardTitle(transcript, language === 'ar' ? 'ar-SA' : 'en-US', aiModel);
        setBoardTitle(title);
      }
      
      if (isGuest) {
        const saved = localStorage.getItem('idrak_guest_items');
        let items = saved ? JSON.parse(saved) : [];
        if (id && id !== 'new') {
          items = items.map((i: any) => i.id.toString() === id ? { ...i, title, content: transcript } : i);
        } else {
          const newId = Date.now();
          items.push({ id: newId, title, content: transcript, created_at: new Date().toISOString() });
          navigate(`/board/${newId}`, { replace: true });
        }
        localStorage.setItem('idrak_guest_items', JSON.stringify(items));
        showNotification(language === 'ar' ? 'تم الحفظ محلياً' : 'Saved locally');
      } else {
        if (id && id !== 'new') {
          const { error } = await supabase
            .from('items')
            .update({ title, content: transcript })
            .eq('id', id);
          if (error) throw error;
        } else {
          const { data, error } = await supabase
            .from('items')
            .insert([{ title, content: transcript, user_id: user.id }])
            .select()
            .single();
          if (error) throw error;
          if (data) navigate(`/board/${data.id}`, { replace: true });
        }
        showNotification(language === 'ar' ? 'تم الحفظ بنجاح' : 'Saved successfully');
      }
    } catch (err: any) {
      console.error(err);
      showNotification(language === 'ar' ? 'خطأ في الحفظ' : 'Save error');
    } finally {
      setIsSaving(false);
      setShowSaveOptions(false);
    }
  };

  const exportAsPdf = () => {
    const doc = new jsPDF();
    const title = boardTitle || 'Idrak Board';
    
    // Add title
    doc.setFontSize(20);
    doc.text(title, 10, 20);
    
    // Add content
    doc.setFontSize(12);
    const splitText = doc.splitTextToSize(transcript, 180);
    doc.text(splitText, 10, 30);
    
    doc.save(`${title}.pdf`);
    setLastSaveMethod('pdf');
    setShowSaveOptions(false);
    showNotification(language === 'ar' ? 'تم التصدير كـ PDF' : 'Exported as PDF');
  };

  const exportAsWord = async () => {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: boardTitle || 'Idrak Board',
                bold: true,
                size: 32,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: transcript,
                size: 24,
              }),
            ],
          }),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${boardTitle || 'Idrak'}.docx`);
    setLastSaveMethod('word');
    setShowSaveOptions(false);
    showNotification(language === 'ar' ? 'تم التصدير كـ Word' : 'Exported as Word');
  };

  const exportAsTxt = () => {
    const blob = new Blob([transcript], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `${boardTitle || 'Idrak'}.txt`);
    setLastSaveMethod('txt');
    setShowSaveOptions(false);
    showNotification(language === 'ar' ? 'تم التصدير كـ Text' : 'Exported as Text');
  };

  const handleMainSaveClick = () => {
    switch (lastSaveMethod) {
      case 'db': handleSave(); break;
      case 'pdf': exportAsPdf(); break;
      case 'word': exportAsWord(); break;
      case 'txt': exportAsTxt(); break;
      default: handleSave();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setInterimTranscript(language === 'ar' ? '...جاري معالجة الملف الصوتي' : 'Processing audio file...');
    try {
      const transcription = await transcribeAudio(file, language === 'ar' ? 'ar-SA' : 'en-US', aiModel);
      setTranscript(prev => {
        const newText = prev ? prev + '\n\n' + transcription : transcription;
        return newText;
      });
    } catch (error) {
      console.error("Upload error:", error);
      showNotification(language === 'ar' ? 'خطأ في معالجة الملف' : 'Error processing file');
    } finally {
      setInterimTranscript('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript, interimTranscript]);

  useEffect(() => {
    if (autoSave && transcript.trim() && !isSaving) {
      const timer = setTimeout(() => {
        handleSave();
      }, 5000); // Auto save after 5 seconds of inactivity
      return () => clearTimeout(timer);
    }
  }, [transcript, autoSave]);

  const isRTL = language === 'ar';

  return (
    <Layout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 bg-white/5 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 z-20 sticky top-0">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-200 dark:hover:bg-white/5 rounded-xl transition-colors">
              <ArrowRight size={24} className={isRTL ? "" : "rotate-180"} />
            </button>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <input 
                  value={boardTitle}
                  onChange={(e) => setBoardTitle(e.target.value)}
                  className="bg-transparent border-none text-xl font-black tracking-tighter focus:ring-0 p-0 text-slate-900 dark:text-white w-64"
                  placeholder={t('board.new')}
                />
                <button 
                  onClick={handleGenerateTitle}
                  disabled={!transcript.trim() || isGeneratingTitle}
                  className="p-1.5 text-indigo-500 hover:bg-indigo-500/10 rounded-lg transition-colors disabled:opacity-30"
                  title={isRTL ? 'توليد عنوان ذكي' : 'Generate AI Title'}
                >
                  <Sparkles size={16} className={isGeneratingTitle ? "animate-spin" : ""} />
                </button>
              </div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                {isGuest ? t('nav.guest') : t('nav.user')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept="audio/*" 
              className="hidden" 
            />
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className={cn(
                "p-2.5 rounded-xl transition-all",
                isEditing 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                  : "bg-slate-200 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-indigo-500"
              )}
              title={isEditing ? (language === 'ar' ? 'حفظ التعديلات' : 'Save Edits') : (language === 'ar' ? 'تعديل النص' : 'Edit Text')}
            >
              {isEditing ? <Check size={20} /> : <Edit3 size={20} />}
            </button>

            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 bg-slate-200 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-xl hover:text-indigo-500 transition-colors"
              title={t('board.upload')}
            >
              <Upload size={20} />
            </button>

            <AnimatePresence>
              {saveMessage && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.9, x: isRTL ? -10 : 10 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9, x: isRTL ? -10 : 10 }}
                  className="text-sm font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap px-2"
                >
                  {saveMessage}
                </motion.span>
              )}
            </AnimatePresence>

            <div className="relative flex items-center">
              <button 
                onClick={handleMainSaveClick}
                disabled={isSaving || !transcript.trim()}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold text-sm hover:bg-emerald-600/30 transition-all disabled:opacity-50 h-[40px]",
                  isRTL ? "rounded-r-xl border-l-0 order-1" : "rounded-l-xl border-r-0 order-1"
                )}
              >
                {isSaving ? <Save size={16} className="animate-spin" /> : (
                  <>
                    {lastSaveMethod === 'db' && <Save size={16} />}
                    {lastSaveMethod === 'pdf' && <FileType size={16} />}
                    {lastSaveMethod === 'word' && <FileText size={16} />}
                    {lastSaveMethod === 'txt' && <FileJson size={16} />}
                  </>
                )}
                {lastSaveMethod === 'db' && t('board.save')}
                {lastSaveMethod === 'pdf' && 'PDF'}
                {lastSaveMethod === 'word' && 'Word'}
                {lastSaveMethod === 'txt' && 'Text'}
              </button>
              <button
                onClick={() => setShowSaveOptions(!showSaveOptions)}
                disabled={!transcript.trim()}
                className={cn(
                  "px-2 py-2 bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-600/30 transition-all disabled:opacity-50 h-[40px]",
                  isRTL ? "rounded-l-xl order-2" : "rounded-r-xl order-2"
                )}
              >
                <ChevronDown size={16} className={cn("transition-transform", showSaveOptions && "rotate-180")} />
              </button>

              <AnimatePresence>
                {showSaveOptions && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl shadow-xl z-50 overflow-hidden"
                  >
                    <button onClick={handleSave} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors">
                      <Save size={16} className="text-emerald-500" />
                      {t('board.save')}
                    </button>
                    <button onClick={exportAsPdf} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors">
                      <FileType size={16} className="text-red-500" />
                      Export PDF
                    </button>
                    <button onClick={exportAsWord} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors">
                      <FileText size={16} className="text-blue-500" />
                      Export Word
                    </button>
                    <button onClick={exportAsTxt} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors">
                      <FileJson size={16} className="text-slate-500" />
                      Export Text
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button 
              onClick={handleSummarize}
              disabled={!transcript.trim() || isSummarizing}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/20"
            >
              <Sparkles size={16} className={isSummarizing ? "animate-spin" : ""} />
              {t('board.summary')}
            </button>

            <div className="flex items-center gap-1 bg-slate-200 dark:bg-white/5 p-1 rounded-xl border border-slate-300 dark:border-white/5">
              <button 
                onClick={() => { setShowAI(!showAI); setShowQuiz(false); setShowSummary(false); }}
                className={cn("p-2 rounded-lg transition-all", showAI ? "bg-indigo-600 text-white" : "hover:bg-slate-300 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400")}
                title={t('board.assistant')}
              >
                <HelpCircle size={20} />
              </button>
              <button 
                onClick={() => { handleGenerateQuiz(); setShowAI(false); setShowSummary(false); }}
                disabled={!transcript.trim() || isGeneratingQuiz}
                className="p-2 hover:bg-slate-300 dark:hover:bg-white/5 rounded-lg transition-all text-emerald-600 dark:text-emerald-400 disabled:opacity-50"
                title={t('board.quiz')}
              >
                <ListChecks size={20} className={isGeneratingQuiz ? "animate-pulse" : ""} />
              </button>
            </div>

            <div className="h-8 w-px bg-slate-300 dark:bg-white/5 mx-1" />
            
            <button 
              onClick={() => setVoiceLanguage(l => l === 'ar-SA' ? 'en-US' : 'ar-SA')}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-bold border",
                voiceLanguage === 'ar-SA' ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
              )}
            >
              <Mic size={16} />
              {voiceLanguage === 'ar-SA' ? 'العربية' : 'English'}
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* AI Panels - Positioned based on language direction */}
          <AnimatePresence mode="wait">
            {(showAI || showQuiz || showSummary) && (
              <motion.div 
                initial={{ x: isRTL ? 400 : -400, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: isRTL ? 400 : -400, opacity: 0 }}
                className={cn(
                  "w-[400px] bg-slate-50 dark:bg-slate-900/50 backdrop-blur-xl z-30 flex flex-col shadow-2xl border-slate-200 dark:border-white/5",
                  isRTL ? "border-l" : "border-r"
                )}
              >
                <div className="p-6 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
                  <h3 className="font-black uppercase text-xs tracking-widest text-slate-500">
                    {showAI && t('board.assistant')}
                    {showQuiz && t('board.quiz')}
                    {showSummary && t('board.summary')}
                  </h3>
                  <button onClick={() => { setShowAI(false); setShowQuiz(false); setShowSummary(false); }} className="p-2 hover:bg-slate-200 dark:hover:bg-white/5 rounded-full text-slate-500">
                    <X size={20}/>
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                  {showAI && (
                    <div className="space-y-6">
                      {aiResponse && (
                        <div className="bg-indigo-500/10 p-6 rounded-[24px] border border-indigo-500/20">
                          <div className="text-sm leading-relaxed whitespace-pre-wrap text-slate-700 dark:text-slate-200">{aiResponse}</div>
                        </div>
                      )}
                      {isAskingAI && <div className="text-center py-20 animate-pulse text-slate-500 text-xs font-black uppercase tracking-widest">{t('board.thinking')}</div>}
                    </div>
                  )}
                  {showQuiz && (
                    <div className="prose dark:prose-invert max-w-none">
                      {isGeneratingQuiz ? <div className="text-center py-20 animate-pulse text-slate-500 text-xs font-black uppercase tracking-widest">{t('board.analyzing')}</div> : <div className="markdown-body"><Markdown>{quiz}</Markdown></div>}
                    </div>
                  )}
                  {showSummary && (
                    <div className="prose dark:prose-invert max-w-none">
                      {isSummarizing ? <div className="text-center py-20 animate-pulse text-slate-500 text-xs font-black uppercase tracking-widest">{t('board.analyzing')}</div> : <div className="markdown-body"><Markdown>{summary}</Markdown></div>}
                    </div>
                  )}
                </div>

                {showAI && (
                  <div className="p-6 border-t border-slate-200 dark:border-white/5">
                    <form onSubmit={handleAskAI} className="relative">
                      <input 
                        type="text" 
                        value={aiQuestion}
                        onChange={(e) => setAiQuestion(e.target.value)}
                        placeholder={t('board.ask')}
                        className="w-full bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/5 rounded-2xl py-4 pl-4 pr-12 text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-slate-900 dark:text-white"
                      />
                      <button type="submit" disabled={!aiQuestion.trim() || isAskingAI} className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50">
                        <Send size={18} />
                      </button>
                    </form>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Transcript Area */}
          <main className="flex-1 overflow-y-auto p-12 relative custom-scrollbar">
            <div className="max-w-4xl mx-auto">
              <div className="text-xl md:text-2xl leading-relaxed whitespace-pre-wrap min-h-[60vh] text-slate-700 dark:text-slate-300 font-medium selection:bg-indigo-500/30">
                {isEditing ? (
                  <div className="relative">
                    <textarea
                      value={transcript}
                      onChange={(e) => setTranscript(e.target.value)}
                      className="w-full min-h-[60vh] bg-transparent border-none focus:ring-0 p-0 resize-none text-slate-900 dark:text-white font-medium"
                      placeholder={language === 'ar' ? 'اكتب هنا...' : 'Type here...'}
                      autoFocus
                    />
                    {isListening && (
                      <div className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-black uppercase tracking-widest animate-pulse border border-indigo-500/20">
                        <Mic size={12} />
                        {language === 'ar' ? 'جاري التسجيل...' : 'Live Recording...'}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {transcript || (
                      <div className="flex flex-col items-center justify-center py-32 text-slate-400 opacity-50">
                        <Mic size={64} className="mb-6" />
                        <p className="text-lg font-bold">{language === 'ar' ? 'ابدأ التحدث لتسجيل ملاحظاتك' : 'Start speaking to record your notes'}</p>
                      </div>
                    )}
                    {interimTranscript && <span className="text-indigo-500 dark:text-indigo-400/60 italic"> {interimTranscript}</span>}
                  </>
                )}
                <div ref={transcriptEndRef} />
              </div>
            </div>
          </main>

          {/* Floating Mic Button */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleListening}
              className={cn(
                "w-24 h-24 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(79,70,229,0.3)] transition-all duration-500 border-4 border-white dark:border-slate-900",
                isListening 
                  ? "bg-red-500 text-white animate-pulse shadow-red-500/40" 
                  : "bg-indigo-600 text-white shadow-indigo-500/40"
              )}
            >
              {isListening ? <MicOff size={40} /> : <Mic size={40} />}
            </motion.button>
          </div>
        </div>
      </div>
    </Layout>
  );
};
