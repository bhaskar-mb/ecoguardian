
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Mail, Lock, User as UserIcon, Building2, ArrowRight, Info, Phone, MapPin, KeyRound } from 'lucide-react';
import { loginUser, registerUser, sendOtp, verifyOtp } from '../services/authService.ts';
import { User, UserRole } from '../types.ts';

const AUTHORITIES = [
  "Forestry Commission", 
  "Wildlife Rescue Unit", 
  "EPA Response Team", 
  "Municipal Parks Dept",
  "Marine Conservation Society",
  "Air Quality Control Board",
  "Soil Protection Agency",
  "Urban Planning & Greenery",
  "Renewable Energy Oversight",
  "Other / Independent Agency"
];

const SECTORS = [
  { id: "North Ridge", name: "North Ridge (Residential & Commercial Area)" },
  { id: "Coastal Zone", name: "Coastal Zone (Beaches & Waterfronts)" },
  { id: "Central Basin", name: "Central Basin (Downtown Core & Valleys)" },
  { id: "Eastern Highlands", name: "Eastern Highlands (Mountainous Terrain)" },
  { id: "Urban Center", name: "Urban Center (High-Density City)" },
  { id: "Protected Reserve", name: "Protected Reserve (Forests & National Parks)" }
];

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState<UserRole>('user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showHints, setShowHints] = useState(false);
  
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  const [otpPhase, setOtpPhase] = useState<'request' | 'verify'>('request');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const otpCode = otpDigits.join('');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [sector, setSector] = useState(SECTORS[0].id);
  const [org, setOrg] = useState(AUTHORITIES[0]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      if (isRegister) {
        await registerUser(name, email, role, password, role === 'authority' ? org : undefined, phone, sector);
        setSuccess("Account registered successfully. Please login below.");
        setIsRegister(false);
        setPassword('');
        setLoading(false);
      } else {
        if (loginMethod === 'otp') {
          if (otpPhase === 'request') {
            const sentOtp = await sendOtp(email);
            if (sentOtp === 'SMS_SENT') {
              setSuccess("Code sent via real SMS to your phone.");
            } else {
              setSuccess(`OTP sent to your contact info. (Demo: ${sentOtp})`);
            }
            setOtpPhase('verify');
            setLoading(false);
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
      setError(err.message || "Authentication failed.");
      setLoading(false);
    }
  };

  const getHint = () => {
    if (role === 'admin') return { e: 'admin@ecoguard.ai', p: 'admin' };
    if (role === 'authority') return { e: 'forestry@agency.gov', p: 'forest' };
    return { e: 'user@test.com', p: 'user' };
  };

  const useHint = () => {
    const hint = getHint();
    setEmail(hint.e);
    setPassword(hint.p);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-slate-950">
      {/* Immersive Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=2560" 
          className="w-full h-full object-cover opacity-40 scale-105 blur-sm"
          alt="Forest Background"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-slate-950/50 to-emerald-950/80" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px] animate-pulse delay-1000" />

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/10 backdrop-blur-2xl rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border border-white/20">
          
          {/* Role Switcher */}
          <div className="flex bg-black/20 backdrop-blur-md p-1 rounded-xl mb-8 border border-white/5">
            {(['user', 'admin', 'authority'] as UserRole[]).map((r) => (
              <button 
                key={r}
                type="button"
                onClick={() => { setRole(r); setError(''); }}
                className={`flex-1 py-2.5 px-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${
                  role === r 
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="text-center mb-8">
            <motion.div 
              initial={{ rotate: -10 }}
              animate={{ rotate: 0 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500 rounded-2xl mb-5 shadow-2xl shadow-emerald-500/40"
            >
              <Shield className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-3xl font-black text-white mb-1.5 tracking-tight">EcoGuardian</h1>
            <p className="text-emerald-400/80 font-bold text-[9px] uppercase tracking-[0.3em]">Environmental Governance Grid</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {isRegister && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="relative"
                >
                  <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                  <input 
                    type="text" 
                    required 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="Full Name" 
                    className="w-full pl-12 pr-6 py-3.5 bg-white/5 border border-white/10 rounded-xl font-bold text-white placeholder:text-slate-500 focus:bg-white/10 focus:border-emerald-500 outline-none transition-all text-sm" 
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {isRegister && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <div className="relative">
                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                    <input 
                      type="tel" 
                      required 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)} 
                      placeholder="Phone Number" 
                      className="w-full pl-12 pr-6 py-3.5 bg-white/5 border border-white/10 rounded-xl font-bold text-white placeholder:text-slate-500 focus:bg-white/10 focus:border-emerald-500 outline-none transition-all text-sm" 
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {isRegister && role === 'authority' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-2"
              >
                <div className="relative">
                  <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                  <select 
                    value={org} 
                    onChange={(e) => setOrg(e.target.value)}
                    className="w-full pl-12 pr-6 py-3.5 bg-white/5 border border-white/10 rounded-xl font-bold text-white appearance-none cursor-pointer focus:bg-white/10 focus:border-emerald-500 outline-none transition-all text-sm"
                  >
                    {AUTHORITIES.map(a => <option key={a} value={a} className="bg-slate-900">{a}</option>)}
                  </select>
                </div>
              </motion.div>
            )}

            {(!isRegister && loginMethod === 'otp' && otpPhase === 'verify') ? (
              <div className="flex flex-col gap-4">
                <div className="flex justify-between gap-2">
                  {otpDigits.map((digit, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      required={true}
                      value={digit}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        if (val.length > 1) return;
                        const newDigits = [...otpDigits];
                        newDigits[i] = val;
                        setOtpDigits(newDigits);
                        if (val && i < 5) {
                          document.getElementById(`otp-${i + 1}`)?.focus();
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !otpDigits[i] && i > 0) {
                          document.getElementById(`otp-${i - 1}`)?.focus();
                        }
                      }}
                      className="w-12 h-14 sm:w-14 sm:h-16 bg-white/5 border border-emerald-500/30 rounded-xl font-black text-xl text-center text-white focus:bg-white/10 focus:border-emerald-500 outline-none transition-all"
                      maxLength={1}
                    />
                  ))}
                </div>
                <div className="flex justify-center mt-2">
                  <button 
                    type="button" 
                    onClick={() => { 
                      setOtpPhase('request'); 
                      setOtpDigits(['', '', '', '', '', '']); 
                      setSuccess(''); 
                      setError(''); 
                    }} 
                    className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    Resend Code or Change Email
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                  <input 
                    type="text" 
                    required 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder={loginMethod === 'otp' ? "Email or Phone Number" : "Email Address"} 
                    className="w-full pl-12 pr-6 py-3.5 bg-white/5 border border-white/10 rounded-xl font-bold text-white placeholder:text-slate-500 focus:bg-white/10 focus:border-emerald-500 outline-none transition-all text-sm" 
                  />
                </div>

                {(!isRegister && loginMethod === 'otp') ? null : (
                  <div className="relative">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                    <input 
                      type="password" 
                      required 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      placeholder="Password" 
                      className="w-full pl-12 pr-6 py-3.5 bg-white/5 border border-white/10 rounded-xl font-bold text-white placeholder:text-slate-500 focus:bg-white/10 focus:border-emerald-500 outline-none transition-all text-sm" 
                    />
                  </div>
                )}
              </>
            )}
            
            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-red-400 text-[9px] font-black px-4 flex items-center gap-2"
              >
                <div className="w-1 h-1 bg-red-400 rounded-full" />
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-emerald-400 text-[9px] font-black px-4 flex items-center gap-2"
              >
                <div className="w-1 h-1 bg-emerald-400 rounded-full" />
                {success}
              </motion.div>
            )}

            <button 
              disabled={loading} 
              type="submit" 
              className="w-full py-4 rounded-xl font-black text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-xl shadow-emerald-900/20 transition-all flex items-center justify-center gap-3 group disabled:opacity-50 text-sm"
            >
              {loading 
                ? 'Authenticating...' 
                : isRegister 
                  ? 'Register Account' 
                  : (loginMethod === 'otp' && otpPhase === 'request') 
                    ? 'Send Request Code' 
                    : (loginMethod === 'otp' && otpPhase === 'verify')
                      ? 'Verify & Login'
                      : 'Login to Grid'
              }
              {!loading && <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="mt-6 flex flex-col items-center gap-4">
            {!isRegister && (
              <button 
                type="button"
                onClick={() => {
                  setLoginMethod(loginMethod === 'password' ? 'otp' : 'password');
                  setOtpPhase('request');
                  setOtpDigits(['', '', '', '', '', '']);
                  setError('');
                  setSuccess('');
                }} 
                className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                {loginMethod === 'password' ? 'Login via Contact OTP instead' : 'Login via Password instead'}
              </button>
            )}

            <button 
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
                setSuccess('');
                setLoginMethod('password');
                setOtpPhase('request');
                setOtpDigits(['', '', '', '', '', '']);
              }} 
              className="text-[9px] font-black text-slate-400 hover:text-white uppercase tracking-widest transition-colors mt-2 p-2"
            >
              {isRegister ? 'Return to Login' : 'Register New Account'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
