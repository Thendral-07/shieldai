
import React, { useState } from 'react';
import { AnalysisResult, AnalysisStatus, InputMode, LanguageOption } from './types';
import { analyzeContent } from './services/geminiService';
import InputSection from './components/InputSection';
import ResultsDashboard from './components/ResultsDashboard';
import { Shield, Activity, Terminal, Globe, ChevronDown, CheckCircle2, Server, Database, Scan, Mic } from 'lucide-react';
import { LANGUAGES } from './constants';

const App: React.FC = () => {
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  
  // Settings
  const [selectedLang, setSelectedLang] = useState<LanguageOption>(LANGUAGES[0]);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  // Input State
  const [inputMode, setInputMode] = useState<InputMode>(InputMode.TEXT);
  const [textInput, setTextInput] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  
  const [currentImagePreview, setCurrentImagePreview] = useState<string | null>(null);
  
  // Pipeline Visualization State
  const [pipelineProgress, setPipelineProgress] = useState({
    ocr: 0,
    nlp: 0,
    voice: 0,
    search: 0
  });

  const resetAnalysis = () => {
    setStatus(AnalysisStatus.IDLE);
    setResult(null);
    setTextInput('');
    setImageFile(null);
    setAudioFile(null);
    setCurrentImagePreview(null);
    setPipelineProgress({ ocr: 0, nlp: 0, voice: 0, search: 0 });
  };

  const handleImageFileSet = (file: File | null) => {
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setCurrentImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setCurrentImagePreview(null);
    }
  };

  const simulatePipeline = () => {
    // Reset
    setPipelineProgress({ ocr: 5, nlp: 5, voice: 5, search: 5 });
    
    const duration = 2000; // 2 seconds total for simulation
    const intervalTime = 100;
    const steps = duration / intervalTime;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      
      setPipelineProgress(prev => {
        // Randomly increment progress for "async" feel
        const newOcr = Math.min(100, prev.ocr + (Math.random() * 15));
        const newNlp = Math.min(100, prev.nlp + (Math.random() * 10));
        const newVoice = Math.min(100, prev.voice + (Math.random() * 20));
        const newSearch = Math.min(100, prev.search + (Math.random() * 12));
        
        return { ocr: newOcr, nlp: newNlp, voice: newVoice, search: newSearch };
      });

      if (currentStep >= steps) {
        clearInterval(interval);
        setPipelineProgress({ ocr: 100, nlp: 100, voice: 100, search: 100 });
      }
    }, intervalTime);

    return interval;
  };

  const handleAnalyze = async () => {
    if (!textInput && !imageFile && !audioFile && inputMode !== InputMode.LIVE_CALL) {
        alert("Please provide some input to analyze.");
        return;
    }

    setStatus(AnalysisStatus.ANALYZING);
    const progressInterval = simulatePipeline();

    try {
      let imageBase64: string | null = null;
      let audioBase64: string | null = null;

      if (imageFile) {
        imageBase64 = await fileToBase64(imageFile);
      }
      if (audioFile) {
        audioBase64 = await fileToBase64(audioFile);
      }

      // If LIVE_CALL, we might want to analyze "Simulated Live Audio" or just text if triggered
      // For this demo, we assume the user clicked "Intercept" and we analyze the current context or empty for demo
      
      const analysis = await analyzeContent(
        textInput || (inputMode === InputMode.LIVE_CALL ? "Simulated suspicious call transcript involving urgent bank transfer request." : null), 
        imageBase64, 
        audioBase64,
        selectedLang.name
      );

      clearInterval(progressInterval);
      setPipelineProgress({ ocr: 100, nlp: 100, voice: 100, search: 100 }); 
      
      setTimeout(() => {
        setResult(analysis);
        setStatus(AnalysisStatus.COMPLETE);
      }, 500);
      
    } catch (error) {
      console.error(error);
      clearInterval(progressInterval);
      alert("Analysis failed. Please try again.");
      setStatus(AnalysisStatus.ERROR);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const toggleLangMenu = () => setLangMenuOpen(!langMenuOpen);
  
  const selectLang = (lang: LanguageOption) => {
    setLangMenuOpen(false); 
    setTimeout(() => {
        setSelectedLang(lang);
    }, 10);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 font-sans selection:bg-blue-500/30 flex flex-col relative overflow-x-hidden" dir={selectedLang.dir}>
      
      {/* Background Ambience */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-[#0f172a] to-[#0f172a] pointer-events-none" />
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

      {/* Enterprise SaaS Navbar */}
      <header className="bg-[#0f172a]/90 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={resetAnalysis}>
             <div className="relative">
                <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-500/20">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-[#0f172a]"></div>
             </div>
             <div>
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  ShieldAI <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">ENTERPRISE v2.0</span>
                </h1>
             </div>
          </div>
          
          <div className="flex items-center gap-6">
             {/* Global Language Selector */}
             <div className="relative hidden md:block">
                <button 
                  onClick={toggleLangMenu}
                  className="flex items-center gap-2 bg-slate-800/50 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 transition-all text-sm font-medium"
                >
                  <span className="text-lg">{selectedLang.flag}</span>
                  <span className="text-slate-300">{selectedLang.name}</span>
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                </button>
                
                {langMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-64 max-h-96 overflow-y-auto bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 custom-scrollbar">
                    {LANGUAGES.map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => selectLang(lang)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-slate-700/50 transition-colors text-left ${selectedLang.code === lang.code ? 'bg-blue-900/20 text-blue-400' : 'text-slate-300'}`}
                      >
                         <span className="text-lg shrink-0">{lang.flag}</span>
                         <span className="truncate">{lang.name}</span>
                         {selectedLang.code === lang.code && <CheckCircle2 className="w-4 h-4 ml-auto text-blue-500" />}
                      </button>
                    ))}
                  </div>
                )}
             </div>

             <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-green-400 bg-green-900/10 px-3 py-1.5 rounded-full border border-green-900/30 shadow-[0_0_10px_rgba(34,197,94,0.1)]">
               <Activity className="w-3 h-3 animate-pulse" />
               SYSTEM OPTIMAL
             </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col max-w-7xl mx-auto px-6 py-8 w-full z-10">
        
        {/* Analyzing Overlay */}
        {status === AnalysisStatus.ANALYZING && (
           <div className="fixed inset-0 z-50 bg-[#0f172a]/95 backdrop-blur-md flex flex-col items-center justify-center p-6">
              <div className="w-full max-w-2xl space-y-8 animate-fade-in">
                 <div className="text-center space-y-2">
                    <h2 className="text-3xl font-bold text-white tracking-tight">Global Intelligence Network</h2>
                    <p className="text-slate-400">Processing input via Gemini 3 Pro...</p>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Visualizing Pipeline Progress */}
                    {[
                      { label: "OCR Engine", icon: Scan, color: "blue", val: pipelineProgress.ocr },
                      { label: "NLP Core", icon: Terminal, color: "purple", val: pipelineProgress.nlp },
                      { label: "Audio Biometrics", icon: Mic, color: "pink", val: pipelineProgress.voice },
                      { label: "Knowledge Graph", icon: Database, color: "green", val: pipelineProgress.search }
                    ].map((item, i) => (
                      <div key={i} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                         <div className="flex justify-between items-center mb-2">
                            <div className={`flex items-center gap-2 text-${item.color}-300 font-bold text-sm`}>
                              <item.icon className="w-4 h-4" /> {item.label}
                            </div>
                            <span className={`text-xs font-mono text-${item.color}-400`}>{Math.round(item.val)}%</span>
                         </div>
                         <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                            <div className={`h-full bg-${item.color}-500 transition-all duration-300 ease-out`} style={{ width: `${item.val}%` }}></div>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        )}

        {status === AnalysisStatus.IDLE || status === AnalysisStatus.ERROR ? (
          <div className="flex-1 flex flex-col animate-fade-in pb-20">
            
            <div className="text-center mb-10 max-w-4xl mx-auto space-y-6 pt-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm hover:bg-blue-500/20 transition-colors cursor-default">
                 <Globe className="w-3 h-3 text-blue-400" />
                 <span className="text-blue-400 text-xs font-bold uppercase tracking-wider">
                    Powered by Gemini 3 Pro
                 </span>
              </div>
              
              <h2 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
                Global Defense Against<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
                   Digital Threats.
                </span>
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Enterprise-grade multimodal analysis for text, documents, and voice patterns. Real-time protection across 100+ languages.
              </p>
            </div>

            <div className="mb-16 max-w-4xl mx-auto w-full">
                 <InputSection 
                   inputMode={inputMode}
                   setInputMode={setInputMode}
                   textInput={textInput}
                   setTextInput={setTextInput}
                   setImageFile={handleImageFileSet}
                   setAudioFile={setAudioFile}
                   imageFile={imageFile}
                   audioFile={audioFile}
                   onAnalyze={handleAnalyze}
                   isAnalyzing={false}
                 />
            </div>

          </div>
        ) : (
          result && (
            <ResultsDashboard 
              result={result} 
              onReset={resetAnalysis} 
              inputImage={currentImagePreview}
              inputText={textInput}
            />
          )
        )}
      </main>
      
      {/* SaaS Dashboard Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0f172a]/95 backdrop-blur-md border-t border-slate-800 h-10 flex items-center z-40 text-[10px] uppercase tracking-wider font-mono justify-between px-6">
         <div className="flex items-center text-slate-400 font-bold">
            <Server className="w-3 h-3 mr-2" />
            Node: US-EAST-1
         </div>
      </div>
      
      <style>{`
         .custom-scrollbar::-webkit-scrollbar {
           width: 6px;
         }
         .custom-scrollbar::-webkit-scrollbar-track {
           background: #1e293b;
         }
         .custom-scrollbar::-webkit-scrollbar-thumb {
           background: #475569;
           border-radius: 3px;
         }
      `}</style>

    </div>
  );
};

export default App;
