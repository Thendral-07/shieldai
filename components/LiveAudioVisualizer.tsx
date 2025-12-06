
import React, { useEffect, useRef, useState } from 'react';
import { Mic, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';

interface LiveAudioVisualizerProps {
  isListening: boolean;
  setIsListening: (val: boolean) => void;
  onAnalysisTrigger: () => void;
}

const LiveAudioVisualizer: React.FC<LiveAudioVisualizerProps> = ({ isListening, setIsListening, onAnalysisTrigger }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number>(0);
  
  const [threatLevel, setThreatLevel] = useState<number>(0); // 0-100 for visual effect

  useEffect(() => {
    if (isListening) {
      startListening();
      // Simulate random threat spikes for demo purposes
      const interval = setInterval(() => {
         setThreatLevel(Math.floor(Math.random() * 30));
         // Simulate periodic auto-analysis trigger
         if(Math.random() > 0.8) onAnalysisTrigger();
      }, 3000);
      return () => clearInterval(interval);
    } else {
      stopListening();
    }
    return () => stopListening();
  }, [isListening]);

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      sourceRef.current.connect(analyserRef.current);
      
      draw();
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setIsListening(false);
      alert("Microphone access denied. Please allow permission to use Real-time Intercept.");
    }
  };

  const stopListening = () => {
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current.mediaStream.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    cancelAnimationFrame(animationFrameRef.current);
    setThreatLevel(0);
  };

  const draw = () => {
    if (!analyserRef.current || !canvasRef.current) return;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderFrame = () => {
      animationFrameRef.current = requestAnimationFrame(renderFrame);
      analyserRef.current!.getByteFrequencyData(dataArray);

      ctx.fillStyle = '#0f172a'; // Match bg
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2; // Scale down
        
        // Dynamic color based on threat simulation
        const hue = threatLevel > 50 ? 0 : 220; // Red if threat, Blue if safe
        ctx.fillStyle = `hsl(${hue}, 80%, 50%)`;

        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };

    renderFrame();
  };

  return (
    <div className="relative w-full h-[300px] bg-slate-900 rounded-3xl border border-slate-700 overflow-hidden flex flex-col items-center justify-center">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />
      
      <canvas 
        ref={canvasRef} 
        width={600} 
        height={300} 
        className="absolute inset-0 w-full h-full opacity-60"
      />

      {/* Overlay UI */}
      <div className="relative z-10 flex flex-col items-center space-y-6">
        <div className={`p-6 rounded-full border-4 transition-all duration-500 ${isListening ? 'bg-red-500/10 border-red-500 animate-pulse' : 'bg-slate-800 border-slate-600'}`}>
          <Mic className={`w-12 h-12 ${isListening ? 'text-red-500' : 'text-slate-400'}`} />
        </div>

        <div className="text-center space-y-2">
           <h3 className="text-2xl font-bold text-white tracking-tight">
             {isListening ? 'Monitoring Live Call...' : 'Real-Time Intercept Ready'}
           </h3>
           <p className="text-slate-400 text-sm max-w-xs mx-auto">
             {isListening 
               ? 'Analyzing audio patterns for urgency, fear, and robotic speech...' 
               : 'Tap below to start monitoring audio streams for scam indicators.'}
           </p>
        </div>

        <button
          onClick={() => setIsListening(!isListening)}
          className={`px-8 py-3 rounded-full font-bold uppercase tracking-wider transition-all shadow-lg ${
             isListening 
             ? 'bg-slate-800 text-white border border-slate-600 hover:bg-slate-700' 
             : 'bg-red-600 hover:bg-red-500 text-white shadow-red-500/30'
          }`}
        >
          {isListening ? 'Stop Monitoring' : 'Start Intercept'}
        </button>
      </div>
      
      {isListening && (
        <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
           <div className="flex items-center gap-2 bg-red-500/20 text-red-400 px-3 py-1 rounded-lg border border-red-500/30 text-xs font-bold uppercase animate-pulse">
             <Activity className="w-4 h-4" /> Live Analysis
           </div>
           <div className="text-[10px] text-slate-500 font-mono">
             Neural Engine: Active
           </div>
        </div>
      )}
    </div>
  );
};

export default LiveAudioVisualizer;
