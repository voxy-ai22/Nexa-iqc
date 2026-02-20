/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, 
  Activity, 
  Server, 
  Database, 
  Download, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  ExternalLink,
  ChevronRight,
  Image as ImageIcon,
  Sparkles,
  Copy,
  Maximize2,
  Minimize2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
interface CreationLog {
  id: string;
  timestamp: string;
  text: string;
  status: 'BERHASIL' | 'GAGAL' | 'PROSES';
}

export default function App() {
  // --- State ---
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [history, setHistory] = useState<CreationLog[]>([]);
  const [serverCondition, setServerCondition] = useState(99.8);
  const [totalCreated, setTotalCreated] = useState(0);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const historyEndRef = useRef<HTMLDivElement>(null);

  // --- Initialization ---
  useEffect(() => {
    const savedHistory = localStorage.getItem('nexa_iqc_history');
    const savedTotal = localStorage.getItem('nexa_iqc_total');
    
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedTotal) setTotalCreated(parseInt(savedTotal, 10));

    // Server Condition interval (Random visual effect)
    const interval = setInterval(() => {
      setServerCondition(parseFloat((Math.random() * (100 - 99) + 99).toFixed(2)));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // --- Persistence ---
  useEffect(() => {
    localStorage.setItem('nexa_iqc_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('nexa_iqc_total', totalCreated.toString());
  }, [totalCreated]);

  // --- Scroll to bottom of history ---
  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  // --- Handlers ---
  const generateImage = async () => {
    if (!input.trim() || isGenerating) return;

    setIsGenerating(true);
    const newId = Math.random().toString(36).substring(7);
    const timestamp = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    const pendingLog: CreationLog = {
      id: newId,
      timestamp,
      text: input.trim(),
      status: 'PROSES'
    };

    setHistory(prev => [...prev, pendingLog]);

    try {
      // We use the URL directly for the image, but we can fetch to check if it's up
      const apiUrl = `https://api.nexray.web.id/maker/iqc?text=${encodeURIComponent(input.trim())}`;
      
      // Simulate a small delay for the "Scanning" effect feel
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setResultImage(apiUrl);
      setIsImageLoading(true);
      setTotalCreated(prev => prev + 1);
      
      setHistory(prev => prev.map(item => 
        item.id === newId ? { ...item, status: 'BERHASIL' } : item
      ));
    } catch (error) {
      console.error('Gagal generate:', error);
      setHistory(prev => prev.map(item => 
        item.id === newId ? { ...item, status: 'GAGAL' } : item
      ));
    } finally {
      setIsGenerating(false);
    }
  };

  const clearHistory = () => {
    if (confirm('Yakin mau hapus semua riwayat ciptaan kamu?')) {
      setHistory([]);
      localStorage.removeItem('nexa_iqc_history');
    }
  };

  const downloadImage = async () => {
    if (!resultImage) return;

    try {
      const response = await fetch(resultImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `nexa-iqc-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Waduh, gagal download otomatis. Klik kanan gambarnya terus pilih "Simpan Gambar" ya!');
      window.open(resultImage, '_blank');
    }
  };

  const copyToClipboard = async () => {
    if (!resultImage) return;
    try {
      await navigator.clipboard.writeText(resultImage);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Gagal copy:', err);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col gap-6 max-w-6xl mx-auto selection:bg-indigo-500 selection:text-white">
      {/* --- Zoom Modal --- */}
      <AnimatePresence>
        {isZoomed && resultImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-10"
            onClick={() => setIsZoomed(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-full max-h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setIsZoomed(false)}
                className="absolute -top-12 right-0 p-2 bg-white text-black neo-brutal hover:bg-red-500 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <img 
                src={resultImage} 
                alt="Zoomed Result" 
                className="max-w-full max-h-full object-contain neo-brutal-no-hover"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* --- Branding Header --- */}
      <header className="flex flex-col items-center text-center mb-4">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-3 mb-2"
        >
          <div className="p-3 bg-indigo-500 neo-brutal">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-extrabold text-white tracking-tighter uppercase italic">
            Nexa <span className="text-indigo-500">IQC</span>
          </h1>
        </motion.div>
        <p className="text-zinc-400 font-medium text-lg max-w-md">
          Buat Iqc iphone generator di sini! 🚀
        </p>
      </header>

      {/* --- Stats Row --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Server Status */}
        <div className="bg-zinc-900 neo-brutal-no-hover p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-green-500/10 border-2 border-green-500/20 rounded-xl">
              <Server className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-xs font-mono text-zinc-500 uppercase font-bold">Kondisi Server</p>
              <p className="font-bold text-zinc-100 text-lg">Server Lagi Aman</p>
            </div>
          </div>
          <div className="relative flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
          </div>
        </div>

        {/* Server Health % */}
        <div className="bg-zinc-900 neo-brutal-no-hover p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-yellow-500/10 border-2 border-yellow-500/20 rounded-xl">
                <Activity className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-xs font-mono text-zinc-500 uppercase font-bold">Kesehatan Sistem</p>
                <p className="font-bold text-yellow-400 text-lg">{serverCondition}%</p>
              </div>
            </div>
          </div>
          <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden border-2 border-black">
            <motion.div 
              className="bg-yellow-400 h-full"
              animate={{ width: `${serverCondition}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Total Created */}
        <div className="bg-zinc-900 neo-brutal-no-hover p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-indigo-500/10 border-2 border-indigo-500/20 rounded-xl">
              <Database className="w-6 h-6 text-indigo-500" />
            </div>
            <div>
              <p className="text-xs font-mono text-zinc-500 uppercase font-bold">Kartu yang Udah Dibuat</p>
              <p className="font-bold text-zinc-100 text-lg">{totalCreated.toLocaleString()}</p>
            </div>
          </div>
          <Zap className="w-6 h-6 text-indigo-500 fill-indigo-500/20" />
        </div>
      </div>

      {/* --- Main Workspace --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        {/* Input Section */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-zinc-900 neo-brutal-no-hover flex-1 flex flex-col">
            <div className="bg-zinc-800 border-b-[3px] border-black p-4 flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-black"></div>
                <div className="w-3.5 h-3.5 rounded-full bg-yellow-500 border-2 border-black"></div>
                <div className="w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-black"></div>
              </div>
              <span className="text-xs font-mono font-black text-zinc-400 uppercase tracking-widest">Generator Panel</span>
            </div>
            
            <div className="p-8 flex-1 flex flex-col gap-8">
              <div className="space-y-3">
                <label className="text-sm font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-indigo-500" />
                  Tulis Kata-katanya
                </label>
                <div className="relative">
                  <textarea 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Contoh: 'Hidup itu seperti kopi, kadang pahit tapi bikin melek...'"
                    className="w-full bg-black border-[3px] border-black p-5 font-mono text-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] min-h-[150px] resize-none text-lg"
                  />
                </div>
              </div>

              <button 
                onClick={generateImage}
                disabled={isGenerating || !input.trim()}
                className="w-full py-5 bg-indigo-500 text-white font-black text-xl uppercase tracking-widest flex items-center justify-center gap-4 neo-brutal disabled:opacity-50 disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-none group"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-7 h-7 animate-spin" />
                    LAGI PROSES...
                  </>
                ) : (
                  <>
                    <Zap className="w-7 h-7 fill-current group-hover:scale-125 transition-transform" />
                    GAS GENERATE! 🚀
                  </>
                )}
              </button>

              <div className="bg-indigo-500/5 border-2 border-indigo-500/20 p-5 rounded-2xl font-mono text-xs text-zinc-500 leading-relaxed">
                <p className="text-indigo-400 mb-2 font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> TIPS CEPAT:
                </p>
                <p>• Gunakan kata-kata yang singkat & padat biar hasilnya makin kece.</p>
                <p>• Tekan tombol di atas buat mulai bikin kartu kamu.</p>
                <p>• Hasilnya bisa langsung kamu simpan & share ke sosmed!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="lg:col-span-7">
          <div className="bg-zinc-900 neo-brutal-no-hover h-full flex flex-col">
            <div className="bg-zinc-800 border-b-[3px] border-black p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ImageIcon className="w-5 h-5 text-indigo-400" />
                <span className="text-xs font-mono font-black text-zinc-400 uppercase tracking-widest">Hasil Kartu Kamu</span>
              </div>
              <div className="flex items-center gap-2">
                {resultImage && (
                  <>
                    <button 
                      onClick={copyToClipboard}
                      title="Copy Link Gambar"
                      className="p-2 bg-zinc-700 text-white neo-brutal hover:bg-indigo-500 transition-colors"
                    >
                      {copySuccess ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={() => setIsZoomed(true)}
                      title="Zoom Gambar"
                      className="p-2 bg-zinc-700 text-white neo-brutal hover:bg-indigo-500 transition-colors"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={downloadImage}
                      className="flex items-center gap-2 px-4 py-2 bg-white text-black text-xs font-black uppercase neo-brutal hover:bg-zinc-100"
                    >
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">Simpan</span>
                    </button>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex-1 bg-black relative flex items-center justify-center min-h-[450px] overflow-hidden">
              {/* Grid Background */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" 
                style={{ 
                  backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', 
                  backgroundSize: '20px 20px' 
                }} 
              />

              {(isGenerating || isImageLoading) && (
                <>
                  <div className="scanning-line"></div>
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-20">
                    <div className="bg-black border-4 border-indigo-500 p-6 neo-brutal flex flex-col items-center gap-4">
                      <div className="relative">
                        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                        <Zap className="w-4 h-4 text-indigo-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      </div>
                      <div className="text-center">
                        <p className="font-mono text-indigo-500 font-black text-lg animate-pulse tracking-tighter">
                          {isGenerating ? 'MENYIAPKAN DATA...' : 'LAGI SCAN...'}
                        </p>
                        <p className="text-[10px] font-mono text-zinc-500 uppercase mt-1">Sabar ya, lagi diproses...</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
              
              <AnimatePresence mode="wait">
                {resultImage ? (
                  <motion.div 
                    key={resultImage}
                    initial={{ opacity: 0, scale: 0.9, rotate: -1 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    className="w-full h-full flex items-center justify-center p-6 md:p-12"
                  >
                    <div className="relative group/img">
                      <img 
                        src={resultImage} 
                        alt="Nexa IQC Result" 
                        onLoad={() => setIsImageLoading(false)}
                        className="max-w-full max-h-[500px] object-contain neo-brutal-no-hover bg-zinc-900 shadow-[8px_8px_0px_0px_rgba(99,102,241,0.3)]"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute -top-3 -left-3 bg-indigo-500 text-white p-1.5 neo-brutal">
                        <Sparkles className="w-4 h-4" />
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center gap-6 text-zinc-800 relative z-10">
                    <div className="w-24 h-24 border-4 border-dashed border-zinc-800 rounded-full flex items-center justify-center bg-zinc-900/50">
                      <ImageIcon className="w-12 h-12 opacity-20" />
                    </div>
                    <div className="text-center">
                      <p className="font-mono text-sm uppercase font-black tracking-[0.2em] text-zinc-700">Awaiting Input</p>
                      <p className="text-[10px] font-mono text-zinc-800 mt-2 uppercase">Masukkan kata-kata di panel kiri</p>
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* --- History Section --- */}
      <section className="bg-zinc-900 neo-brutal-no-hover flex flex-col h-[350px]">
        <div className="bg-zinc-800 border-b-[3px] border-black p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-yellow-400" />
            <span className="text-xs font-mono font-black text-zinc-400 uppercase tracking-widest">Riwayat Ciptaan Kamu</span>
          </div>
          <button 
            onClick={clearHistory}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white text-[10px] font-black uppercase neo-brutal"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Hapus Semua
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 md:p-6 font-mono text-sm custom-scrollbar bg-zinc-950/50">
          <div className="grid grid-cols-12 gap-2 md:gap-4 pb-4 border-b-2 border-zinc-800 text-zinc-500 uppercase font-black text-[10px] md:text-xs tracking-widest mb-6 px-2">
            <div className="col-span-3 md:col-span-2">Jam</div>
            <div className="col-span-3 md:col-span-2">Status</div>
            <div className="col-span-6 md:col-span-8">Isi Quote</div>
          </div>
          
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {history.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16 text-zinc-800 uppercase font-bold tracking-widest italic"
                >
                  Belum ada riwayat, yuk bikin sekarang!
                </motion.div>
              ) : (
                [...history].reverse().map((item) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="grid grid-cols-12 gap-2 md:gap-4 items-center p-3 md:p-4 bg-zinc-900 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:-translate-y-1 transition-transform cursor-default group"
                  >
                    <div className="col-span-3 md:col-span-2 text-zinc-500 font-bold text-[10px] md:text-xs flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></div>
                      <span className="font-mono">{item.timestamp}</span>
                    </div>
                    <div className="col-span-3 md:col-span-2 flex justify-start">
                      {item.status === 'BERHASIL' && (
                        <span className="px-2 md:px-3 py-0.5 md:py-1 bg-green-500/10 text-green-500 border border-green-500/30 text-[8px] md:text-[10px] font-black rounded-full">BERHASIL</span>
                      )}
                      {item.status === 'GAGAL' && (
                        <span className="px-2 md:px-3 py-0.5 md:py-1 bg-red-500/10 text-red-500 border border-red-500/30 text-[8px] md:text-[10px] font-black rounded-full">GAGAL</span>
                      )}
                      {item.status === 'PROSES' && (
                        <span className="px-2 md:px-3 py-0.5 md:py-1 bg-indigo-500/10 text-indigo-500 border border-indigo-500/30 text-[8px] md:text-[10px] font-black rounded-full flex items-center gap-1 md:gap-2 w-fit">
                          <Loader2 className="w-2 md:w-3 h-2 md:h-3 animate-spin" />
                          PROSES
                        </span>
                      )}
                    </div>
                    <div className="col-span-6 md:col-span-8 text-zinc-300 truncate group-hover:text-indigo-400 font-medium text-[11px] md:text-sm transition-colors">
                      {item.text}
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
            <div ref={historyEndRef} />
          </div>
        </div>
      </section>

      {/* --- Custom Scrollbar Styles --- */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #09090b;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #3f3f46;
          border: 3px solid #09090b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6366f1;
        }
      `}</style>
    </div>
  );
}
