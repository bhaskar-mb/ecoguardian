import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Mail, Lock, User as UserIcon, ArrowRight, RefreshCw, CheckCircle2, Leaf, Globe, Zap } from 'lucide-react';
import { loginUser, registerUser, sendOtp, verifyOtp } from '../services/authService.ts';
import { User, UserRole } from '../types.ts';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [view, setView] = useState<'login' | 'register' | 'forgot'>('login');
  const [role, setRole] = useState<UserRole>('user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [captchaVerified, setCaptchaVerified] = useState(false);
  
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  const [otpPhase, setOtpPhase] = useState<'request' | 'verify'>('request');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const otpCode = otpDigits.join('');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // Floating background particles
  const [particles, setParticles] = useState<any[]>([]);
  useEffect(() => {
    setParticles(Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 20 + 10
    })));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      if (view === 'register') {
        // Enforce all required fields reach the backend
        await registerUser(name, email, role, password, undefined, undefined, undefined); 
        setSuccess("Guardian enlisted! You can now log in.");
        setView('login');
        setPassword('');
      } else if (view === 'forgot') {
        await new Promise(r => setTimeout(r, 1500));
        setSuccess("Recovery protocol initiated. Check your inbox.");
        setView('login');
      } else {
        if (loginMethod === 'otp') {
          if (otpPhase === 'request') {
            const code = await sendOtp(email);
            setSuccess(`Secure MFA code routed: ${code}`);
            setOtpPhase('verify');
          } else {
            const user = await verifyOtp(email, otpCode, role);
            onLoginSuccess(user);
          }
        } else {
          const user = await loginUser(email, password, role);
          onLoginSuccess(user);
        }
      }
    } catch (err: any) {
      setError(err.message === 'Failed to fetch' ? "System unreachable. Check network status." : (err.message || "Invalid credentials."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 relative overflow-hidden bg-[#020617] font-sans selection:bg-emerald-500/30">
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          animate={{ scale: [1, 1.05, 1], opacity: [0.7, 0.8, 0.7] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0"
        >
          <img 
            src="/login-bg.png" 
            className="w-full h-full object-cover"
            alt="Premium Eco-Tech Backdrop"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-br from-[#020617] via-[#020617]/40 to-emerald-950/60" />
        {particles.map(p => (
          <motion.div
            key={p.id}
            initial={{ x: `${p.x}%`, y: `${p.y}%`, opacity: 0 }}
            animate={{ 
              y: [`${p.y}%`, `${p.y - 20}%`, `${p.y}%`],
              opacity: [0, 0.4, 0]
            }}
            transition={{ duration: p.duration, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-1 h-1 bg-emerald-500 rounded-full blur-[2px]"
            style={{ width: p.size, height: p.size }}
          />
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-[380px] relative z-10"
      >
        <div className="bg-[#0f172a]/50 backdrop-blur-[20px] rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/5 relative group border-t-emerald-500/10">
          
          {/* Shield Logo & Brand */}
          <div className="text-center mb-10 relative flex flex-col items-center justify-center">
            <motion.div 
              className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/10 rounded-2xl mb-4 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)] group-hover:scale-105 transition-transform"
            >
              <Shield className="w-8 h-8 text-emerald-400 group-hover:text-emerald-300 transition-colors" strokeWidth={2} />
            </motion.div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tight">EcoGuardian</h1>
            <p className="text-emerald-400/80 font-black text-[9px] sm:text-[10px] uppercase tracking-[0.4em]">Node Access Protocol</p>
          </div>

          {/* Role Navigator - Ultra Compact */}
          {view !== 'forgot' && (
            <div className="flex bg-black/40 p-1 rounded-lg mb-5 border border-white/5">
              {(['user', 'authority', 'admin'] as UserRole[]).map((r) => (
                <button 
                  key={r}
                  type="button"
                  onClick={() => { setRole(r); setError(''); }}
                  className={`flex-1 py-1.5 rounded-md text-[7px] font-black uppercase tracking-widest transition-all duration-300 relative ${
                    role === r ? 'text-white' : 'text-slate-600 hover:text-slate-400'
                  }`}
                >
                  {role === r && (
                    <motion.div 
                      layoutId="role-bg"
                      className="absolute inset-0 bg-emerald-600 rounded-md shadow-md"
                    />
                  )}
                  <span className="relative z-10">{r}</span>
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div 
                key={view + loginMethod + otpPhase}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-3"
              >
                {view === 'forgot' ? (
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-slate-500 text-center">Verify identity to request decryption link.</p>
                    <div className="relative group">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input 
                        type="email" required value={email} onChange={(e) => setEmail(e.target.value)} 
                        placeholder="Recovery Signal" 
                        className="w-full pl-12 pr-6 py-3 bg-white/5 border border-white/5 rounded-xl font-bold text-white placeholder:text-slate-700 focus:border-emerald-500/50 outline-none transition-all text-xs" 
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    {view === 'register' && (
                      <div className="relative group">
                        <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input 
                          type="text" required value={name} onChange={(e) => setName(e.target.value)} 
                          placeholder="Authentic Name" 
                          className="w-full pl-12 pr-6 py-3 bg-white/5 border border-white/5 rounded-xl font-bold text-white placeholder:text-slate-700 focus:border-emerald-500/50 outline-none transition-all text-xs" 
                        />
                      </div>
                    )}

                    {loginMethod === 'otp' && otpPhase === 'verify' ? (
                      <div className="grid grid-cols-6 gap-2 py-1">
                        {otpDigits.map((digit, i) => (
                          <input
                            key={i} id={`otp-${i}`} type="text" inputMode="numeric" required value={digit}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^0-9]/g, '');
                              if (val.length > 1) return;
                              const newDigits = [...otpDigits];
                              newDigits[i] = val;
                              setOtpDigits(newDigits);
                              if (val && i < 5) document.getElementById(`otp-${i + 1}`)?.focus();
                            }}
                            onKeyDown={(e) => { if (e.key === 'Backspace' && !otpDigits[i] && i > 0) document.getElementById(`otp-${i - 1}`)?.focus(); }}
                            className="aspect-square bg-white/5 border border-emerald-500/20 rounded-xl font-black text-xl text-center text-white focus:border-emerald-500 outline-none transition-all"
                            maxLength={1}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        <div className="relative group">
                          <Globe className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <input 
                            type="text" required value={email} onChange={(e) => setEmail(e.target.value)} 
                            placeholder="Network ID" 
                            className="w-full pl-12 pr-6 py-3 bg-white/5 border border-white/5 rounded-xl font-bold text-white placeholder:text-slate-700 focus:border-emerald-500/50 outline-none transition-all text-xs" 
                          />
                        </div>
                        {(view === 'register' || loginMethod === 'password') && (
                          <div className="relative group">
                            <Zap className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input 
                              type="password" required value={password} onChange={(e) => setPassword(e.target.value)} 
                              placeholder="Access Key" 
                              className="w-full pl-12 pr-6 py-3 bg-white/5 border border-white/5 rounded-xl font-bold text-white placeholder:text-slate-700 focus:border-emerald-500/50 outline-none transition-all text-xs" 
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            
            {(error || success) && (
              <motion.div 
                className={`p-4 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] flex items-center justify-center text-center shadow-lg ${
                  error 
                    ? 'bg-[#1e1315] text-[#ef4444] border border-[#ef4444]/10' 
                    : 'bg-[#0d1f18] text-[#10b981] border border-[#10b981]/10'
                }`}
              >
                {error || success}
              </motion.div>
            )}

            <button 
              disabled={loading} 
              type="submit" 
              className="w-full py-3.5 rounded-xl font-black text-white bg-emerald-600 hover:bg-emerald-500 shadow-xl transition-all flex items-center justify-center gap-2 group disabled:opacity-50 text-[10px] uppercase tracking-[0.2em]"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>
                    {view === 'login' ? (otpPhase === 'verify' ? 'Sync Profile' : 'LOGIN') : view === 'register' ? 'Register' : 'Transmit'}
                  </span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Nav Links - Ultra Compact */}
          <div className="mt-6 flex flex-col items-center gap-3 border-t border-white/5 pt-5 text-[9px] font-black uppercase tracking-widest">
            {view === 'login' ? (
              <>
                <div className="flex items-center gap-4">
                   <button onClick={() => setView('forgot')} className="text-slate-600 hover:text-emerald-500 transition-colors">Forgot Key?</button>
                   <button onClick={() => setLoginMethod(loginMethod === 'password' ? 'otp' : 'password')} className="text-emerald-600 hover:text-emerald-500 transition-colors">
                     {loginMethod === 'password' ? 'Use Token' : 'Use Passkey'}
                   </button>
                </div>
                <button 
                  onClick={() => setView('register')} 
                  className="text-slate-500 hover:text-white transition-all bg-white/5 px-6 py-2 rounded-lg border border-white/5"
                >
                  New Guardian Account
                </button>
              </>
            ) : (
              <button 
                onClick={() => setView('login')} 
                className="text-slate-600 hover:text-white transition-colors"
              >
                Return to Protocol
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Modern Footer Reference */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center pointer-events-none">
        <p className="text-slate-700 font-black text-[8px] uppercase tracking-[0.6em]">Encrypted Governance Ecosystem &copy; 2026</p>
      </div>

    </div>
  );
};

export default Login;
