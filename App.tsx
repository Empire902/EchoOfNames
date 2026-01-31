
import React, { useState, useEffect } from 'react';
import { Background } from './components/Background';
import { IslamicPattern } from './components/IslamicPattern';
import { analyzeNames } from './services/geminiService';
import { NameAnalysis, AppState } from './types';

const App: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [analysis, setAnalysis] = useState<NameAnalysis | null>(null);
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAnalyze = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      setErrorMsg('الرجاء إدخال الاسم الأول واسم العائلة');
      return;
    }

    setErrorMsg('');
    setState(AppState.LOADING);
    try {
      const result = await analyzeNames(firstName, lastName);
      // Artificial delay for cinematic loading feel
      await new Promise(resolve => setTimeout(resolve, 1500));
      setAnalysis(result);
      setState(AppState.RESULT);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('عذراً، حدث خطأ أثناء التحليل. حاول مرة أخرى.');
      setState(AppState.ERROR);
    }
  };

  const handleRegenerate = async () => {
    if (!analysis) return;
    setIsRegenerating(true);
    try {
      const result = await analyzeNames(firstName, lastName);
      setAnalysis(result);
    } catch (err) {
      console.error("Regeneration failed", err);
    } finally {
      setIsRegenerating(false);
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
      <div className="w-full max-w-xl px-4 py-6 flex flex-col items-center text-white min-h-screen">
        
        {/* Header - Scaled Down */}
        <div className="text-center mb-6 mt-2 relative reveal-item stagger-1">
          <h1 className="text-4xl sm:text-5xl font-black mb-1 text-yellow-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] kufi gold-shimmer">صدى الأسماء</h1>
          <p className="text-lg sm:text-xl opacity-90 text-yellow-100/90 font-medium kufi tracking-wide">سحر المعاني واجتماع الأصول</p>
        </div>

        {state === AppState.LOADING && (
          <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-xl rounded-[2rem] p-12 flex flex-col items-center justify-center space-y-6 border border-yellow-500/10 breathtaking-reveal">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 border-4 border-yellow-500/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-yellow-500 rounded-full opacity-20 animate-pulse"></div>
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-black text-yellow-500 kufi animate-pulse">نستحضر المعاني...</h3>
              <p className="text-slate-400 text-sm">يتم الآن تحليل جذور الاسم وبناء الصدى</p>
            </div>
          </div>
        )}

        {state !== AppState.RESULT && state !== AppState.LOADING && (
          <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-lg rounded-[2rem] p-6 border border-yellow-700/30 shadow-[0_15px_40px_rgba(0,0,0,0.5)] relative overflow-hidden reveal-item stagger-2">
            <IslamicPattern opacity={0.06} />
            
            <div className="space-y-6 relative z-10">
              <div className="space-y-2">
                <label className="block text-yellow-500 text-base font-black mb-1 mr-1">الاسم الأول</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="مثال: عمرو"
                  className="w-full bg-slate-800/80 border border-yellow-700/20 rounded-xl px-4 py-3 text-white text-lg focus:outline-none focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/5 transition-all text-center placeholder:text-slate-600 font-bold"
                  dir="auto"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-yellow-500 text-base font-black mb-1 mr-1">اسم العائلة</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="مثال: مصطفى"
                  className="w-full bg-slate-800/80 border border-yellow-700/20 rounded-xl px-4 py-3 text-white text-lg focus:outline-none focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/5 transition-all text-center placeholder:text-slate-600 font-bold"
                  dir="auto"
                />
              </div>

              {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/30 p-2 rounded-lg animate-pulse">
                  <p className="text-red-400 text-xs text-center font-bold">{errorMsg}</p>
                </div>
              )}

              <button
                onClick={handleAnalyze}
                className="group relative w-full py-4 rounded-xl font-black text-xl transition-all shadow-xl transform active:scale-95 kufi bg-gradient-to-br from-yellow-500 via-yellow-600 to-amber-700 hover:brightness-110 text-slate-950 border-b-4 border-amber-900 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <span className="relative z-10">اكتشف صدى اسمك</span>
              </button>
            </div>
          </div>
        )}

        {state === AppState.RESULT && (
          <div className="w-full bg-slate-900/95 text-white border border-yellow-700/30 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-xl overflow-hidden relative breathtaking-reveal pb-8">
            <div className="h-2 bg-gradient-to-r from-amber-700 via-yellow-500 to-amber-700 w-full" />
            
            <div className="p-4 sm:p-8 space-y-12 relative">
              <IslamicPattern opacity={0.06} />
              
              {/* Unified Result Title */}
              <div className="text-center space-y-6 relative z-10 pt-8 reveal-item stagger-1">
                <span className="text-yellow-500 font-black uppercase tracking-[0.3em] text-xl sm:text-2xl kufi label-glow block">صـدى الاجتـمـاع</span>
                <div className={`relative inline-block px-4 py-2 transition-all duration-700 ${isRegenerating ? 'opacity-30 scale-95 blur-sm' : 'opacity-100 scale-100 blur-0'}`}>
                   <h2 className="text-6xl sm:text-8xl font-black text-yellow-600 leading-tight kufi gold-shimmer drop-shadow-[0_8px_30px_rgba(180,140,0,0.5)] mb-8">
                    {analysis?.unifiedTitle}
                  </h2>
                  <div className="h-2 w-full bg-gradient-to-r from-transparent via-yellow-600 to-transparent mx-auto rounded-full opacity-40 shadow-[0_0_15px_rgba(180,140,0,0.3)]"></div>
                </div>
              </div>

              {/* Poetic Verse */}
              <div className="relative p-1 bg-gradient-to-br from-yellow-700/40 via-yellow-500/40 to-amber-900/40 rounded-[2.5rem] shadow-2xl z-10 reveal-item stagger-2 overflow-hidden">
                <div className="bg-slate-950/90 rounded-[2.3rem] p-10 sm:p-16 border border-yellow-700/20 min-h-[12rem] flex items-center justify-center group relative">
                  <div className="absolute inset-0 bg-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none"></div>
                  <p className={`text-3xl sm:text-5xl text-yellow-100/90 font-medium text-center leading-[1.8] drop-shadow-md poem-font whitespace-pre-line transition-all duration-1000 ${isRegenerating ? 'opacity-20 blur-sm scale-95' : 'opacity-100 blur-0 scale-100'}`}>
                      {analysis?.poeticVerse}
                   </p>
                </div>
              </div>

              {/* Interpretation */}
              <div className="bg-slate-800/40 p-10 rounded-[2rem] border border-white/5 relative z-10 reveal-item stagger-3 shadow-[inset_0_2px_10px_rgba(0,0,0,0.4)]">
                <p className={`text-center text-slate-300 leading-relaxed text-2xl font-medium sm:text-3xl italic transition-all duration-700 ${isRegenerating ? 'opacity-30 blur-sm' : 'opacity-100 blur-0'}`}>
                  {analysis?.combinedInterpretation}
                </p>
              </div>

              {/* Variations Button */}
              <div className="px-4">
                <button
                  onClick={handleRegenerate}
                  disabled={isRegenerating}
                  className="reveal-item stagger-4 w-full py-5 bg-slate-800/60 hover:bg-slate-700/80 border border-yellow-500/30 rounded-2xl font-bold transition-all flex items-center justify-center gap-4 relative z-10 active:scale-95 group overflow-hidden shadow-lg"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  {isRegenerating ? (
                     <>
                      <svg className="animate-spin h-6 w-6 text-yellow-500" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-yellow-500/80 kufi text-xl">جاري التبديل...</span>
                     </>
                  ) : (
                    <>
                      <svg className="w-6 h-6 text-yellow-500 group-hover:rotate-180 transition-transform duration-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                      </svg>
                      <span className="text-yellow-500 kufi text-xl">توليد خيار آخر</span>
                    </>
                  )}
                </button>
              </div>

              {/* Details */}
              <div className="pt-14 border-t border-white/5 space-y-10 relative z-10">
                <h4 className="text-center text-yellow-600/40 font-black text-sm tracking-[0.4em] uppercase kufi reveal-item stagger-5">التحليل اللغوي والمعجمي</h4>
                
                <div className="space-y-8">
                  <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 reveal-item stagger-5 hover:bg-white/10 transition-all duration-500 shadow-md">
                    <div className="mb-6 flex items-center justify-between border-b border-yellow-600/20 pb-4">
                        <h3 className="font-black text-yellow-600 text-3xl kufi">{analysis?.firstNameArabic}</h3>
                        <span className="text-yellow-600/30 font-black text-base select-none kufi uppercase tracking-widest">الأصـل</span>
                    </div>
                    <p className="text-slate-300 text-xl sm:text-2xl leading-relaxed text-justify">{analysis?.firstNameMeaning}</p>
                  </div>
                  
                  <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 reveal-item stagger-5 hover:bg-white/10 transition-all duration-500 shadow-md">
                    <div className="mb-6 flex items-center justify-between border-b border-yellow-600/20 pb-4">
                        <h3 className="font-black text-yellow-600 text-3xl kufi">{analysis?.lastNameArabic}</h3>
                        <span className="text-yellow-600/30 font-black text-base select-none kufi uppercase tracking-widest">الإرث</span>
                    </div>
                    <p className="text-slate-300 text-xl sm:text-2xl leading-relaxed text-justify">{analysis?.lastNameMeaning}</p>
                  </div>
                </div>
              </div>

              <div className="px-4">
                <button
                  onClick={reset}
                  className="reveal-item stagger-5 w-full mt-8 py-6 bg-gradient-to-br from-yellow-600 to-amber-800 text-slate-950 rounded-2xl font-black transition-all shadow-2xl text-3xl active:scale-95 kufi border-b-8 border-amber-950 hover:brightness-110"
                >
                  تحليل أسماء أخرى
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="mt-12 mb-6 py-10 text-center text-yellow-200/40 text-sm relative z-20 reveal-item stagger-5">
          <p className="text-3xl font-black mb-2 text-yellow-100/80 drop-shadow-md hover:scale-105 transition-transform duration-500 cursor-default">تصميم وتنفيذ/ عمرو مصطفى</p>
          <p className="opacity-60 kufi text-lg tracking-[0.2em]">مشروع مادة اللغة العربية</p>
          <div className="w-24 h-1.5 bg-gradient-to-r from-transparent via-yellow-600/30 to-transparent mx-auto my-8 rounded-full shadow-[0_0_10px_rgba(180,140,0,0.2)]"></div>
          <p className="text-2xl sm:text-4xl text-yellow-600/70 font-bold reveal-text kufi italic tracking-wide">
            جمال اللغة.. صدى يجمعنا
          </p>
        </div>
      </div>
    </Background>
  );
};

export default App;
