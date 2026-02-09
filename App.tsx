
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
        
        {/* Header */}
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
              <div className="text-center space-y-8 relative z-10 pt-10 reveal-item stagger-1">
                <span className="text-yellow-500 font-black uppercase tracking-[0.4em] text-2xl sm:text-3xl kufi label-glow block mb-4">صـدى الاجتـمـاع</span>
                <div className={`relative inline-block px-6 py-4 transition-all duration-700 ${isRegenerating ? 'opacity-30 scale-95 blur-sm' : 'opacity-100 scale-100 blur-0'}`}>
                   <h2 className="text-6xl sm:text-8xl font-black text-yellow-600 kufi gold-shimmer drop-shadow-[0_12px_40px_rgba(180,140,0,0.6)] mb-10 title-spacing">
                    {analysis?.unifiedTitle}
                  </h2>
                  <div className="h-2.5 w-full bg-gradient-to-r from-transparent via-yellow-600 to-transparent mx-auto rounded-full opacity-50 shadow-[0_0_20px_rgba(180,140,0,0.4)]"></div>
                </div>
              </div>

              {/* Poetic Verse Container */}
              <div className="relative p-1.5 bg-gradient-to-br from-yellow-700/50 via-yellow-500/50 to-amber-900/50 rounded-[3rem] shadow-2xl z-10 reveal-item stagger-2 overflow-hidden mx-2 sm:mx-6">
                <div className="bg-slate-950/95 rounded-[2.8rem] p-12 sm:p-20 border border-yellow-700/30 min-h-[14rem] flex items-center justify-center group relative overflow-hidden">
                  <div className="absolute inset-0 bg-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none"></div>
                  <p className={`text-3xl sm:text-5xl text-yellow-100/90 font-medium text-center drop-shadow-lg poem-font whitespace-pre-line transition-all duration-1000 poem-spacing ${isRegenerating ? 'opacity-20 blur-sm scale-95' : 'opacity-100 blur-0 scale-100'}`}>
                      {analysis?.poeticVerse}
                   </p>
                </div>
              </div>

              {/* Interpretation */}
              <div className="bg-slate-800/50 p-10 rounded-[2.5rem] border border-white/5 relative z-10 reveal-item stagger-3 shadow-[inset_0_4px_15px_rgba(0,0,0,0.5)] mx-4">
                <p className={`text-center text-slate-300 leading-[2] text-2xl font-medium sm:text-3xl italic transition-all duration-700 ${isRegenerating ? 'opacity-30 blur-sm' : 'opacity-100 blur-0'}`}>
                  {analysis?.combinedInterpretation}
                </p>
              </div>

              {/* Variations Button */}
              <div className="px-6">
                <button
                  onClick={handleRegenerate}
                  disabled={isRegenerating}
                  className="reveal-item stagger-4 w-full py-6 bg-slate-800/70 hover:bg-slate-700/90 border border-yellow-500/40 rounded-3xl font-bold transition-all flex items-center justify-center gap-5 relative z-10 active:scale-95 group overflow-hidden shadow-xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  {isRegenerating ? (
                     <>
                      <svg className="animate-spin h-8 w-8 text-yellow-500" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-yellow-500/80 kufi text-2xl">جاري التبديل...</span>
                     </>
                  ) : (
                    <>
                      <svg className="w-8 h-8 text-yellow-500 group-hover:rotate-180 transition-transform duration-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                      </svg>
                      <span className="text-yellow-500 kufi text-2xl">توليد خيار آخر</span>
                    </>
                  )}
                </button>
              </div>

              {/* Details Section */}
              <div className="pt-16 border-t border-white/10 space-y-12 relative z-10 px-4">
                <h4 className="text-center text-yellow-600/50 font-black text-base tracking-[0.5em] uppercase kufi reveal-item stagger-5">التحليل اللغوي والمعجمي</h4>
                
                <div className="grid grid-cols-1 gap-10">
                  <div className="bg-white/5 p-10 rounded-[2.5rem] border border-white/10 reveal-item stagger-5 hover:bg-white/10 transition-all duration-500 shadow-xl">
                    <div className="mb-8 flex items-center justify-between border-b border-yellow-600/30 pb-6">
                        <h3 className="font-black text-yellow-600 text-4xl kufi">{analysis?.firstNameArabic}</h3>
                        <span className="text-yellow-600/40 font-black text-lg select-none kufi uppercase tracking-[0.3em]">الأصـل</span>
                    </div>
                    <p className="text-slate-300 text-2xl sm:text-3xl leading-[1.8] text-justify">{analysis?.firstNameMeaning}</p>
                  </div>
                  
                  <div className="bg-white/5 p-10 rounded-[2.5rem] border border-white/10 reveal-item stagger-5 hover:bg-white/10 transition-all duration-500 shadow-xl">
                    <div className="mb-8 flex items-center justify-between border-b border-yellow-600/30 pb-6">
                        <h3 className="font-black text-yellow-600 text-4xl kufi">{analysis?.lastNameArabic}</h3>
                        <span className="text-yellow-600/40 font-black text-lg select-none kufi uppercase tracking-[0.3em]">الإرث</span>
                    </div>
                    <p className="text-slate-300 text-2xl sm:text-3xl leading-[1.8] text-justify">{analysis?.lastNameMeaning}</p>
                  </div>
                </div>
              </div>

              <div className="px-6 pb-6">
                <button
                  onClick={reset}
                  className="reveal-item stagger-5 w-full mt-12 py-7 bg-gradient-to-br from-yellow-600 to-amber-800 text-slate-950 rounded-3xl font-black transition-all shadow-[0_15px_40px_rgba(0,0,0,0.5)] text-4xl active:scale-95 kufi border-b-8 border-amber-950 hover:brightness-110"
                >
                  تحليل أسماء أخرى
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="mt-16 mb-8 py-12 text-center text-yellow-200/40 text-sm relative z-20 reveal-item stagger-5">
          <p className="text-4xl font-black mb-4 text-yellow-100/80 drop-shadow-lg hover:scale-105 transition-transform duration-500 cursor-default">تصميم وتنفيذ/ عمرو مصطفى</p>
          <p className="opacity-70 kufi text-xl tracking-[0.3em] font-medium">مشروع مادة اللغة العربية</p>
          <div className="w-32 h-2 bg-gradient-to-r from-transparent via-yellow-600/40 to-transparent mx-auto my-10 rounded-full shadow-[0_0_15px_rgba(180,140,0,0.3)]"></div>
          <p className="text-3xl sm:text-5xl text-yellow-600/80 font-bold reveal-text kufi italic tracking-wider">
            جمال اللغة.. صدى يجمعنا
          </p>
        </div>
      </div>
    </Background>
  );
};

export default App;
