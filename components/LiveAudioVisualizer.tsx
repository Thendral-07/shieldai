
import React, { useEffect, useRef, useState } from 'react';
import { Mic, Activity, Zap, Waves, Search, StopCircle, Radio, BarChart3 } from 'lucide-react';

interface LiveAudioVisualizerProps {
  isListening: boolean;
  setIsListening: (val: boolean) => void;
  onAnalysisTrigger: () => void;
}

const LiveAudioVisualizer: React.FC<LiveAudioVisualizerProps> = ({ isListening, setIsListening, onAnalysisTrigger }) => {
  const spectrogramRef = useRef<HTMLCanvasElement>(null);
  const waveformRef = useRef<HTMLCanvasElement>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const rafRef = useRef<number>(0);

  const [metrics, setMetrics] = useState({ 
    db: -Infinity, 
    hz: 0, 
    note: '--', 
    voiceCertainty: 0 
  });

  // Frequency to Note mapping
  const getNote = (frequency: number) => {
    if (frequency < 20) return '--';
    const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const pitch = 12 * (Math.log(frequency / 440) / Math.log(2)) + 69;
    const noteIndex = Math.round(pitch) % 12;
    const octave = Math.floor(Math.round(pitch) / 12) - 1;
    return `${notes[noteIndex]}${octave}`;
  };

  useEffect(() => {
    if (isListening) {
      startListening();
      // Simulate auto-trigger for demo purposes occasionally
      const triggerInterval = setInterval(() => {
         if (Math.random() > 0.95) onAnalysisTrigger();
      }, 5000);
      return () => clearInterval(triggerInterval);
    } else {
      stopListening();
    }
    return () => stopListening();
  }, [isListening]);

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;

      const analyser = ctx.createAnalyser();
      // FFT Size determines frequency resolution vs time resolution
      // 2048 is good for detailed spectrum, but 1024 is faster for responsiveness
      analyser.fftSize = 2048; 
      analyser.smoothingTimeConstant = 0.2; // Lower = more jittery/responsive
      analyserRef.current = analyser;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);
      sourceRef.current = source;

      draw();
    } catch (err) {
      console.error("Microphone error:", err);
      setIsListening(false);
      alert("Microphone access denied. Please allow audio permission.");
    }
  };

  const stopListening = () => {
    if (sourceRef.current) sourceRef.current.disconnect();
    if (audioContextRef.current) audioContextRef.current.close();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    
    // Reset metrics
    setMetrics({ db: -Infinity, hz: 0, note: '--', voiceCertainty: 0 });
    
    // Clear canvases
    const waveCanvas = waveformRef.current;
    const specCanvas = spectrogramRef.current;
    if (waveCanvas) {
        const ctx = waveCanvas.getContext('2d');
        ctx?.clearRect(0, 0, waveCanvas.width, waveCanvas.height);
    }
    if (specCanvas) {
        const ctx = specCanvas.getContext('2d');
        ctx?.clearRect(0, 0, specCanvas.width, specCanvas.height);
    }
  };

  const draw = () => {
    if (!analyserRef.current || !spectrogramRef.current || !waveformRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const freqData = new Uint8Array(bufferLength);
    const timeData = new Uint8Array(bufferLength);
    
    const specCanvas = spectrogramRef.current;
    const waveCanvas = waveformRef.current;
    
    // Optimization: Get contexts once or assume they exist
    const specCtx = specCanvas.getContext('2d', { willReadFrequently: true });
    const waveCtx = waveCanvas.getContext('2d');

    if (!specCtx || !waveCtx) return;

    const renderFrame = () => {
      rafRef.current = requestAnimationFrame(renderFrame);
      analyserRef.current!.getByteFrequencyData(freqData);
      analyserRef.current!.getByteTimeDomainData(timeData);

      // --- 1. SPECTROGRAM (Waterfall) ---
      // Shift the existing canvas image to the left by 2 pixels
      specCtx.drawImage(specCanvas, -2, 0);
      
      // Draw new frequency column at the right edge
      // Focus on 0-5kHz range where human voice lives (approx first 25% of bins if 44.1kHz)
      const meaningfulBins = Math.floor(bufferLength / 2); 
      const binHeight = specCanvas.height / meaningfulBins;
      
      for (let i = 0; i < meaningfulBins; i++) {
         const value = freqData[i];
         if (value > 10) { // Noise gate
             // Map value (0-255) to Color (Heatmap style)
             // Low: Blue, Mid: Green, High: Red/White
             const hue = 260 - (value / 255) * 260; 
             const lightness = 30 + (value / 255) * 60;
             const alpha = value / 255;
             
             specCtx.fillStyle = `hsla(${hue}, 100%, ${lightness}%, ${alpha})`;
             
             // Draw pixel (or small rect). Invert Y so low freq is at bottom.
             const y = specCanvas.height - (i * binHeight) - binHeight;
             // Width of 2px to match scroll speed
             specCtx.fillRect(specCanvas.width - 2, y, 2, Math.ceil(binHeight));
         } else {
             // Clear background for silence
             specCtx.clearRect(specCanvas.width - 2, specCanvas.height - (i * binHeight) - binHeight, 2, Math.ceil(binHeight));
         }
      }

      // --- 2. OSCILLOSCOPE (Waveform) ---
      waveCtx.clearRect(0, 0, waveCanvas.width, waveCanvas.height);
      waveCtx.lineWidth = 2;
      // Dynamic color based on volume
      const volumeCheck = freqData.reduce((a, b) => a + b, 0) / bufferLength;
      waveCtx.strokeStyle = volumeCheck > 50 ? '#ef4444' : '#38bdf8'; 
      
      waveCtx.beginPath();
      const sliceWidth = waveCanvas.width / bufferLength;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
          const v = timeData[i] / 128.0; // Normalized 0..2
          const y = (v * waveCanvas.height) / 2;
          
          if (i === 0) waveCtx.moveTo(x, y);
          else waveCtx.lineTo(x, y);
          x += sliceWidth;
      }
      waveCtx.stroke();

      // --- 3. METRICS (Throttled update) ---
      if (Math.random() > 0.8) { // Update roughly every 5-6 frames
          // Dominant Frequency
          let maxVal = -1;
          let maxIndex = -1;
          for (let i = 0; i < bufferLength; i++) {
              if (freqData[i] > maxVal) {
                  maxVal = freqData[i];
                  maxIndex = i;
              }
          }
          const nyquist = audioContextRef.current!.sampleRate / 2;
          const dominantHz = maxIndex * (nyquist / bufferLength);
          
          // RMS / dB
          let sumSquares = 0;
          for(let i = 0; i < bufferLength; i++) {
             const normalized = (timeData[i] - 128) / 128;
             sumSquares += normalized * normalized;
          }
          const rms = Math.sqrt(sumSquares / bufferLength);
          const db = 20 * Math.log10(rms || 0.001); 

          // Voice Certainty (Simulated based on spectral density)
          const voiceCertainty = Math.min(100, (volumeCheck / 255) * 200);

          setMetrics({
              db: Math.round(db),
              hz: Math.round(dominantHz),
              note: getNote(dominantHz),
              voiceCertainty: Math.round(voiceCertainty)
          });
      }
    };
    renderFrame();
  };

  return (
    <div className="relative w-full h-[360px] bg-[#020617] rounded-3xl border border-slate-700/80 overflow-hidden flex flex-col shadow-2xl group">
      
      {/* Visualizers */}
      <div className="absolute inset-0 z-0 bg-grid-slate-800/[0.1] bg-[size:40px_40px]" />
      
      {/* 1. Spectrogram (Background Layer) */}
      <canvas 
        ref={spectrogramRef} 
        width={800} 
        height={360} 
        className="absolute inset-0 w-full h-full opacity-60 mix-blend-screen"
      />
      
      {/* 2. Waveform (Foreground Layer) */}
      <canvas 
        ref={waveformRef} 
        width={800} 
        height={360} 
        className="absolute inset-0 w-full h-full z-10 opacity-90"
      />

      {/* 3. Data HUD Overlay */}
      <div className="absolute inset-0 z-20 pointer-events-none p-6 flex flex-col justify-between">
         
         {/* Top HUD */}
         <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold tracking-widest uppercase">
                   <Activity className="w-3 h-3" /> Spectrogram Analysis
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                   FFT: 2048 • RATE: 44.1kHz
                </div>
            </div>
            {isListening && (
                <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    <span className="text-red-500 font-bold font-mono text-xs tracking-wider">LIVE FEED</span>
                </div>
            )}
         </div>

         {/* Center UI (Only when idle) */}
         {!isListening && (
             <div className="absolute inset-0 flex items-center justify-center pointer-events-auto bg-black/40 backdrop-blur-sm transition-all duration-500">
                <div className="text-center space-y-6 animate-fade-in-up">
                    <div className="inline-flex p-6 rounded-full bg-slate-800/80 border border-slate-600 shadow-2xl relative group-hover:scale-105 transition-transform duration-300">
                        <Waves className="w-12 h-12 text-cyan-400" />
                        <div className="absolute inset-0 rounded-full border border-cyan-500/30 animate-ping opacity-20"></div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-white tracking-tight">Audio Intercept</h3>
                        <p className="text-slate-400 text-sm mt-2 max-w-xs mx-auto">
                            Activate neural sensors to detect deepfake patterns and synthetic voice artifacts.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsListening(true)}
                        className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold uppercase tracking-wider shadow-lg shadow-cyan-900/40 transition-all flex items-center gap-2 mx-auto active:scale-95"
                    >
                        <Zap className="w-4 h-4" /> Initialize Sensor
                    </button>
                </div>
             </div>
         )}

         {/* Bottom HUD (Metrics) */}
         {isListening && (
             <div className="grid grid-cols-4 gap-4 bg-slate-900/80 backdrop-blur-md p-4 rounded-xl border border-slate-700/50 shadow-xl pointer-events-auto">
                 
                 <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Signal</span>
                    <div className="flex items-baseline gap-1">
                        <span className={`text-xl font-mono font-bold ${metrics.db > -10 ? 'text-red-500' : 'text-slate-200'}`}>
                           {metrics.db > -100 ? metrics.db : '--'}
                        </span>
                        <span className="text-xs text-slate-600 font-bold">dB</span>
                    </div>
                 </div>

                 <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Pitch</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-xl font-mono font-bold text-slate-200">{metrics.hz}</span>
                        <span className="text-xs text-slate-600 font-bold">Hz</span>
                    </div>
                    <span className="text-[10px] text-cyan-400 font-mono">{metrics.note}</span>
                 </div>

                 <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Certainty</span>
                    <div className="w-full bg-slate-800 h-2 mt-2 rounded-full overflow-hidden">
                        <div 
                           className="h-full bg-cyan-500 transition-all duration-300"
                           style={{ width: `${metrics.voiceCertainty}%` }}
                        ></div>
                    </div>
                    <span className="text-[10px] text-right text-slate-400 mt-1 font-mono">{metrics.voiceCertainty}%</span>
                 </div>

                 <div className="flex flex-col justify-center">
                    <button 
                        onClick={() => setIsListening(false)}
                        className="w-full h-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 text-red-500 rounded-lg flex flex-col items-center justify-center transition-colors group/stop"
                    >
                        <StopCircle className="w-5 h-5 mb-1 group-hover/stop:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold uppercase">Term</span>
                    </button>
                 </div>

             </div>
         )}
      </div>

    </div>
  );
};

export default LiveAudioVisualizer;
