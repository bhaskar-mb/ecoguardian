
import React from 'react';
import { motion } from 'motion/react';

const SystemInsights: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 sm:space-y-10"
    >
      <motion.div variants={itemVariants} className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3 sm:mb-4">Architecture Deep-Dive</h2>
        <p className="text-slate-500 font-medium text-sm sm:text-base px-4">This project demonstrates a production-grade full-stack architecture optimized for low-latency AI vision processing.</p>
      </motion.div>

      {/* Visual Tech Stack */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        <motion.div variants={itemVariants} className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-emerald-50 rounded-full -mr-8 -mt-8 sm:-mr-10 sm:-mt-10 group-hover:scale-110 transition-transform" />
          <div className="relative z-10">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-100 rounded-xl sm:rounded-2xl flex items-center justify-center text-emerald-600 mb-4 sm:mb-6">
              <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 21l-8-4.5v-9L12 3l8 4.5v9l-8 4.5z" strokeWidth="1.5"/></svg>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-800 mb-1 sm:mb-2">Frontend</h3>
            <p className="text-xs sm:text-sm font-bold text-slate-400 mb-4 sm:mb-6">React 19 + Tailwind CSS</p>
            <ul className="space-y-2 sm:space-y-3">
              {['Google Identity Integration', 'Vision Buffer Management', 'Glassmorphism UI System', 'Responsive Sentinel Feed'].map(item => (
                <li key={item} className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-slate-600">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> {item}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-[#0f172a] p-6 sm:p-8 rounded-2xl sm:rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-32 sm:h-32 bg-indigo-500/10 rounded-full -ml-8 -mb-8 sm:-ml-10 sm:-mb-10 group-hover:scale-110 transition-transform" />
          <div className="relative z-10">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center text-indigo-400 mb-4 sm:mb-6 border border-indigo-500/30">
              <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth="1.5"/></svg>
            </div>
            <h3 className="text-lg sm:text-xl font-black mb-1 sm:mb-2">Backend</h3>
            <p className="text-xs sm:text-sm font-bold text-slate-400 mb-4 sm:mb-6">Node.js + Express</p>
            <ul className="space-y-2 sm:space-y-3">
              {['JWT Token Validation', 'Gemini Vision Proxy', 'Cloudinary Image Handling', 'RESTful API Controllers'].map(item => (
                <li key={item} className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-slate-300">
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" /> {item}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-24 h-24 sm:w-32 sm:h-32 bg-amber-50 rounded-full -ml-8 -mt-8 sm:-ml-10 sm:-mt-10 group-hover:scale-110 transition-transform" />
          <div className="relative z-10 text-right">
             <div className="w-12 h-12 sm:w-14 sm:h-14 bg-amber-100 rounded-xl sm:rounded-2xl flex items-center justify-center text-amber-600 mb-4 sm:mb-6 ml-auto">
              <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" strokeWidth="1.5"/></svg>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-800 mb-1 sm:mb-2">Database</h3>
            <p className="text-xs sm:text-sm font-bold text-slate-400 mb-4 sm:mb-6">MongoDB Atlas</p>
            <ul className="space-y-2 sm:space-y-3 inline-block">
              {['Non-Relational Incident Logs', 'User Points & Rankings', 'Geospatial Query Support', 'Atomic Status Updates'].map(item => (
                <li key={item} className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-slate-600 justify-end">
                  {item} <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>

      {/* Points System Section */}
      <motion.div variants={itemVariants} className="bg-slate-900 rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-[80px]" />
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="max-w-xl">
              <h3 className="text-2xl sm:text-3xl font-black mb-4 tracking-tight">Points & Recognition</h3>
              <p className="text-slate-400 font-medium text-sm sm:text-base mb-8">The Sentinel network rewards active participation in environmental safeguarding through a transparent point-based system.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 4v16m8-8H4" strokeWidth="3" strokeLinecap="round"/></svg>
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-indigo-400">+10 Points</span>
                  </div>
                  <p className="text-xs font-bold text-slate-300">Awarded for every valid field report submitted to the network.</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M5 13l4 4L19 7" strokeWidth="3" strokeLinecap="round"/></svg>
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-emerald-400">+50 Points</span>
                  </div>
                  <p className="text-xs font-bold text-slate-300">Awarded when your reported incident is successfully resolved by authorities.</p>
                </div>
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] flex flex-col items-center justify-center text-center md:w-64">
              <div className="w-16 h-16 bg-indigo-500 rounded-2xl flex items-center justify-center text-white mb-4 shadow-2xl shadow-indigo-500/40">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Multiplier</p>
              <p className="text-4xl font-black text-white">1.2x</p>
              <p className="text-[8px] font-bold text-indigo-400 mt-2">Active Sentinel Bonus</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SystemInsights;
