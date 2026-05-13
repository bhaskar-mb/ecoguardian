
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Shield, Zap, MapPin, Search, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeEnvironmentalImage } from '../services/geminiService.ts';
import { AIAnalysisResult, IncidentType, Severity, Report } from '../types.ts';

interface ReportWizardProps {
  onComplete: (report: Partial<Report>) => void;
}

const ReportWizard: React.FC<ReportWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [description, setDescription] = useState('');
  const [manualAddress, setManualAddress] = useState('');
  const [location, setLocation] = useState<{lat: number, lng: number, address: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const initialAddr = "Coordinates Locked.";
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          address: initialAddr
        });
        setManualAddress(initialAddr);
      }, () => {
        setManualAddress("Manual Input Required");
      });
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setStep(2);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStartAnalysis = async () => {
    if (!image) return;
    setAnalyzing(true);
    try {
      const base64Data = image.split(',')[1];
      const result = await analyzeEnvironmentalImage(base64Data);
      setAnalysis(result);
      setStep(3);
    } catch (err) {
      alert("AI analysis failed. Please enter details manually.");
      setStep(3);
    } finally {
      setAnalyzing(false);
    }
  };

  const [manualType, setManualType] = useState<IncidentType>(IncidentType.OTHER);
  const [manualSeverity, setManualSeverity] = useState<Severity>(Severity.MEDIUM);

  useEffect(() => {
    if (analysis) {
      setManualType(analysis.detectedType);
      setManualSeverity(analysis.severity);
    }
  }, [analysis]);

  const handleSubmit = () => {
    onComplete({
      type: manualType,
      severity: manualSeverity,
      description: description || analysis?.explanation || '',
      imageUrl: image || undefined,
      aiInsights: analysis?.explanation,
      location: { 
        lat: location?.lat || 0, 
        lng: location?.lng || 0, 
        address: manualAddress || location?.address || "Manual Input" 
      },
      timestamp: new Date(),
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/80 backdrop-blur-2xl rounded-[1.5rem] sm:rounded-[2.5rem] p-4 sm:p-6 shadow-2xl w-full max-w-sm mx-auto border border-white/50 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-slate-50" />
      
      <div className="flex items-center gap-1.5 sm:gap-2 mb-5 sm:mb-6 relative z-10">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex-1 h-1 rounded-full bg-slate-100 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: step >= s ? '100%' : '0%' }}
              transition={{ duration: 0.8, ease: "circOut" }}
              className="h-full bg-gradient-to-r from-teal-500 to-emerald-500" 
            />
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="text-center py-2 sm:py-4"
          >
            <div className="relative group cursor-pointer mb-5 sm:mb-6" onClick={() => fileInputRef.current?.click()}>
              <div className="absolute -inset-4 bg-emerald-50/50 rounded-[2rem] sm:rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 border-2 border-dashed border-emerald-300 bg-white/50 backdrop-blur-sm rounded-[1.5rem] sm:rounded-[2rem] flex flex-col items-center justify-center mx-auto text-emerald-600 transition-all group-hover:border-emerald-500 group-hover:scale-105 shadow-sm">
                <Camera className="w-6 h-6 sm:w-8 sm:h-8 mb-1" />
                <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-widest opacity-60">Drop Image</span>
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-black mb-2 tracking-tight text-slate-900">Capture Evidence</h2>
            <p className="text-slate-500 mb-6 sm:mb-8 font-medium text-[11px] sm:text-xs max-w-[260px] mx-auto leading-relaxed">
              Upload a clear photo of the environmental incident for AI analysis.
            </p>

            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
            
            <button 
              onClick={() => fileInputRef.current?.click()} 
              className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-black py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-xl shadow-teal-500/20 hover:shadow-teal-500/40 hover:scale-[1.02] transition-all text-xs flex items-center justify-center gap-2 group"
            >
              <Upload className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-y-1 transition-transform" />
              Select Media
            </button>
            
            <div className="mt-8 flex items-center justify-center gap-6 opacity-40 grayscale">
              <Shield className="w-5 h-5" />
              <Zap className="w-5 h-5" />
              <MapPin className="w-5 h-5" />
            </div>
          </motion.div>
        )}

        {step === 2 && image && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="text-center"
          >
            <div className="relative mb-5 sm:mb-6">
              <img src={image} className="w-full aspect-square object-cover rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl" alt="Evidence" />
              <div className="absolute inset-0 rounded-[1.5rem] sm:rounded-[2rem] border-4 border-white/20 pointer-events-none" />
              {analyzing && (
                <div className="absolute inset-0 bg-teal-900/40 backdrop-blur-md rounded-[2rem] sm:rounded-[2.5rem] flex items-center justify-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    <p className="text-white font-black uppercase tracking-widest text-[10px]">Neural Scan Active</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-3 mb-5 sm:mb-6">
              <div className="h-px w-6 bg-slate-200" />
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">Vision Analysis</h2>
              <div className="h-px w-6 bg-slate-200" />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button 
                disabled={analyzing} 
                onClick={handleStartAnalysis} 
                className="flex-[2] bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-black py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-xl shadow-teal-500/20 hover:scale-[1.02] disabled:opacity-50 transition-all text-xs flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                {analyzing ? "Synthesizing..." : "Run AI Scan"}
              </button>
              <button 
                disabled={analyzing} 
                onClick={() => setStep(3)} 
                className="flex-1 border-2 border-white/50 bg-white/20 font-black py-3 sm:py-4 rounded-xl sm:rounded-2xl text-slate-600 hover:bg-white/40 transition-all text-xs"
              >
                Skip
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4 sm:space-y-5"
          >
            <div className="bg-white/60 backdrop-blur-md p-4 sm:p-5 rounded-[1.25rem] border border-white/60 relative overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                  <MapPin className="w-10 h-10" />
                </div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Location Intelligence</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={manualAddress} 
                    onChange={(e) => setManualAddress(e.target.value)}
                    placeholder="Detecting site address..."
                    className="w-full bg-white/80 border-2 border-white/50 rounded-xl px-3 py-3 text-xs font-black text-slate-800 outline-none focus:border-teal-500/50 transition-all"
                  />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
               <div className="p-4 sm:p-5 bg-white/60 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm">
                  <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest mb-1 sm:mb-2 text-teal-600">Detected Type</p>
                  <select 
                    value={manualType} 
                    onChange={(e) => setManualType(e.target.value as IncidentType)}
                    className="w-full bg-transparent border-none text-xs font-black text-slate-900 outline-none cursor-pointer"
                  >
                    {Object.values(IncidentType).map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
               </div>
               <div className="p-4 sm:p-5 bg-white/60 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm">
                  <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest mb-1 sm:mb-2 text-teal-600">Severity Level</p>
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${manualSeverity === Severity.HIGH || manualSeverity === Severity.CRITICAL ? 'bg-red-500' : manualSeverity === Severity.MEDIUM ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                    <select 
                      value={manualSeverity} 
                      onChange={(e) => setManualSeverity(e.target.value as Severity)}
                      className="w-full bg-transparent border-none text-xs font-black text-slate-900 outline-none cursor-pointer"
                    >
                      {Object.values(Severity).map(sev => (
                        <option key={sev} value={sev}>{sev}</option>
                      ))}
                    </select>
                  </div>
               </div>
            </div>

            <div className="relative">
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Detailed field observations..." 
                className="w-full bg-white/60 backdrop-blur-md border border-white/50 rounded-[1.25rem] p-4 font-bold text-[11px] sm:text-xs text-slate-900 outline-none min-h-[80px] sm:min-h-[100px] focus:bg-white/80 focus:border-teal-500/50 shadow-sm transition-all"
              />
            </div>

            <button 
              onClick={handleSubmit} 
              className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-black py-3 sm:py-4 rounded-[1.25rem] shadow-xl shadow-teal-600/20 hover:scale-[1.02] transition-all text-xs flex items-center justify-center gap-2"
            >
              <Shield className="w-4 h-4" />
              Finalize Sentinel Report
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ReportWizard;
