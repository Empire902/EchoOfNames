
import React, { useState, useRef } from 'react';
import { Background } from './components/Background';
import { IslamicPattern } from './components/IslamicPattern';
import { analyzeNames } from './services/geminiService';
import { NameAnalysis, AppState } from './types';
import * as htmlToImage from 'html-to-image';

const App: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [analysis, setAnalysis] = useState<NameAnalysis | null>(null);
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const exportRef = useRef<HTMLDivElement>(null);

  const triggerAnalysis = async (f: string, l: string) => {
    setErrorMsg('');
    setState(AppState.LOADING);
    try {
      const result = await analyzeNames(f, l);
      setAnalysis(result);
      setState(AppState.RESULT);
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('503') || err.message?.includes('UNAVAILABLE')) {
        setErrorMsg('الخدمة مزدحمة حالياً، يرجى الانتظار قليلاً والمحاولة مرة أخرى.');
      } else {
        setErrorMsg('عذراً، حدث خطأ أثناء التحليل. حاول مرة أخرى.');
      }
      setState(AppState.ERROR);
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
      if (err.message?.includes('503') || err.message?.includes('UNAVAILABLE')) {
        setErrorMsg('الخدمة مزدحمة، سنبقي على البيانات الحالية. حاول مجدداً.');
      } else {
        setErrorMsg('حدث خطأ أثناء التحديث.');
      }
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
        style: {
          width: '1000px', 
          transform: 'scale(1)',
          borderRadius: '0',
          margin: '0 auto',
        },
      });

      const link = document.createElement('a');
      link.download = `صدى_الأسماء_${firstName}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err: any) {
      console.error('Export failed', err);
      alert('عذراً، حدث خطأ أثناء تحميل الصورة.');
    } finally {
      setIsExporting(false);
    }
  };

  const reset = () => {
    setFirstName('');
    setLastName('');
    setAnalysis(null);
    setState(AppState.IDLE);
    setErrorMsg('');
  };

  return (
    <Background>
      <div className={`w-full max-w-2xl px-4 py-8 flex flex-col items-center text-white ${state === AppState.RESULT ? 'min-h-screen' : 'min-h-screen md:h-screen md:overflow-hidden justify-center'}`}>
        
        {/* Header UI */}
        <div className="text-center mb-8 mt-2 relative reveal-item stagger-1">
          <h1 className="text-4xl sm:text-5xl font-black mb-2 text-yellow-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] kufi gold-shimmer">صدى الأسماء</h1>
          <p className="text-lg sm:text-xl opacity-90 text-yellow-100/90 font-medium kufi tracking-widest">سحر المعاني واجتماع الأصول</p>
        </div>

        {state === AppState.LOADING && (
          <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-2xl rounded-[2.5rem] p-10 flex flex-col items-center justify-center space-y-6 border border-yellow-500/10 breathtaking-reveal shadow-xl">
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
          <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl rounded-[2rem] p-8 border border-yellow-700/30 shadow-2xl relative overflow-hidden reveal-item stagger-2">
            <IslamicPattern opacity={0.05} />
            <div className="space-y-6 relative z-10">
              <div className="space-y-2">
                <label className="block text-yellow-500 text-sm font-black mr-1 uppercase tracking-widest">الاسم الأول</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="مثال: عمرو"
                  className="w-full bg-slate-800/60 border border-yellow-700/20 rounded-xl px-5 py-3 text-white text-lg focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/10 transition-all text-center placeholder:text-slate-600 font-bold"
                  dir="auto"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-yellow-500 text-sm font-black mr-1 uppercase tracking-widest">اسم العائلة</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="مثال: مصطفى"
                  className="w-full bg-slate-800/60 border border-yellow-700/20 rounded-xl px-5 py-3 text-white text-lg focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/10 transition-all text-center placeholder:text-slate-600 font-bold"
                  dir="auto"
                />
              </div>
              {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
                  <p className="text-red-400 text-xs text-center font-bold">{errorMsg}</p>
                </div>
              )}
              <button
                onClick={handleAnalyze}
                className="group relative w-full py-4 rounded-xl font-black text-xl transition-all shadow-xl active:scale-95 kufi bg-gradient-to-br from-yellow-500 to-amber-700 text-slate-950 overflow-hidden"
              >
                <span className="relative z-10">اكتشف صدى اسمك</span>
              </button>
            </div>
          </div>
        )}

        {state === AppState.RESULT && (
          <div className="w-full space-y-6 max-w-xl">
            {/* Optimized Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 px-2 reveal-item stagger-1">
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="flex-[1.5] py-4 bg-emerald-700 hover:bg-emerald-600 rounded-xl font-black text-lg transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isExporting ? <span className="animate-pulse">جاري الحفظ...</span> : <span>حفظ الوثيقة</span>}
              </button>
              <button
                onClick={handleRegenerate}
                disabled={isRegenerating || isExporting}
                className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 border border-yellow-500/20 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {isRegenerating ? <span className="animate-spin h-5 w-5 border-2 border-yellow-500 border-t-transparent rounded-full"></span> : <span>توليد جديد</span>}
              </button>
            </div>
            
            {errorMsg && (
              <p className="text-red-400 text-xs text-center font-bold px-2">{errorMsg}</p>
            )}

            {/* COMPACT PREMIUM EXPORT CONTAINER */}
            <div 
              id="legacy-card-export" 
              ref={exportRef}
              className="w-full bg-[#020617] text-white border border-yellow-700/30 rounded-none shadow-xl overflow-hidden relative"
              style={{ width: isExporting ? '1000px' : 'auto' }}
            >
              <div className="h-3 bg-gradient-to-r from-amber-950 via-yellow-500 to-amber-950 w-full" />
              
              <div className="p-10 sm:p-12 space-y-12 relative">
                <IslamicPattern opacity={0.1} />
                <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/5 via-transparent to-amber-900/5 pointer-events-none" />
                
                {/* 1. Artistic Header - Compact */}
                <div className="text-center space-y-3 relative z-10 pb-6 border-b border-yellow-600/10">
                   <span className="text-yellow-600/60 font-black tracking-[0.6em] text-xs kufi uppercase block">وثيقة الإرث العربي</span>
                   <h2 className="text-6xl sm:text-7xl font-black text-yellow-600 kufi gold-shimmer leading-tight">
                    {analysis?.unifiedTitle}
                  </h2>
                </div>

                {/* 2. Poetic Masterpiece Section - Compact */}
                <div className="relative z-10">
                   <div className="bg-slate-900/40 p-10 sm:p-14 rounded-[3rem] border border-yellow-500/10 backdrop-blur-md">
                      <p className={`text-3xl sm:text-4xl text-yellow-50 text-center poem-font whitespace-pre-line leading-relaxed transition-all duration-1000 ${isRegenerating ? 'opacity-20 blur-sm' : 'opacity-100'}`}>
                          {analysis?.poeticVerse}
                       </p>
                   </div>
                </div>

                {/* 3. Side-by-Side Root Analysis - Dense & Clean */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 relative z-10">
                   <div className="bg-white/[0.02] p-8 rounded-[2.5rem] border border-yellow-600/10 relative overflow-hidden">
                      <div className="mb-6 flex flex-col items-start gap-1 border-b border-yellow-600/20 pb-6">
                          <span className="text-yellow-600/50 font-black text-[10px] tracking-widest uppercase kufi">المنبع الأول</span>
                          <h3 className={`font-black text-yellow-500 text-5xl kufi transition-opacity ${isRegenerating ? 'opacity-50' : 'opacity-100'}`}>{analysis?.firstNameArabic}</h3>
                      </div>
                      <p className={`text-slate-300 text-lg leading-relaxed text-justify font-light transition-opacity ${isRegenerating ? 'opacity-50' : 'opacity-100'}`}>{analysis?.firstNameMeaning}</p>
                   </div>
                   
                   <div className="bg-white/[0.02] p-8 rounded-[2.5rem] border border-yellow-600/10 relative overflow-hidden">
                      <div className="mb-6 flex flex-col items-start gap-1 border-b border-yellow-600/20 pb-6">
                          <span className="text-yellow-600/50 font-black text-[10px] tracking-widest uppercase kufi">إرث العائلة</span>
                          <h3 className={`font-black text-yellow-500 text-5xl kufi transition-opacity ${isRegenerating ? 'opacity-50' : 'opacity-100'}`}>{analysis?.lastNameArabic}</h3>
                      </div>
                      <p className={`text-slate-300 text-lg leading-relaxed text-justify font-light transition-opacity ${isRegenerating ? 'opacity-50' : 'opacity-100'}`}>{analysis?.lastNameMeaning}</p>
                   </div>
                </div>

                {/* 4. Wisdom & Chronicles - Integrated & Compact */}
                <div className="space-y-10 relative z-10 pt-4">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <span className="text-yellow-600 font-black kufi text-2xl tracking-widest">ميثاق الأخلاق</span>
                          <div className="h-px flex-1 bg-yellow-600/20"></div>
                        </div>
                        <p className={`text-slate-200 text-xl leading-relaxed italic pr-6 border-r-4 border-yellow-600/30 transition-all duration-700 ${isRegenerating ? 'opacity-30 blur-sm' : 'opacity-100'}`}>
                          {analysis?.combinedInterpretation}
                        </p>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <span className="text-yellow-600 font-black kufi text-2xl tracking-widest">بيان الإرث</span>
                          <div className="h-px flex-1 bg-yellow-600/20"></div>
                        </div>
                        <p className={`text-slate-300 text-lg leading-relaxed text-justify transition-all duration-700 font-light italic ${isRegenerating ? 'opacity-30 blur-sm' : 'opacity-100'}`}>
                          {analysis?.familyLegacy}
                        </p>
                      </div>
                   </div>
                </div>

                {/* 5. Minimalist Footer - Compact */}
                <div className="pt-10 pb-4 flex flex-col items-center justify-center space-y-4 relative z-10 border-t border-yellow-600/10">
                   <div className="text-center">
                      <h4 className="text-yellow-500 font-black text-2xl kufi gold-shimmer tracking-widest mb-2">صدى الأسماء</h4>
                      <p className="text-white text-base font-black tracking-[0.2em] uppercase">تصميم وتنفيذ/ عمرو مصطفى</p>
                      <p className="text-yellow-500 text-lg font-black kufi mt-1">إشراف المعلم/ أحمد عطية</p>
                      <p className="text-slate-600 text-[10px] kufi opacity-80 uppercase tracking-widest mt-1">مشروع مادة اللغة العربية</p>
                   </div>
                </div>
              </div>
              
              <div className="h-3 bg-gradient-to-r from-amber-950 via-yellow-500 to-amber-950 w-full" />
            </div>

            {/* Return Action */}
            <div className="px-4 pb-12">
              <button
                onClick={reset}
                className="w-full mt-4 py-4 bg-yellow-600/5 hover:bg-yellow-600/10 text-yellow-500 rounded-xl font-black transition-all text-xl active:scale-95 kufi border border-yellow-500/20 shadow-sm"
              >
                تحليل أسماء أخرى
              </button>
            </div>
          </div>
        )}

        {/* Website Footer Information */}
        <div className={`mt-16 mb-8 text-center text-yellow-200/40 text-xs relative z-20 reveal-item stagger-5 ${state === AppState.RESULT ? 'block' : 'md:hidden'}`}>
          <p className="text-xl font-black mb-2 text-yellow-100/90 drop-shadow-xl">تصميم وتنفيذ/ عمرو مصطفى</p>
          <p className="text-2xl font-black mb-2 text-yellow-500 drop-shadow-xl kufi">إشراف المعلم/ أحمد عطية</p>
          <p className="opacity-70 kufi text-sm tracking-[0.3em] font-medium mb-4">مشروع مادة اللغة العربية</p>
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
