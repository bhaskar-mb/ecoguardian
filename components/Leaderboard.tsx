import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Medal, Star, ArrowUpRight, Activity } from 'lucide-react';
import { getAuthHeader } from '../services/authService.ts';

interface LeaderboardUser {
  id?: string;
  _id?: string;
  name: string;
  points: number;
  avatar: string;
  role: string;
  organization?: string;
  sector?: string;
}

const Leaderboard: React.FC<{ currentUser: any }> = ({ currentUser }) => {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/users/leaderboard', {
          headers: getAuthHeader()
        });
        if (response.ok) {
          const data = await response.json();
          // Filter to only show users (not admins or authorities) in leaderboard 
          const sorted = data.filter((u: any) => u.role === 'user');
          
          if (sorted.length > 0) {
            setUsers(sorted);
            return;
          }
        }
        throw new Error('Fallback to dummy data');
      } catch (error) {
        console.error('Leaderboard fallback applied:', error);
        setUsers([
          { id: 'f1', name: 'Maya Patel', points: 1250, role: 'user', sector: 'Sector Delta', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maya' },
          { id: 'f2', name: 'Liam Chen', points: 980, role: 'user', sector: 'Sector Alpha', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Liam' },
          { id: 'f3', name: 'Elena Rostova', points: 840, role: 'user', sector: 'Sector Beta', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena' },
          { id: 'f4', name: 'Marcus Vance', points: 620, role: 'user', sector: 'Sector Gamma', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus' },
          { id: 'f5', name: 'Sarah Fieldings', points: 310, role: 'user', sector: 'Sector Alpha', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-20">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const top3 = users.slice(0, 3);
  const rest = users.slice(3, 10); // Show top 10

  const getRankStyle = (index: number) => {
    if (index === 0) return 'from-yellow-400 to-amber-500 shadow-yellow-500/40 border-yellow-300';
    if (index === 1) return 'from-slate-300 to-slate-400 shadow-slate-400/40 border-slate-200';
    if (index === 2) return 'from-amber-600 to-orange-800 shadow-amber-900/30 border-amber-600';
    return 'bg-white border-slate-100 shadow-sm';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 w-full pb-10"
    >
      <div className="text-center mb-16 relative">
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-32 bg-yellow-500/10 blur-[60px] -z-10 rounded-full" />
        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight flex items-center justify-center gap-3">
          <Trophy className="w-10 h-10 text-yellow-500 drop-shadow-md" /> Global Leaderboard
        </h1>
        <p className="text-slate-500 font-medium max-w-lg mx-auto">
          Top Eco Sentinels leading the charge. Rack up points by securing resolutions and reporting hazards.
        </p>
      </div>

      {top3.length > 0 && (
        <div className="flex flex-col md:flex-row items-end justify-center gap-6 mb-20 pt-10 px-4">
          {[1, 0, 2].map((rankIndex) => {
            const u = top3[rankIndex];
            if (!u) return null;
            const isFirst = rankIndex === 0;
            const rankStyle = getRankStyle(rankIndex);
            
            return (
              <motion.div 
                key={u.id || u._id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: rankIndex * 0.15 }}
                className={`flex-1 relative w-full flex flex-col items-center bg-gradient-to-b ${rankStyle} rounded-[2rem] p-6 text-center border-t border-white/50 shadow-2xl transition-transform hover:-translate-y-2 ${isFirst ? 'md:-translate-y-8 pb-10 z-10 scale-105' : 'opacity-90'}`}
              >
                <div className="absolute -top-12 flex flex-col items-center">
                  {isFirst && <span className="text-4xl mb-1 animate-bounce drop-shadow-lg">👑</span>}
                  <img src={u.avatar} className={`rounded-2xl shadow-xl ${isFirst ? 'w-24 h-24 border-[4px] border-yellow-200' : 'w-20 h-20 border-[3px] border-white/60'} bg-white object-cover`} alt="" />
                </div>
                
                <div className={`mt-${isFirst ? '12' : '8'} w-full`}>
                  <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${isFirst ? 'text-yellow-100' : 'text-slate-100'}`}>Rank {rankIndex + 1}</p>
                  <h3 className={`text-xl font-black mb-2 ${isFirst ? 'text-white text-2xl' : 'text-white'}`}>{u.name}</h3>
                  <div className="flex items-center justify-center gap-2 mt-4 px-5 py-2.5 bg-black/20 rounded-xl backdrop-blur-md border border-white/10 shadow-inner inline-flex">
                    <Star className={`w-5 h-5 ${isFirst ? 'text-yellow-300 fill-yellow-300' : 'text-white fill-white'}`} style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.2))' }} />
                    <span className="font-black text-white text-lg tracking-tight">{u.points}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {rest.length > 0 && (
        <div className="space-y-4 max-w-3xl mx-auto">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-4 mb-6">Remaining Top 10</p>
          {rest.map((u, i) => {
            const isCurrentUser = u.id === currentUser?.id || u._id === currentUser?.id;
            return (
              <motion.div 
                key={u.id || u._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + (i * 0.05) }}
                className={`flex items-center gap-4 bg-white p-4 sm:p-5 rounded-[1.5rem] transition-all hover:scale-[1.01] ${
                  isCurrentUser ? 'border-2 border-emerald-500 shadow-xl shadow-emerald-500/10' : 'border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200/50'
                }`}
              >
                <div className="w-12 text-center font-black text-xl text-slate-300">#{i + 4}</div>
                <img src={u.avatar} className={`w-14 h-14 rounded-2xl border-2 ${isCurrentUser ? 'border-emerald-200' : 'border-slate-100'} bg-slate-50`} alt="" />
                <div className="flex-1 pl-2">
                  <h4 className="font-black text-slate-800 text-base">{u.name} {isCurrentUser && <span className="ml-2 text-[9px] px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-lg uppercase tracking-widest leading-none align-middle relative -top-0.5">You</span>}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{u.sector || 'Sector Alpha'}</p>
                </div>
                <div className={`px-5 py-2.5 rounded-xl flex items-center gap-2 ${isCurrentUser ? 'bg-emerald-50 border border-emerald-100' : 'bg-slate-50 border border-slate-100'}`}>
                  <span className="font-black text-slate-900 text-lg">{u.points}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest scale-90">PTS</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
      
      {users.length === 0 && !loading && (
        <div className="text-center py-20 bg-slate-50/50 rounded-[3rem] border-2 border-slate-200 border-dashed max-w-2xl mx-auto">
          <div className="w-20 h-20 bg-white shadow-xl shadow-slate-200/50 rounded-3xl mx-auto flex items-center justify-center mb-6">
            <Activity className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-slate-700 font-black text-xl mb-2">No Leaderboard Data</h3>
          <p className="text-slate-500 font-semibold mb-6 max-w-xs mx-auto">The hierarchy is currently empty. Start reporting incidents to claim the top rank.</p>
        </div>
      )}
    </motion.div>
  );
};

export default Leaderboard;
