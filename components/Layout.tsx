import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, FileText, BarChart3, Library, ShieldAlert, LogOut, Leaf } from 'lucide-react';

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
    { id: 'dashboard', label: 'COMMAND', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'reports', label: 'OPERATIONS', icon: <FileText className="w-5 h-5" /> },
    { id: 'analytics', label: 'ANALYTICS', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'notes', label: 'LIBRARY', icon: <Library className="w-5 h-5" /> },
    { id: 'leaderboard', label: isAdmin ? 'ADMIN' : (isAuth ? 'ARCH' : 'LEADERBOARD'), icon: <ShieldAlert className="w-5 h-5" /> },
    ...(isAdmin ? [{ id: 'database', label: 'DATABASE', icon: <Library className="w-5 h-5" /> }] : [])
  ];

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 bg-transparent`}>
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-50 px-4 sm:px-12 py-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setActiveTab('dashboard')}>
          <div className="w-12 h-12 bg-[#f97316] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
             <ShieldAlert className="w-7 h-7 fill-white/20" strokeWidth={2.5} />
          </div>
          <div className="hidden sm:block">
            <span className="font-black text-2xl tracking-tighter text-[#1e293b] block leading-none mb-1">EcoGuardian</span>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#64748b]">
              {isAuth ? user.organization?.toUpperCase() : 'Environmental Intel Network'}
            </p>
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-1 p-1 bg-[#e2e8f0]/50 backdrop-blur-md rounded-[1.5rem] border border-white">
          {NAV_ITEMS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-8 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
                  isActive ? 'bg-[#0f172a] text-white' : 'text-[#475569] hover:text-[#0f172a]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 pl-6">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black leading-none mb-1 text-[#1e293b]">{user.name}</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-[#94a3b8]">
                {user.role === 'admin' ? 'Sector Alpha' : 'Sector Beta'}
              </p>
            </div>
            <div className="relative group cursor-pointer">
              <img 
                src={user.avatar} 
                className="w-11 h-11 rounded-2xl border-4 border-white shadow-xl shadow-slate-200" 
                alt="Avatar" 
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#10b981] border-4 border-[#f8fafc] rounded-full" />
            </div>
            <button 
              onClick={onLogout} 
              className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:shadow-lg transition-all"
            >
               <LogOut className="w-5 h-5" />
            </button>
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
