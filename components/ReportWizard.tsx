
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

  const handleSubmit = () => {
    onComplete({
      type: analysis?.detectedType || IncidentType.OTHER,
      severity: analysis?.severity || Severity.MEDIUM,
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
      className="bg-white rounded-[2rem] sm:rounded-[3rem] p-5 sm:p-8 shadow-2xl w-full max-w-md mx-auto border border-indigo-100 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-slate-50" />
      
      <div className="flex items-center gap-1.5 sm:gap-3 mb-6 sm:mb-10 relative z-10">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: step >= s ? '100%' : '0%' }}
              transition={{ duration: 0.8, ease: "circOut" }}
              className="h-full bg-indigo-500" 
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
            className="text-center py-4 sm:py-6"
          >
            <div className="relative group cursor-pointer mb-6 sm:mb-8" onClick={() => fileInputRef.current?.click()}>
              <div className="absolute -inset-4 bg-indigo-50 rounded-[2.5rem] sm:rounded-[3rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 border-2 border-dashed border-indigo-200 bg-indigo-50/30 rounded-[2rem] sm:rounded-[2.5rem] flex flex-col items-center justify-center mx-auto text-indigo-600 transition-all group-hover:border-indigo-400 group-hover:scale-105">
                <Camera className="w-8 h-8 sm:w-10 sm:h-10 mb-1 sm:mb-2" />
                <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest opacity-60">Drop Image</span>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black mb-2 sm:mb-3 tracking-tight text-slate-900">Capture Evidence</h2>
            <p className="text-slate-500 mb-6 sm:mb-10 font-medium text-xs sm:text-sm max-w-[260px] sm:max-w-xs mx-auto leading-relaxed">
              Upload a clear photo of the environmental incident for AI analysis.
            </p>

            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
            
            <button 
              onClick={() => fileInputRef.current?.click()} 
              className="w-full bg-indigo-600 text-white font-black py-4 sm:py-5 rounded-xl sm:rounded-2xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all text-xs sm:text-sm flex items-center justify-center gap-2 sm:gap-3 group"
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
            <div className="relative mb-6 sm:mb-8">
              <img src={image} className="w-full aspect-square object-cover rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl" alt="Evidence" />
              <div className="absolute inset-0 rounded-[2rem] sm:rounded-[2.5rem] border-4 border-white/20 pointer-events-none" />
              {analyzing && (
                <div className="absolute inset-0 bg-indigo-900/40 backdrop-blur-sm rounded-[2rem] sm:rounded-[2.5rem] flex items-center justify-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    <p className="text-white font-black uppercase tracking-widest text-[10px]">Neural Scan Active</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-3 mb-6 sm:mb-8">
              <div className="h-px w-6 bg-slate-100" />
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">Vision Analysis</h2>
              <div className="h-px w-6 bg-slate-100" />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button 
                disabled={analyzing} 
                onClick={handleStartAnalysis} 
                className="flex-[2] bg-indigo-600 text-white font-black py-4 sm:py-5 rounded-xl sm:rounded-2xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 transition-all text-xs sm:text-sm flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                {analyzing ? "Synthesizing..." : "Run AI Scan"}
              </button>
              <button 
                disabled={analyzing} 
                onClick={() => setStep(3)} 
                className="flex-1 border-2 border-slate-100 font-black py-4 sm:py-5 rounded-2xl sm:rounded-3xl text-slate-400 hover:bg-slate-50 transition-all text-sm sm:text-base"
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
            className="space-y-6 sm:space-y-8"
          >
            <div className="bg-slate-50 p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100 relative overflow-hidden">
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
                    className="w-full bg-white border-2 border-slate-100 rounded-xl px-3 py-3 sm:py-4 text-xs sm:text-sm font-black text-slate-800 outline-none focus:border-indigo-500/30 transition-all"
                  />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
               <div className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 sm:mb-2">Detected Type</p>
                  <p className="text-xs font-black text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-indigo-500" />
                    {analysis?.detectedType || 'Other'}
                  </p>
               </div>
               <div className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 sm:mb-2">Severity Level</p>
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${analysis?.severity === Severity.HIGH ? 'bg-red-500' : 'bg-amber-500'}`} />
                    <p className="text-xs font-black text-slate-900">{analysis?.severity || 'Medium'}</p>
                  </div>
               </div>
            </div>

            <div className="relative">
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Detailed field observations..." 
                className="w-full bg-slate-50 border border-slate-100 rounded-[1.5rem] p-5 sm:p-6 font-bold text-xs sm:text-sm text-slate-900 outline-none min-h-[100px] sm:min-h-[120px] focus:bg-white focus:border-indigo-500/20 transition-all" 
              />
            </div>

            <button 
              onClick={handleSubmit} 
              className="w-full bg-indigo-600 text-white font-black py-4 sm:py-5 rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl shadow-indigo-900/20 hover:bg-indigo-700 transition-all text-xs sm:text-sm flex items-center justify-center gap-3"
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
