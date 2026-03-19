import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, FileText, BarChart3, Library, ShieldAlert, LogOut } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user: any;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, activeTab, setActiveTab }) => {
  const isAdmin = user.role === 'admin';
  const isAuth = user.role === 'authority';

  const NAV_ITEMS = [
    { id: 'dashboard', label: 'Command', icon: <LayoutDashboard className="w-5 h-5 sm:w-6 sm:h-6" /> },
    { id: 'reports', label: 'Operations', icon: <FileText className="w-5 h-5 sm:w-6 sm:h-6" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" /> },
    { id: 'notes', label: 'Library', icon: <Library className="w-5 h-5 sm:w-6 sm:h-6" /> },
    { id: 'leaderboard', label: isAdmin ? 'Admin' : 'Arch', icon: <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6" /> }
  ];

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${isAdmin ? 'bg-[#0f172a]' : isAuth ? 'bg-amber-50/20' : 'bg-slate-50'}`}>
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`sticky top-0 z-50 backdrop-blur-2xl border-b px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between ${isAdmin ? 'bg-slate-900/80 border-slate-800' : 'bg-white/70 border-slate-200/60'}`}
      >
        <div className="flex items-center gap-3 sm:gap-4 cursor-pointer group" onClick={() => setActiveTab('dashboard')}>
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-2xl ${
            isAdmin ? 'bg-indigo-600 shadow-indigo-500/20' : isAuth ? 'bg-amber-600 shadow-amber-500/20' : 'bg-emerald-600 shadow-emerald-500/20'
          }`}>
             <ShieldAlert className="w-6 h-6 sm:w-7 sm:h-7" />
          </motion.div>
          <div>
            <span className={`font-black text-xl sm:text-2xl tracking-tighter ${isAdmin ? 'text-white' : 'text-slate-900'}`}>EcoGuardian</span>
            <p className={`text-[7px] sm:text-[8px] font-black uppercase tracking-[0.2em] sm:tracking-[0.4em] ${isAdmin ? 'text-indigo-400' : 'text-slate-400'}`}>
              {isAuth ? user.organization : 'Environmental Intel Network'}
            </p>
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-2 p-1.5 rounded-2xl border transition-colors duration-300 bg-slate-100/80 border-slate-200/50">
          {NAV_ITEMS.map(tab => (
            <motion.button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ scale: activeTab === tab.id ? 1.05 : 1 }}
              whileTap={{ scale: 0.95 }}
              className={`relative px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id ? 'text-white shadow-xl' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTabIndicatorDesktop"
                  className="absolute inset-0 bg-slate-900 rounded-xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </motion.button>
          ))}
        </nav>

        <div className="flex items-center gap-4 sm:gap-6">
          {user.role === 'user' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="hidden md:flex items-center gap-3 px-4 py-2 bg-emerald-50 rounded-2xl border border-emerald-100"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">{user.points} PTS</span>
            </motion.div>
          )}
          <div className={`flex items-center gap-3 sm:gap-4 pl-0 sm:pl-6 border-l-0 sm:border-l ${isAdmin ? 'border-slate-800' : 'border-slate-200'}`}>
            <div className="text-right hidden sm:block">
              <p className={`text-sm font-black leading-none mb-1 ${isAdmin ? 'text-white' : 'text-slate-900'}`}>{user.name}</p>
              <p className={`text-[9px] font-black uppercase tracking-widest ${isAdmin ? 'text-indigo-400' : 'text-slate-400'}`}>
                Sector {isAdmin ? 'Alpha' : 'Beta'}
              </p>
            </div>
            <div className="relative group cursor-pointer">
              <motion.img 
                whileHover={{ scale: 1.1 }}
                src={user.avatar} 
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl border-2 shadow-lg transition-all ${isAdmin ? 'border-slate-800 group-hover:border-indigo-500' : 'border-white group-hover:border-emerald-500'}`} 
                alt="Avatar" 
              />
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-emerald-500 border-2 border-white rounded-full" />
            </div>
            <motion.button 
              whileHover={{ scale: 1.1, rotate: 10 }}
              whileTap={{ scale: 0.9 }}
              onClick={onLogout} 
              className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl transition-all border ${
                isAdmin 
                  ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-red-400 hover:bg-red-900/30' 
                  : 'bg-slate-100 border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50'
              }`}
            >
               <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>
          </div>
        </div>
      </motion.header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 pb-28 lg:pb-8 relative">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20, filter: 'blur(5px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, filter: 'blur(5px)' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Nav */}
      <motion.nav 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className={`fixed bottom-0 left-0 right-0 z-50 backdrop-blur-3xl border-t lg:hidden flex justify-around py-3 px-2 sm:px-4 sm:py-4 safe-area-bottom ${
          isAdmin ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'
        }`}
      >
        {NAV_ITEMS.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)} 
              className={`relative p-2 sm:p-3 rounded-xl flex flex-col items-center gap-1 transition-colors ${
                isActive 
                  ? (isAdmin ? 'text-indigo-400' : isAuth ? 'text-amber-600' : 'text-emerald-600') 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicatorMobile"
                  className={`absolute inset-0 rounded-xl opacity-10 ${
                    isAdmin ? 'bg-indigo-400' : isAuth ? 'bg-amber-600' : 'bg-emerald-600'
                  }`}
                />
              )}
              {tab.icon}
              <span className="text-[9px] sm:text-[10px] font-bold tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </motion.nav>
    </div>
  );
};

export default Layout;
