
import React, { useRef, useState } from 'react';
import { InputMode, DemoScenario } from '../types.ts';
import { DEMO_SCENARIOS } from '../constants.ts';
import { Mic, Type, Image as ImageIcon, AlertCircle, FileText, X, PhoneIncoming } from 'lucide-react';
import LiveAudioVisualizer from './LiveAudioVisualizer.tsx';

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
    if (e.target.files && e.target.files[0]) processFile(e.target.files[0]);
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
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
  };

  const loadDemo = (scenario: DemoScenario) => {
    setPreviewUrl(null);
    setImageFile(null);
    setAudioFile(null);
    setTextInput('');
    if (scenario.type === InputMode.TEXT) {
      setInputMode(InputMode.TEXT);
      setTextInput(scenario.content);
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
              inputMode === mode ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
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

      {inputMode === InputMode.LIVE_CALL ? (
         <LiveAudioVisualizer 
            isListening={isListening} 
            setIsListening={setIsListening} 
            onAnalysisTrigger={onAnalyze}
         />
      ) : (
        <div 
          className={`relative bg-slate-900/40 border-2 border-dashed rounded-3xl min-h-[350px] flex flex-col transition-all duration-300 ${
            dragActive ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700'
          }`}
          onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
        >
          {inputMode === InputMode.TEXT && (
            <div className="p-8 flex-1 flex flex-col">
              <textarea value={textInput} onChange={(e) => setTextInput(e.target.value)} placeholder="Paste suspicious message or URL here..." className="w-full flex-1 bg-transparent text-lg text-slate-200 placeholder-slate-500 resize-none focus:outline-none" />
            </div>
          )}

          {inputMode === InputMode.IMAGE && (
            <div onClick={() => !previewUrl && fileInputRef.current?.click()} className="flex-1 flex flex-col items-center justify-center p-8 cursor-pointer">
              {previewUrl ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <img src={previewUrl} alt="Preview" className="max-h-[300px] rounded-lg shadow-2xl object-contain" />
                  <button onClick={clearFile} className="absolute top-2 right-2 p-2 bg-slate-900/80 rounded-full text-white"><X className="w-5 h-5" /></button>
                </div>
              ) : (
                <div className="text-center">
                  <ImageIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-xl text-slate-300">Drop screenshot or document</p>
                </div>
              )}
              <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>
          )}

          {inputMode === InputMode.AUDIO && (
            <div onClick={() => !audioFile && fileInputRef.current?.click()} className="flex-1 flex flex-col items-center justify-center p-8 cursor-pointer">
               {audioFile ? (
                 <div className="text-center relative">
                   <button onClick={clearFile} className="absolute -top-10 right-0 p-2 text-slate-400"><X className="w-5 h-5" /></button>
                   <Mic className="w-12 h-12 text-blue-400 mx-auto mb-4 animate-pulse" />
                   <p className="text-white font-medium">{audioFile.name}</p>
                 </div>
               ) : (
                 <div className="text-center">
                  <Mic className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-xl text-slate-300">Drop voice note or recording</p>
                 </div>
               )}
              <input type="file" ref={fileInputRef} accept="audio/*" className="hidden" onChange={handleFileChange} />
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
             <div className="flex gap-2 overflow-x-auto max-w-full pb-2 sm:pb-0">
                {DEMO_SCENARIOS.map(scenario => (
                  <button key={scenario.id} onClick={() => loadDemo(scenario)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-full text-xs font-bold text-slate-300 border border-slate-700 whitespace-nowrap">
                    {scenario.title}
                  </button>
                ))}
             </div>
             <button
               onClick={onAnalyze}
               disabled={isAnalyzing || (inputMode === InputMode.LIVE_CALL && !isListening)}
               className={`px-8 py-4 rounded-xl font-bold text-white shadow-2xl min-w-[200px] ${
                 isAnalyzing || (inputMode === InputMode.LIVE_CALL && !isListening) ? 'bg-slate-700 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'
               }`}
             >
               {isAnalyzing ? "Processing..." : inputMode === InputMode.LIVE_CALL ? 'INTERCEPT CALL' : 'INITIATE SCAN'}
             </button>
      </div>
    </div>
  );
};

export default InputSection;
