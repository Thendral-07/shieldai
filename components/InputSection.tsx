
import React, { useRef, useState } from 'react';
import { InputMode, DemoScenario } from '../types';
import { DEMO_SCENARIOS } from '../constants';
import { Mic, Type, Image as ImageIcon, AlertCircle, FileText, X, PhoneIncoming } from 'lucide-react';
import LiveAudioVisualizer from './LiveAudioVisualizer';

interface InputSectionProps {
  inputMode: InputMode;
  setInputMode: (mode: InputMode) => void;
  textInput: string;
  setTextInput: (text: string) => void;
  setImageFile: (file: File | null) => void;
  setAudioFile: (file: File | null) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  imageFile: File | null;
  audioFile: File | null;
}

const InputSection: React.FC<InputSectionProps> = ({
  inputMode,
  setInputMode,
  textInput,
  setTextInput,
  setImageFile,
  setAudioFile,
  onAnalyze,
  isAnalyzing,
  imageFile,
  audioFile
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (inputMode === InputMode.IMAGE && file.type.startsWith('image/')) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setPreviewUrl(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else if (inputMode === InputMode.AUDIO && file.type.startsWith('audio/')) {
      setAudioFile(file);
      setPreviewUrl(null);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const loadDemo = (scenario: DemoScenario) => {
    setPreviewUrl(null);
    setImageFile(null);
    setAudioFile(null);
    setTextInput('');

    if (scenario.type === InputMode.TEXT) {
      setInputMode(InputMode.TEXT);
      setTextInput(scenario.content);
    } else {
        alert("For this demo, please select 'Bank SMS' or 'Job Scam' to see the text analysis features instantly.");
    }
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImageFile(null);
    setAudioFile(null);
    setPreviewUrl(null);
    if(fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      
      {/* Modern Tabs */}
      <div className="flex p-1 bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-lg overflow-x-auto">
        {[InputMode.TEXT, InputMode.IMAGE, InputMode.AUDIO, InputMode.LIVE_CALL].map((mode) => (
          <button
            key={mode}
            onClick={() => {
              setInputMode(mode);
              setPreviewUrl(null);
              setImageFile(null);
              setAudioFile(null);
              setIsListening(false);
            }}
            className={`flex-1 flex items-center justify-center py-3 px-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 whitespace-nowrap ${
              inputMode === mode
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 scale-100'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            {mode === InputMode.TEXT && <Type className="w-4 h-4 mr-2" />}
            {mode === InputMode.IMAGE && <ImageIcon className="w-4 h-4 mr-2" />}
            {mode === InputMode.AUDIO && <Mic className="w-4 h-4 mr-2" />}
            {mode === InputMode.LIVE_CALL && <PhoneIncoming className="w-4 h-4 mr-2" />}
            {mode === InputMode.LIVE_CALL ? "LIVE CALL" : mode.charAt(0) + mode.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Input Area */}
      {inputMode === InputMode.LIVE_CALL ? (
         <LiveAudioVisualizer 
            isListening={isListening} 
            setIsListening={setIsListening} 
            onAnalysisTrigger={() => {
                // Simulate capture and analysis
                alert("Simulating call audio capture for Gemini analysis...");
                onAnalyze();
            }}
         />
      ) : (
        <div 
          className={`relative bg-slate-900/40 border-2 border-dashed rounded-3xl min-h-[350px] flex flex-col transition-all duration-300 backdrop-blur-sm ${
            dragActive ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 hover:border-slate-600'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {inputMode === InputMode.TEXT && (
            <div className="p-8 flex-1 flex flex-col">
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Paste suspicious message, email, URL or any text here..."
                className="w-full flex-1 bg-transparent text-lg text-slate-200 placeholder-slate-500 resize-none focus:outline-none leading-relaxed"
              />
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-800">
                <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Secure Text Analysis</span>
                <span className="text-xs text-slate-500">{textInput.length} chars</span>
              </div>
            </div>
          )}

          {inputMode === InputMode.IMAGE && (
            <div 
              onClick={() => !previewUrl && fileInputRef.current?.click()}
              className={`flex-1 flex flex-col items-center justify-center p-8 cursor-pointer ${previewUrl ? 'cursor-default' : ''}`}
            >
              {previewUrl ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <img src={previewUrl} alt="Preview" className="max-h-[300px] rounded-lg shadow-2xl object-contain border border-slate-700" />
                  <button 
                    onClick={clearFile}
                    className="absolute top-2 right-2 p-2 bg-slate-900/80 rounded-full hover:bg-red-500/80 text-white transition-colors backdrop-blur-sm border border-slate-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="w-24 h-24 bg-slate-800/80 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-xl border border-slate-700">
                     <ImageIcon className="w-12 h-12 text-slate-400" />
                  </div>
                  <p className="text-2xl text-slate-300 font-semibold tracking-tight">Drop screenshot or document</p>
                  <p className="text-sm text-slate-500 mt-2">Supports JPG, PNG, WEBP</p>
                </>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange}
              />
            </div>
          )}

          {inputMode === InputMode.AUDIO && (
            <div 
              onClick={() => !audioFile && fileInputRef.current?.click()}
              className={`flex-1 flex flex-col items-center justify-center p-8 cursor-pointer ${audioFile ? 'cursor-default' : ''}`}
            >
               {audioFile ? (
                 <div className="text-center relative w-full">
                   <button 
                    onClick={clearFile}
                    className="absolute -top-10 right-0 p-2 text-slate-400 hover:text-red-400 transition-colors"
                   >
                    <X className="w-5 h-5" />
                   </button>
                   <div className="w-32 h-32 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-400 animate-pulse border border-blue-500/20">
                      <Mic className="w-12 h-12" />
                   </div>
                   <p className="text-white font-medium text-xl">{audioFile.name}</p>
                   <p className="text-sm text-green-400 mt-2 font-mono uppercase tracking-wider">Audio Loaded • Ready to Scan</p>
                 </div>
               ) : (
                 <>
                  <div className="w-24 h-24 bg-slate-800/80 rounded-full flex items-center justify-center mb-6 shadow-xl border border-slate-700">
                     <Mic className="w-12 h-12 text-slate-400" />
                  </div>
                  <p className="text-2xl text-slate-300 font-semibold tracking-tight">Drop voice note or call recording</p>
                  <p className="text-sm text-slate-500 mt-2">MP3, WAV supported for tonal analysis</p>
                 </>
               )}
              <input 
                type="file" 
                ref={fileInputRef} 
                accept="audio/*" 
                className="hidden" 
                onChange={handleFileChange}
              />
            </div>
          )}
        </div>
      )}

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-2">
             <div className="flex gap-2 overflow-x-auto max-w-full pb-2 sm:pb-0 scrollbar-hide mask-fade-right">
                {DEMO_SCENARIOS.map(scenario => (
                  <button 
                    key={scenario.id}
                    onClick={() => loadDemo(scenario)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-full text-xs font-bold text-slate-300 whitespace-nowrap transition-colors border border-slate-700 uppercase tracking-wider"
                  >
                    <FileText className="w-3 h-3 inline mr-2 text-slate-500" />
                    {scenario.title}
                  </button>
                ))}
             </div>

             <button
               onClick={onAnalyze}
               disabled={isAnalyzing || (inputMode === InputMode.LIVE_CALL && !isListening)}
               className={`w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-white shadow-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center min-w-[240px] ml-auto ${
                 isAnalyzing || (inputMode === InputMode.LIVE_CALL && !isListening)
                  ? 'bg-slate-700 cursor-not-allowed text-slate-400 border border-slate-600' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-900/30 border border-blue-500/50'
               }`}
             >
               {isAnalyzing ? (
                 <div className="flex items-center">
                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                   Processing...
                 </div>
               ) : (
                 <>
                   <AlertCircle className="w-5 h-5 mr-2" />
                   {inputMode === InputMode.LIVE_CALL ? 'INTERCEPT CALL' : 'INITIATE SCAN'}
                 </>
               )}
             </button>
      </div>
    </div>
  );
};

export default InputSection;
