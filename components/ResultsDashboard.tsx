
import React, { useState } from 'react';
import { AnalysisResult } from '../types.ts';
import AnalysisGauge from './AnalysisGauge.tsx';
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
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleCopyReply = () => {
    navigator.clipboard.writeText(result.one_tap_safe_reply);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPdf(true);
    try {
      const element = document.getElementById('report-content');
      if (!element) return;
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('ShieldAI_Report.pdf');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const getSeverityColor = (score: number) => {
    if (score <= 20) return 'text-green-400 bg-green-500/10 border-green-500/20';
    if (score <= 50) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    return 'text-red-500 bg-red-500/10 border-red-500/20';
  };

  return (
    <div className="w-full max-w-7xl mx-auto animate-fade-in space-y-8 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-800/60 backdrop-blur-xl p-6 rounded-3xl border border-slate-700/50 shadow-2xl">
         <div className="md:col-span-3 flex justify-center items-center h-48 md:h-auto">
            <div className="w-full h-full max-w-[220px]"><AnalysisGauge score={result.scam_score} /></div>
         </div>
         <div className="md:col-span-6 flex flex-col justify-center text-center md:text-left space-y-3">
             <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                 {result.target_region && <div className="text-[10px] font-bold text-slate-300 bg-slate-700/50 px-2.5 py-1 rounded-md border border-slate-600 uppercase tracking-wider">{result.target_region}</div>}
                 <div className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getSeverityColor(result.scam_score)}`}>{result.scam_score > 75 ? 'Critical Threat' : 'Analysis Complete'}</div>
             </div>
             <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">{result.scam_type}</h2>
             <div className="text-slate-400 text-sm font-medium flex items-center justify-center md:justify-start gap-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <span>AI Confidence: <span className="text-white">{result.confidence_score || 94}%</span></span>
             </div>
         </div>
         <div className="md:col-span-3 flex flex-col justify-center items-center md:items-end">
             <div className="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-2">Evidence</div>
             <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/60 shadow-inner w-full max-w-[200px] flex items-center gap-3">
                {inputImage ? <img src={inputImage} alt="Input" className="w-12 h-12 object-cover rounded-lg" /> : <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center"><Type className="w-5 h-5 text-slate-500" /></div>}
                <div className="flex flex-col min-w-0"><span className="text-xs text-slate-200 font-bold">{inputImage ? 'Visual' : 'Text'}</span></div>
             </div>
         </div>
      </div>

      <div className="flex justify-center gap-4 py-2 sticky top-20 z-20">
          {['overview', 'deep_scan', 'report'].map(tab => (
             <button key={tab} onClick={() => setActiveTab(tab as Tab)} className={`px-6 py-2.5 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'}`}>{tab.replace('_', ' ')}</button>
          ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 shadow-lg backdrop-blur-sm">
                 <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center"><Sparkles className="w-4 h-4 mr-2 text-blue-400" />Reasoning</h3>
                 <p className="text-slate-200 leading-relaxed text-lg font-light">{result.explanation}</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                 {result.red_flags.map((flag, i) => (
                    <div key={i} className="bg-red-500/5 border border-red-500/20 p-4 rounded-xl flex items-start gap-3">
                       <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                       <span className="text-red-100/90 text-sm font-medium">{flag}</span>
                    </div>
                 ))}
              </div>
            </div>
          )}
          {activeTab === 'deep_scan' && (
             <div className="space-y-6 animate-fade-in">
                {result.protocol_comparison && (
                    <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700/50">
                        <h3 className="text-sm font-bold text-slate-300 uppercase mb-6 flex items-center"><AlertOctagon className="w-4 h-4 mr-2 text-orange-400" />Protocol Comparison</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-5"><h4 className="text-green-400 text-xs font-bold uppercase mb-2">Official Practice</h4><p className="text-slate-300 text-sm">{result.protocol_comparison.official_practice}</p></div>
                            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5"><h4 className="text-red-400 text-xs font-bold uppercase mb-2">Detected Tactic</h4><p className="text-slate-300 text-sm">{result.protocol_comparison.scam_tactic}</p></div>
                        </div>
                    </div>
                )}
             </div>
          )}
          {activeTab === 'report' && result.law_enforcement_summary && (
             <div className="space-y-6 animate-fade-in">
                <div id="report-content" className="bg-white text-slate-900 p-8 rounded-xl shadow-xl font-serif">
                    <h1 className="text-2xl font-bold border-b-2 border-slate-200 pb-4 mb-6">OFFICIAL CYBERCRIME REPORT</h1>
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">{result.law_enforcement_summary.formatted_report_text}</div>
                </div>
                <div className="flex justify-end"><button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-sm uppercase" onClick={handleDownloadPDF} disabled={isGeneratingPdf}>{isGeneratingPdf ? 'Generating...' : 'Download PDF'}</button></div>
             </div>
          )}
        </div>
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-gradient-to-br from-blue-600/10 to-indigo-600/10 border border-blue-500/30 p-6 rounded-2xl backdrop-blur-sm">
              <h3 className="text-blue-200 text-sm font-bold uppercase mb-4 flex items-center"><MessageSquare className="w-4 h-4 mr-2" />Suggested Safe Reply</h3>
              <div className="bg-slate-900/80 p-4 rounded-xl text-blue-100 text-sm italic mb-4 border border-blue-500/20">"{result.one_tap_safe_reply}"</div>
              <button onClick={handleCopyReply} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2">{copied ? 'Copied' : 'Copy Text'}</button>
           </div>
           <button onClick={onReset} className="w-full py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl font-bold uppercase flex items-center justify-center gap-2"><RefreshCw className="w-4 h-4" />New Scan</button>
        </div>
      </div>
    </div>
  );
};

export default ResultsDashboard;
