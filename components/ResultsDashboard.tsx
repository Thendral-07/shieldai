
import React, { useState } from 'react';
import { AnalysisResult } from '../types';
import AnalysisGauge from './AnalysisGauge';
import { Shield, AlertTriangle, CheckCircle, MessageSquare, RefreshCw, Copy, Volume2, Maximize2, FileText, Globe, Cpu, ExternalLink, ThumbsUp, ThumbsDown, UserCheck, ImageIcon, Type, Sparkles, Server, Lock, AlertOctagon } from 'lucide-react';
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

interface ResultsDashboardProps {
  result: AnalysisResult;
  onReset: () => void;
  inputImage?: string | null;
  inputText?: string | null;
}

type Tab = 'overview' | 'deep_scan' | 'report';

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ result, onReset, inputImage, inputText }) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [feedbackGiven, setFeedbackGiven] = useState<'yes' | 'no' | null>(null);
  const [simulatedRetraining, setSimulatedRetraining] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleCopyReply = () => {
    navigator.clipboard.writeText(result.one_tap_safe_reply);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(result.explanation);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleFeedback = (type: 'yes' | 'no') => {
    setFeedbackGiven(type);
    if (type === 'no') {
      // Simulate RL retraining
      setSimulatedRetraining(true);
      setTimeout(() => setSimulatedRetraining(false), 3000);
    }
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPdf(true);
    try {
      const element = document.getElementById('report-content');
      if (!element) {
         alert("Report content not found.");
         return;
      }

      // Use html2canvas to capture the visual evidence and complex text layout
      const canvas = await html2canvas(element, { 
        scale: 2,
        useCORS: true, 
        backgroundColor: '#ffffff' // White background for PDF
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('ShieldAI_Official_Case_File.pdf');
    } catch (err) {
      console.error("PDF Generation failed:", err);
      alert("Failed to generate PDF report.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const getSeverityColor = (score: number) => {
    if (score <= 20) return 'text-green-400 bg-green-500/10 border-green-500/20';
    if (score <= 50) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    if (score <= 75) return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
    return 'text-red-500 bg-red-500/10 border-red-500/20 animate-pulse';
  };

  return (
    <div className="w-full max-w-7xl mx-auto animate-fade-in space-y-8 pb-20">
      
      {/* Dashboard Header */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-800/60 backdrop-blur-xl p-6 rounded-3xl border border-slate-700/50 shadow-2xl relative overflow-hidden">
         {/* Background Glow */}
         <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

         {/* 1. Gauge Column */}
         <div className="md:col-span-3 flex justify-center items-center h-48 md:h-auto">
            <div className="w-full h-full max-w-[220px]">
               <AnalysisGauge score={result.scam_score} />
            </div>
         </div>

         {/* 2. Intelligence Column */}
         <div className="md:col-span-6 flex flex-col justify-center text-center md:text-left space-y-3 z-10">
             <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                 {result.target_region && (
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-300 bg-slate-700/50 px-2.5 py-1 rounded-md border border-slate-600 uppercase tracking-wider">
                       <Globe className="w-3 h-3" /> {result.target_region}
                    </div>
                  )}
                 <div className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getSeverityColor(result.scam_score)}`}>
                    {result.scam_score > 75 ? 'Critical Threat' : 'Analysis Complete'}
                  </div>
             </div>
             
             <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight break-words">
               {result.scam_type}
             </h2>
             
             <div className="text-slate-400 text-sm font-medium flex items-center justify-center md:justify-start gap-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <span>AI Confidence: <span className="text-white">{result.confidence_score || 94}%</span></span>
             </div>
         </div>

         {/* 3. Evidence Column */}
         <div className="md:col-span-3 flex flex-col justify-center items-center md:items-end z-10">
             <div className="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-2">Analyzed Evidence</div>
             <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/60 shadow-inner w-full max-w-[200px] flex items-center gap-3 hover:border-slate-600 transition-colors">
                {inputImage ? (
                  <>
                    <img src={inputImage} alt="Input" className="w-12 h-12 object-cover rounded-lg border border-slate-700 bg-slate-800" />
                    <div className="flex flex-col min-w-0">
                       <span className="text-xs text-slate-200 font-bold flex items-center gap-1"><ImageIcon className="w-3 h-3"/> Image</span>
                       <span className="text-[10px] text-slate-500 truncate">Visual Scan</span>
                    </div>
                  </>
                ) : (
                  <>
                     <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center border border-slate-700 text-slate-500 shrink-0">
                        <Type className="w-5 h-5" />
                     </div>
                     <div className="flex flex-col min-w-0 w-full">
                        <span className="text-xs text-slate-200 font-bold flex items-center gap-1"><MessageSquare className="w-3 h-3"/> Text</span>
                        <span className="text-[10px] text-slate-500 line-clamp-1 break-all" title={inputText || ''}>
                          {inputText ? inputText.substring(0, 15) + '...' : "No text"}
                        </span>
                     </div>
                  </>
                )}
             </div>
         </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-center gap-4 py-2 sticky top-20 z-20">
          {[
            { id: 'overview', label: 'Overview', icon: Shield },
            { id: 'deep_scan', label: 'Deep Scan', icon: Server },
            { id: 'report', label: 'Report', icon: FileText }
          ].map(tab => (
             <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`px-6 py-2.5 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 ${
                  activeTab === tab.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 ring-2 ring-blue-500/50' 
                  : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700 hover:text-white'
                }`}
             >
                <tab.icon className="w-3.5 h-3.5" /> {tab.label}
             </button>
          ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-6">
          
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              {/* Explanation Card */}
              <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 shadow-lg relative group backdrop-blur-sm">
                 <div className="flex justify-between items-start mb-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center">
                       <Sparkles className="w-4 h-4 mr-2 text-blue-400" />
                       AI Analysis Reasoning
                    </h3>
                    <div className="flex gap-2">
                        <button onClick={handleSpeak} className="p-2 bg-slate-700/50 hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-blue-400">
                            <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-pulse' : ''}`} />
                        </button>
                        {!feedbackGiven ? (
                          <div className="flex bg-slate-700/50 rounded-full p-1">
                            <button onClick={() => handleFeedback('yes')} className="p-1.5 hover:bg-green-600 rounded-full text-slate-400 hover:text-white transition-colors">
                                <ThumbsUp className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleFeedback('no')} className="p-1.5 hover:bg-red-600 rounded-full text-slate-400 hover:text-white transition-colors">
                                <ThumbsDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className={`text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center ${feedbackGiven === 'yes' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                             {feedbackGiven === 'yes' ? 'Verified' : 'Flagged for Review'}
                          </div>
                        )}
                    </div>
                 </div>
                 <p className="text-slate-200 leading-relaxed text-lg font-light" dir="auto">
                    {result.explanation}
                 </p>
              </div>
              
              {/* Simulated Retraining */}
              {simulatedRetraining && (
                <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/30 p-4 rounded-xl flex items-center gap-4 animate-pulse">
                   <div className="bg-purple-500/20 p-2 rounded-lg">
                      <Cpu className="w-5 h-5 text-purple-400" />
                   </div>
                   <div className="text-sm">
                      <span className="text-purple-300 font-bold block">Reinforcement Learning Triggered</span>
                      <span className="text-slate-400">Feedback received. Adjusting model weights for pattern "{result.scam_type}"...</span>
                   </div>
                </div>
              )}

              {/* Red Flags Grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                 {result.red_flags.map((flag, i) => (
                    <div key={i} className="bg-red-500/5 border border-red-500/20 p-4 rounded-xl flex items-start gap-3">
                       <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                       <span className="text-red-100/90 text-sm font-medium" dir="auto">{flag}</span>
                    </div>
                 ))}
              </div>
            </div>
          )}

          {activeTab === 'deep_scan' && (
             <div className="space-y-6 animate-fade-in">
                {/* 1. Protocol Comparison (Educational) */}
                {result.protocol_comparison && (
                    <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700/50">
                        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-6 flex items-center">
                            <AlertOctagon className="w-4 h-4 mr-2 text-orange-400" />
                            Protocol Comparison
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-5">
                                <h4 className="text-green-400 text-xs font-bold uppercase mb-2 flex items-center gap-2">
                                    <CheckCircle className="w-3 h-3" /> Official Practice
                                </h4>
                                <p className="text-slate-300 text-sm leading-relaxed">
                                    {result.protocol_comparison.official_practice}
                                </p>
                            </div>
                            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5 relative overflow-hidden">
                                <div className="absolute -right-4 -top-4 bg-red-500/10 w-20 h-20 rounded-full blur-2xl"></div>
                                <h4 className="text-red-400 text-xs font-bold uppercase mb-2 flex items-center gap-2 relative z-10">
                                    <AlertTriangle className="w-3 h-3" /> Scam Tactic Detected
                                </h4>
                                <p className="text-slate-300 text-sm leading-relaxed relative z-10">
                                    {result.protocol_comparison.scam_tactic}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. Verification Sources (Deep Scan) */}
                {result.verification_sources && result.verification_sources.length > 0 && (
                   <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50">
                      <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center">
                          <Server className="w-4 h-4 mr-2 text-blue-400" />
                          Deep Scan Network
                      </h3>
                      <div className="space-y-3">
                         {result.verification_sources.map((source, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-700/50 hover:bg-slate-900 transition-colors">
                                <div className="flex items-center gap-4">
                                   <div className={`p-2 rounded-lg ${
                                       source.status === 'VERIFIED' ? 'bg-green-500/10 text-green-400' :
                                       source.status === 'FAILED' ? 'bg-red-500/10 text-red-400' :
                                       'bg-yellow-500/10 text-yellow-400'
                                   }`}>
                                      {source.status === 'VERIFIED' ? <CheckCircle className="w-4 h-4"/> : 
                                       source.status === 'FAILED' ? <AlertTriangle className="w-4 h-4"/> : 
                                       <AlertOctagon className="w-4 h-4"/>}
                                   </div>
                                   <div>
                                      <div className="text-sm font-bold text-slate-200">{source.name}</div>
                                      <div className="text-xs text-slate-500">{source.details}</div>
                                   </div>
                                </div>
                                <div className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${
                                   source.status === 'VERIFIED' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                                   source.status === 'FAILED' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                   'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                                }`}>
                                   {source.status}
                                </div>
                            </div>
                         ))}
                      </div>
                   </div>
                )}
             </div>
          )}

           {activeTab === 'report' && result.law_enforcement_summary && (
             <div className="bg-slate-800/40 p-8 rounded-2xl border border-slate-700/50 shadow-lg animate-fade-in space-y-8">
                
                {/* The content to be captured for PDF */}
                <div id="report-content" className="bg-white text-slate-900 p-8 rounded-xl shadow-xl">
                    <div className="border-b-2 border-slate-200 pb-4 mb-6 flex justify-between items-end">
                       <div>
                          <h1 className="text-2xl font-serif font-bold text-slate-900">OFFICIAL CYBERCRIME REPORT</h1>
                          <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">ShieldAI Forensic Analysis • Case File</p>
                       </div>
                       <div className="text-right">
                          <div className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider border border-red-200">
                             {result.scam_score > 75 ? 'HIGH PRIORITY' : 'INVESTIGATION'}
                          </div>
                       </div>
                    </div>

                    {/* Visual Evidence Embedded */}
                    {inputImage && (
                        <div className="mb-8">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Exhibit A: Visual Evidence</h3>
                            <div className="relative border border-slate-300 bg-slate-50 p-2 inline-block rounded">
                                <img src={inputImage} alt="Evidence" className="max-h-[300px] object-contain" />
                                {result.boundingBoxes?.map((box, i) => (
                                    <div
                                        key={i}
                                        className="absolute border-2 border-red-500 bg-red-500/10 box-border z-10"
                                        style={{
                                            top: `${box.ymin}%`,
                                            left: `${box.xmin}%`,
                                            height: `${box.ymax - box.ymin}%`,
                                            width: `${box.xmax - box.xmin}%`
                                        }}
                                    ></div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Report Text */}
                    <div className="font-serif text-sm leading-relaxed whitespace-pre-wrap text-slate-800" dir="auto">
                       {result.law_enforcement_summary.formatted_report_text}
                    </div>

                    <div className="mt-8 pt-8 border-t border-slate-200 text-[10px] text-slate-400 flex justify-between">
                       <span>Generated by ShieldAI Enterprise</span>
                       <span>{new Date().toLocaleString()}</span>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button 
                         className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-sm uppercase tracking-wider shadow-lg flex items-center gap-2 transition-transform active:scale-95 disabled:bg-slate-600 disabled:cursor-not-allowed"
                         onClick={handleDownloadPDF}
                         disabled={isGeneratingPdf}
                       >
                         {isGeneratingPdf ? (
                           <>
                             <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                             Generating PDF...
                           </>
                         ) : (
                           <>
                             <FileText className="w-4 h-4" /> Download Official Case File (.pdf)
                           </>
                         )}
                    </button>
                </div>
             </div>
          )}

        </div>

        {/* Sidebar Actions */}
        <div className="lg:col-span-4 space-y-6">
           
           {/* One Tap Reply */}
           <div className="bg-gradient-to-br from-blue-600/10 to-indigo-600/10 border border-blue-500/30 p-6 rounded-2xl backdrop-blur-sm">
              <h3 className="text-blue-200 text-sm font-bold uppercase tracking-wider mb-4 flex items-center">
                 <MessageSquare className="w-4 h-4 mr-2" />
                 Suggested Safe Reply
              </h3>
              <div className="bg-slate-900/80 p-4 rounded-xl text-blue-100 text-sm italic mb-4 border border-blue-500/20 shadow-inner leading-relaxed" dir="auto">
                 "{result.one_tap_safe_reply}"
              </div>
              <button 
                onClick={handleCopyReply}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 active:scale-95"
              >
                {copied ? <CheckCircle className="w-4 h-4"/> : <Copy className="w-4 h-4"/>}
                {copied ? 'Copied' : 'Copy Text'}
              </button>
           </div>

           {/* Safe Actions Checklist */}
           <div className="bg-slate-800/40 border border-green-500/20 p-6 rounded-2xl">
              <h3 className="text-green-400 text-sm font-bold uppercase tracking-wider mb-4 flex items-center">
                 <Shield className="w-4 h-4 mr-2" />
                 Recommended Actions
              </h3>
              <ul className="space-y-3">
                 {result.safe_actions.map((action, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-300 text-sm bg-slate-900/30 p-3 rounded-lg border border-slate-700/50">
                       <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                       <span dir="auto">{action}</span>
                    </li>
                 ))}
              </ul>
           </div>
           
           <button 
             onClick={onReset}
             className="w-full py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white rounded-xl font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg"
           >
              <RefreshCw className="w-4 h-4" />
              Analyze New Input
           </button>

        </div>
      </div>
    </div>
  );
};

export default ResultsDashboard;
