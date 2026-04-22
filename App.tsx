
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeCanvas } from 'qrcode.react';
import { QrCode, Share2, Download, X } from 'lucide-react';
import { Background } from './components/Background';
import { IslamicPattern } from './components/IslamicPattern';
import { analyzeNames } from './services/geminiService';
import { NameAnalysis, AppState } from './types';
import * as htmlToImage from 'html-to-image';

const TransitionOverlay: React.FC<{ active: boolean }> = ({ active }) => {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: '-100%' }}
          exit={{ x: '-100%' }}
          transition={{ duration: 1.2, ease: [0.77, 0, 0.175, 1] }}
          className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
        >
          <div className="w-[150%] h-full bg-gradient-to-r from-transparent via-yellow-600 to-transparent flex items-center justify-center opacity-80 blur-sm">
            <IslamicPattern opacity={0.4} fullScreen />
          </div>
          <div className="absolute inset-0 bg-yellow-500/20 mix-blend-overlay" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

const QRModal: React.FC<{ isOpen: boolean; onClose: () => void; url: string; isSaving?: boolean }> = ({ isOpen, onClose, url, isSaving }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-slate-900 border border-yellow-500/20 p-8 rounded-[2rem] max-w-sm w-full shadow-2xl flex flex-col items-center text-center space-y-6"
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-yellow-500 kufi">رمز المشاركة</h3>
              <p className="text-slate-400 text-sm">امسح الرمز لتحميل الوثيقة على هاتفك</p>
            </div>

            <div className="p-4 bg-white rounded-2xl shadow-inner group relative">
              {isSaving ? (
                <div className="w-[200px] h-[200px] flex items-center justify-center">
                  <div className="animate-spin h-8 w-8 border-4 border-yellow-500 border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <QRCodeCanvas 
                  value={url} 
                  size={200}
                  level="H"
                  includeMargin={false}
                  imageSettings={{
                    src: "/favicon.ico", 
                    x: undefined, y: undefined, height: 40, width: 40, excavate: true,
                  }}
                />
              )}
            </div>

            <div className="w-full pt-4">
              <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mb-4">صدى الأسماء - مشروع مادة اللغة العربية</p>
              <button 
                onClick={onClose}
                className="w-full py-3 bg-yellow-600/10 text-yellow-500 rounded-xl font-bold transition-all hover:bg-yellow-600/20"
              >
                إغلاق
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const ResultCard = React.forwardRef<HTMLDivElement, { analysis: NameAnalysis | null; isExporting: boolean }>((props, ref) => {
  const { analysis, isExporting } = props;
  return (
    <div 
      id="legacy-card-export" 
      ref={ref}
      className="w-full bg-[#020617] text-white border border-yellow-700/30 rounded-3xl shadow-2xl overflow-hidden relative"
      style={{ width: isExporting ? '1000px' : 'auto' }}
    >
      <div className="h-3 bg-gradient-to-r from-amber-950 via-yellow-500 to-amber-950 w-full" />
      <div className="p-10 sm:p-12 space-y-12 relative overflow-hidden">
        <IslamicPattern opacity={0.1} />
        <div className="text-center space-y-3 pb-6 border-b border-yellow-600/10">
           <span className="text-yellow-600/60 font-black tracking-[0.6em] text-[10px] kufi uppercase block">وثيقة الإرث العربي</span>
           <h2 className="text-6xl sm:text-7xl font-black text-yellow-600 kufi gold-shimmer leading-tight py-2">{analysis?.unifiedTitle}</h2>
        </div>
        <div className="bg-slate-900/40 p-10 sm:p-14 rounded-[3rem] border border-yellow-500/10 backdrop-blur-md">
           <p className="text-3xl sm:text-4xl text-yellow-50 text-center poem-font whitespace-pre-line leading-relaxed">{analysis?.poeticVerse}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
           <div className="bg-white/[0.02] p-8 rounded-[2.5rem] border border-yellow-600/10">
              <div className="mb-6 flex flex-col items-start gap-1 border-b border-yellow-600/20 pb-6">
                  <span className="text-yellow-600/50 font-black text-[10px] tracking-widest uppercase kufi">المنبع الأول</span>
                  <h3 className="font-black text-yellow-500 text-5xl kufi">{analysis?.firstNameArabic}</h3>
              </div>
              <p className="text-slate-300 text-lg leading-relaxed text-justify font-light">{analysis?.firstNameMeaning}</p>
           </div>
           <div className="bg-white/[0.02] p-8 rounded-[2.5rem] border border-yellow-600/10">
              <div className="mb-6 flex flex-col items-start gap-1 border-b border-yellow-600/20 pb-6">
                  <span className="text-yellow-600/50 font-black text-[10px] tracking-widest uppercase kufi">إرث العائلة</span>
                  <h3 className="font-black text-yellow-500 text-5xl kufi">{analysis?.lastNameArabic}</h3>
              </div>
              <p className="text-slate-300 text-lg leading-relaxed text-justify font-light">{analysis?.lastNameMeaning}</p>
           </div>
        </div>

        {/* 4. Wisdom & Chronicles */}
        <div className="space-y-10 pt-4">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-yellow-600 font-black kufi text-2xl tracking-widest">ميثاق الأخلاق</span>
                  <div className="h-px flex-1 bg-yellow-600/20"></div>
                </div>
                <p className="text-slate-200 text-xl leading-relaxed italic pr-6 border-r-4 border-yellow-600/30">
                  {analysis?.combinedInterpretation}
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-yellow-600 font-black kufi text-2xl tracking-widest">بيان الإرث</span>
                  <div className="h-px flex-1 bg-yellow-600/20"></div>
                </div>
                <p className="text-slate-300 text-lg leading-relaxed text-justify font-light italic">
                  {analysis?.familyLegacy}
                </p>
              </div>
           </div>
        </div>

        <div className="pt-10 border-t border-yellow-600/10 text-center">
           <h4 className="text-yellow-500 font-black text-2xl kufi gold-shimmer tracking-widest mb-2">صدى الأسماء</h4>
           <div className="space-y-1">
             <p className="text-white text-base font-black tracking-[0.2em] uppercase">تصميم وتنفيذ/ عمرو مصطفى</p>
             <p className="text-yellow-500 text-lg font-black kufi">إشراف المعلم/ أحمد عطية</p>
           </div>
        </div>
      </div>
    </div>
  );
});

const App: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [analysis, setAnalysis] = useState<NameAnalysis | null>(null);
  const [state, setState] = useState<AppState>(AppState.WELCOME);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [isSharePage, setIsSharePage] = useState(false);
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null);
  const [isSavingToCloud, setIsSavingToCloud] = useState(false);

  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    const id = params.get('id');

    if (mode === 'share' && id) {
      setIsSharePage(true);
      fetchAnalysisFromCloud(id);
    }
  }, []);

  const fetchAnalysisFromCloud = async (id: string) => {
    setState(AppState.LOADING);
    try {
      const docRef = doc(db, 'analyses', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setAnalysis(data.analysis);
        setFirstName(data.firstName);
        setLastName(data.lastName);
        setState(AppState.RESULT);
        
        // Auto-trigger download
        setTimeout(() => {
          handleExport();
        }, 1500);
      } else {
        setErrorMsg('عذراً، لم نتمكن من العثور على هذه الوثيقة.');
        setState(AppState.ERROR);
      }
    } catch (err) {
      console.error("Error fetching analysis", err);
      setErrorMsg('حدث خطأ أثناء تحميل البيانات.');
      setState(AppState.ERROR);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '.' && !(document.activeElement instanceof HTMLInputElement) && !(document.activeElement instanceof HTMLTextAreaElement)) {
        if (isSharePage) {
          window.location.href = window.location.origin + window.location.pathname;
        } else {
          triggerStateTransition(AppState.WELCOME);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSharePage]);

  const triggerStateTransition = (newState: AppState) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setState(newState);
      setTimeout(() => setIsTransitioning(false), 600);
    }, 400); 
  };

  const startApp = () => {
    triggerStateTransition(AppState.IDLE);
  };

  const triggerAnalysis = async (f: string, l: string) => {
    setErrorMsg('');
    setState(AppState.LOADING);
    setCurrentAnalysisId(null);
    try {
      const result = await analyzeNames(f, l);
      setAnalysis(result);
      setState(AppState.RESULT);
    } catch (err: any) {
      console.error(err);
      setState(AppState.ERROR);
    }
  };

  const saveCurrentAnalysis = async () => {
    if (!analysis || currentAnalysisId) return;
    setIsSavingToCloud(true);
    try {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      await setDoc(doc(db, 'analyses', id), {
        userId: 'anonymous', // Or handle actual auth if needed
        firstName,
        lastName,
        analysis: analysis,
        createdAt: serverTimestamp()
      });
      setCurrentAnalysisId(id);
    } catch (err) {
      console.error("Error saving analysis", err);
    } finally {
      setIsSavingToCloud(false);
    }
  };

  const handleShowQR = async () => {
    setShowQR(true);
    if (!currentAnalysisId) {
      await saveCurrentAnalysis();
    }
  };

  const handleAnalyze = () => {
    if (!firstName.trim() || !lastName.trim()) {
      setErrorMsg('الرجاء إدخال الاسم الأول واسم العائلة');
      return;
    }
    triggerAnalysis(firstName, lastName);
  };

  const handleRegenerate = async () => {
    if (!analysis) return;
    setIsRegenerating(true);
    setErrorMsg('');
    try {
      const result = await analyzeNames(firstName, lastName);
      setAnalysis(result);
    } catch (err: any) {
      console.error("Regeneration failed", err);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleExport = async () => {
    if (!exportRef.current) return;
    setIsExporting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      const node = exportRef.current;
      const dataUrl = await htmlToImage.toPng(node, {
        pixelRatio: 3, 
        backgroundColor: '#020617',
        cacheBust: true,
      });

      const link = document.createElement('a');
      link.download = `صدى_الأسماء_${firstName}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err: any) {
      console.error('Export failed', err);
    } finally {
      setIsExporting(false);
    }
  };

  const reset = () => {
    if (isSharePage) {
      window.location.href = window.location.origin + window.location.pathname;
      return;
    }
    setFirstName('');
    setLastName('');
    setAnalysis(null);
    setState(AppState.IDLE);
    setErrorMsg('');
  };

  const shareUrl = currentAnalysisId 
    ? `${window.location.origin}${window.location.pathname}?mode=share&id=${currentAnalysisId}`
    : '';

  if (isSharePage && state === AppState.RESULT) {
    return (
      <Background>
        <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <IslamicPattern opacity={0.1} />
            <h1 className="text-5xl font-black text-yellow-500 kufi gold-shimmer">صدى الأسماء</h1>
            <p className="text-xl text-yellow-100/80 kufi">شكراً لاستخدامك صدى الأسماء</p>
            <div className="pt-4">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 rounded-full text-yellow-500 text-sm animate-pulse font-bold">
                <Download className="w-4 h-4" />
                يتم الآن تحميل وثيقتك تلقائياً...
              </span>
            </div>
          </motion.div>

          <div className="opacity-0 pointer-events-none absolute scale-50">
            <ResultCard ref={exportRef} analysis={analysis} isExporting={true} />
          </div>

          <button onClick={reset} className="px-8 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-all font-bold kufi">
            العودة للرئيسية
          </button>
        </div>
      </Background>
    );
  }

  return (
    <Background>
      <TransitionOverlay active={isTransitioning} />
      <QRModal isOpen={showQR} onClose={() => setShowQR(false)} url={shareUrl} isSaving={isSavingToCloud} />
      
      <div className={`w-full max-w-2xl px-4 py-8 flex flex-col items-center text-white ${state === AppState.RESULT ? 'min-h-screen' : 'min-h-screen md:h-screen md:overflow-hidden justify-center'}`}>
        
        <AnimatePresence mode="wait">
          {state === AppState.WELCOME && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col items-center justify-center text-center space-y-12"
            >
              <div className="relative group p-8">
                <IslamicPattern opacity={0.1} />
                <div className="relative z-10 space-y-4">
                  <h1 className="text-6xl sm:text-7xl font-black text-yellow-500 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] kufi gold-shimmer mb-4">صدى الأسماء</h1>
                  <p className="text-2xl sm:text-3xl text-yellow-100/90 font-black kufi tracking-widest animate-pulse">اكتشف صدى اسمك</p>
                </div>
              </div>

              <div className="space-y-6 pt-8 border-t border-yellow-500/10 w-full max-w-md">
                <div className="space-y-2">
                  <p className="text-xl font-black text-yellow-100/80 drop-shadow-md">تصميم وتنفيذ/ عمرو مصطفى</p>
                  <p className="text-2xl font-black text-yellow-500 drop-shadow-md kufi">إشراف المعلم/ أحمد عطية</p>
                </div>
                
                <button 
                  onClick={startApp}
                  className="mt-12 px-12 py-5 bg-gradient-to-br from-yellow-500 to-amber-700 text-slate-950 rounded-2xl font-black text-2xl kufi transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(234,179,8,0.2)] border border-yellow-400/30"
                >
                  ابدأ التجربة
                </button>
              </div>
            </motion.div>
          )}

          {state !== AppState.WELCOME && (
            <motion.div
              key="content"
              initial={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
              transition={{ duration: 0.5 }}
              className="w-full flex flex-col items-center"
            >
              <div className="text-center mb-8 mt-2 relative">
                <h1 className="text-4xl sm:text-5xl font-black mb-2 text-yellow-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] kufi gold-shimmer">صدى الأسماء</h1>
                <p className="text-lg sm:text-xl opacity-90 text-yellow-100/90 font-medium kufi tracking-widest">سحر المعاني واجتماع الأصول</p>
              </div>

              {state === AppState.LOADING && (
                <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-2xl rounded-[2.5rem] p-10 flex flex-col items-center justify-center space-y-6 border border-yellow-500/10 shadow-xl">
                  <div className="relative w-20 h-20">
                    <div className="absolute inset-0 border-[4px] border-yellow-500/10 rounded-full"></div>
                    <div className="absolute inset-0 border-[4px] border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-black text-yellow-500 kufi animate-pulse">نستحضر المعاني...</h3>
                    <p className="text-slate-400 text-xs">يتم الآن بناء الصدى اللغوي لاسمك</p>
                  </div>
                </div>
              )}

              {(state === AppState.IDLE || state === AppState.ERROR) && (
                <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl rounded-[2rem] p-8 border border-yellow-700/30 shadow-2xl relative overflow-hidden">
                  <IslamicPattern opacity={0.05} />
                  <div className="space-y-6 relative z-10">
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="الاسم الأول"
                        className="w-full bg-slate-800/60 border border-yellow-700/20 rounded-xl px-5 py-3 text-white text-lg focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/10 transition-all text-center font-bold"
                        dir="auto"
                      />
                    </div>
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="اسم العائلة"
                        className="w-full bg-slate-800/60 border border-yellow-700/20 rounded-xl px-5 py-3 text-white text-lg focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/10 transition-all text-center font-bold"
                        dir="auto"
                      />
                    </div>
                    {errorMsg && <p className="text-red-400 text-xs text-center">{errorMsg}</p>}
                    <button
                      onClick={handleAnalyze}
                      className="w-full py-4 rounded-xl font-black text-xl transition-all shadow-xl active:scale-95 kufi bg-gradient-to-br from-yellow-500 to-amber-700 text-slate-950"
                    >
                      اكتشف صدى اسمك
                    </button>
                  </div>
                </div>
              )}

              {state === AppState.RESULT && !isSharePage && (
                <div className="w-full space-y-6 max-w-xl">
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-2 px-2"
                  >
                    <button
                      onClick={handleExport}
                      disabled={isExporting}
                      className="flex-1 py-4 bg-emerald-700/80 hover:bg-emerald-600 rounded-xl font-black text-lg transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {isExporting ? <span className="animate-pulse">جاري الحفظ...</span> : <><Download className="w-5 h-5" /> <span>حفظ الوثيقة</span></>}
                    </button>
                    <button
                      onClick={handleShowQR}
                      className="p-4 bg-slate-800/80 hover:bg-slate-700 border border-yellow-500/20 rounded-xl transition-all active:scale-95 group"
                      title="مشاركة عبر الرمز"
                    >
                      <QrCode className="w-6 h-6 text-yellow-500 group-hover:scale-110 transition-transform" />
                    </button>
                    <button
                      onClick={handleRegenerate}
                      disabled={isRegenerating || isExporting}
                      className="p-4 bg-slate-800/80 hover:bg-slate-700 border border-yellow-500/20 rounded-xl transition-all active:scale-95 disabled:opacity-50"
                    >
                      {isRegenerating ? <div className="animate-spin h-6 w-6 border-2 border-yellow-500 border-t-transparent rounded-full" /> : <Share2 className="w-6 h-6 text-yellow-500" />}
                    </button>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, type: "spring", damping: 20 }}
                  >
                    <ResultCard ref={exportRef} analysis={analysis} isExporting={isExporting} />
                  </motion.div>

                  <button onClick={reset} className="w-full py-4 bg-yellow-600/5 hover:bg-yellow-600/10 text-yellow-500 rounded-xl font-black kufi border border-yellow-500/20">
                    تحليل أسماء أخرى
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Website Footer Information - Added back */}
        <div className={`mt-16 mb-8 text-center text-yellow-200/40 text-xs relative z-20 transition-all ${state === AppState.RESULT ? 'block' : (state === AppState.WELCOME ? 'hidden' : 'md:hidden')}`}>
          <p className="text-xl font-black mb-2 text-yellow-100/90 drop-shadow-xl font-sans">تصميم وتنفيذ/ عمرو مصطفى</p>
          <p className="text-2xl font-black mb-2 text-yellow-500 drop-shadow-xl kufi">إشراف المعلم/ أحمد عطية</p>
          <p className="opacity-70 kufi text-sm tracking-[0.3em] font-medium mb-4 uppercase">مشروع مادة اللغة العربية</p>
          <div className="w-20 h-px bg-gradient-to-r from-transparent via-yellow-600/40 to-transparent mx-auto mb-6"></div>
          <p className="text-lg text-yellow-600/90 font-bold kufi italic">
            جمال اللغة.. صدى يجمعنا
          </p>
        </div>
      </div>
    </Background>
  );
};

export default App;
