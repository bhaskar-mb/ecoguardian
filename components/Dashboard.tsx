
import React, { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'motion/react';
import { generateCommunityUpdate } from '../services/geminiService.ts';
import { Report, User } from '../types.ts';

interface DashboardProps {
  reports: Report[];
  user: User;
  onNewReport: () => void;
  onNavigate: (tab: string) => void;
  onBroadcastAlert?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ reports, user, onNewReport, onNavigate, onBroadcastAlert }) => {
  const [aiSummary, setAiSummary] = useState("EcoGuardian is cross-referencing recent environmental data streams...");

  const chartData = useMemo(() => {
    const data = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const count = reports.filter(r => {
        const reportDate = new Date(r.timestamp);
        return reportDate.toDateString() === d.toDateString();
      }).length;
      data.push({ name: dayName, incidents: count });
    }
    return data;
  }, [reports]);

  // Authority-specific stats
  const orgReports = useMemo(() => {
    if (user.role !== 'authority') return { assigned: 0, investigating: 0, resolved: 0 };
    return {
      assigned: reports.filter(r => r.assignedAuthorityId === user.organization && r.status === 'assigned').length,
      investigating: reports.filter(r => r.assignedAuthorityId === user.organization && r.status === 'investigating').length,
      resolved: reports.filter(r => r.assignedAuthorityId === user.organization && r.status === 'resolved').length,
    };
  }, [reports, user]);

  useEffect(() => {
    const fetchSummary = async () => {
      if (reports.length > 0) {
        try {
          const summary = await generateCommunityUpdate(reports.slice(0, 5));
          setAiSummary(summary);
        } catch (e) {
          setAiSummary("The sentinel network remains active. Your reports provide critical data points for wildlife safety.");
        }
      }
    };
    fetchSummary();
  }, [reports]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const isAuthority = user.role === 'authority';
  const isAdmin = user.role === 'admin';
  const isAuthorityOrAdmin = isAuthority || isAdmin;

  // ── ADMIN Dashboard ──────────────────────────────────────────────
  if (isAdmin) {
    const globalStats = [
      { label: 'Total Reports', value: reports.length, icon: '📋', color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
      { label: 'Pending Triage', value: reports.filter(r => r.status === 'pending').length, icon: '⏳', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
      { label: 'Active Cases', value: reports.filter(r => ['assigned','investigating'].includes(r.status)).length, icon: '🔴', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
      { label: 'Resolved', value: reports.filter(r => r.status === 'resolved').length, icon: '✅', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    ];

    const adminCards = [
      { icon: '🚨', title: 'Broadcast Alert', desc: 'Push critical emergency alerts to all active field units and authorities instantly.', action: () => onBroadcastAlert?.(), gradient: 'from-red-600 to-rose-700', glow: 'hover:shadow-red-500/20' },
      { icon: '📋', title: 'Operations Feed', desc: 'Review and triage all incoming incident reports across every sector.', action: () => onNavigate('reports'), gradient: 'from-indigo-600 to-violet-700', glow: 'hover:shadow-indigo-500/20' },
      { icon: '🛡️', title: 'Admin Control Panel', desc: 'Manage authority assignments, view system health, and authority performance.', action: () => onNavigate('leaderboard'), gradient: 'from-slate-700 to-slate-800', glow: 'hover:shadow-slate-500/20' },
      { icon: '📊', title: 'Analytics Center', desc: 'Explore deep environmental trend data and sector anomaly heatmaps.', action: () => onNavigate('analytics'), gradient: 'from-cyan-600 to-teal-700', glow: 'hover:shadow-cyan-500/20' },
    ];

    const recentReports = reports.slice(0, 4);

    return (
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
        {/* Admin Hero */}
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl sm:rounded-[2rem] text-white shadow-2xl" style={{ background: 'linear-gradient(135deg, #0f1629 0%, #1e1b4b 50%, #0f172a 100%)' }}>
          {/* Decorative glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-violet-600/15 rounded-full blur-[80px] translate-y-1/2 pointer-events-none" />

          <div className="relative z-10 p-6 sm:p-10">
            {/* Status bar */}
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-[9px] font-black uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                Chief Warden — Sector Alpha
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[9px] font-black uppercase tracking-widest">
                🛡️ Super Admin
              </div>
              <div className="ml-auto text-right hidden sm:block">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-6xl font-black mb-3 leading-none tracking-tight">Global Command<br /><span className="text-indigo-400">Grid.</span></h1>
            <p className="text-slate-400 text-base sm:text-lg font-medium mb-8 max-w-2xl leading-relaxed">
              Unified oversight across all environmental sectors, incident pipelines, and authority networks.
            </p>

            {/* Global Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {globalStats.map(stat => (
                <div key={stat.label} className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${stat.bg}`}>
                  <span className="text-xl">{stat.icon}</span>
                  <div>
                    <p className={`text-2xl font-black leading-none ${stat.color}`}>{stat.value}</p>
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-wider mt-0.5">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Admin Action Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {adminCards.map((card, i) => (
            <button
              key={i}
              onClick={card.action}
              className={`group relative rounded-[2rem] p-6 text-white text-left overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all bg-gradient-to-br ${card.gradient} ${card.glow} shadow-xl`}
            >
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              <div className="relative z-10">
                <span className="text-4xl mb-5 block group-hover:scale-110 transition-transform">{card.icon}</span>
                <h3 className="text-base font-black mb-2">{card.title}</h3>
                <p className="text-[11px] font-medium text-white/70 leading-relaxed">{card.desc}</p>
                <div className="mt-6 text-[9px] font-black uppercase tracking-widest text-white/60 group-hover:text-white transition-colors flex items-center gap-1">
                  Open <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
                </div>
              </div>
            </button>
          ))}
        </motion.div>

        {/* Recent Activity + Chart */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Activity Feed */}
          <div className="lg:col-span-2 bg-slate-900 text-white rounded-[2rem] p-6 sm:p-8 shadow-2xl flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-indigo-400 text-[9px] font-black uppercase tracking-[0.3em] mb-0.5">Live Feed</p>
                  <h3 className="text-xl font-black">Recent Reports</h3>
                </div>
                <button onClick={() => onNavigate('reports')} className="text-[9px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest transition-colors">View All →</button>
              </div>
              <div className="space-y-3">
                {recentReports.length === 0 ? (
                  <p className="text-[11px] text-slate-500 italic">No reports yet.</p>
                ) : recentReports.map(r => (
                  <div key={r.id} className="flex items-start gap-3 bg-white/5 rounded-2xl p-4 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => onNavigate('reports')}>
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      r.status === 'resolved' ? 'bg-emerald-400' :
                      r.status === 'pending' ? 'bg-amber-400 animate-pulse' : 'bg-indigo-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black text-white truncate">{r.type}</p>
                      <p className="text-[9px] font-bold text-slate-500 truncate">{r.location.address || 'Unknown location'}</p>
                    </div>
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide shrink-0 ${
                      r.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-300' :
                      r.status === 'pending' ? 'bg-amber-500/20 text-amber-300' : 'bg-indigo-500/20 text-indigo-300'
                    }`}>{r.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Global Activity Chart */}
          <div className="lg:col-span-3 bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-xl text-slate-900">Global Incident Activity</h3>
              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-indigo-100">7 Days</span>
            </div>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="adminGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '11px' }} />
                  <Area type="monotone" dataKey="incidents" stroke="#6366f1" strokeWidth={3} fill="url(#adminGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // ── AUTHORITY Dashboard ───────────────────────────────────────────
  if (isAuthority) {
    const quickActions = [
      {
        icon: '🔍',
        title: 'View Assigned Cases',
        desc: 'Review all active incident reports assigned to your agency.',
        tab: 'reports',
        badge: (orgReports.assigned + orgReports.investigating) || null
      },
      {
        icon: '📡',
        title: 'Agency Directory',
        desc: 'Access inter-agency contacts, directives, and regulations.',
        tab: 'notes',
        badge: null
      },
      {
        icon: '📊',
        title: 'Environmental Analytics',
        desc: 'View detailed environmental trend analysis for your sector.',
        tab: 'analytics',
        badge: null
      },
    ];

    const statCards = [
      { label: 'Assigned', value: orgReports.assigned, color: 'text-amber-400' },
      { label: 'Investigating', value: orgReports.investigating, color: 'text-indigo-400' },
      { label: 'Resolved', value: orgReports.resolved, color: 'text-emerald-400' },
    ];

    return (
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
        {/* Authority Hero */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-2xl sm:rounded-[2rem] p-6 sm:p-10 text-white shadow-2xl bg-slate-900"
        >
          {/* Glow Effect */}
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-[80px] opacity-30 bg-emerald-500" />
          <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6 sm:gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest mb-4 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                {user.organization || 'Authority Command'}
              </div>
              <h1 className="text-3xl sm:text-5xl font-black mb-3 sm:mb-4 leading-none tracking-tight">Authority<br />Command Center.</h1>
              <p className="text-slate-400 text-base sm:text-lg font-medium leading-relaxed">
                Oversee cases, respond to incidents, and coordinate inter-agency operations.
              </p>
            </div>

            {/* Active Cases Widget */}
            <div className={`bg-white/5 backdrop-blur-xl border p-6 sm:p-8 rounded-2xl sm:rounded-3xl xl:w-72 shrink-0 border-emerald-500/20`}>
              <p className="text-[9px] font-black uppercase tracking-widest mb-5 text-emerald-400">Active Cases — {user.organization}</p>
              <div className="space-y-3">
                {statCards.map(s => (
                  <div key={s.label} className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{s.label}</span>
                    <span className={`text-2xl font-black ${s.color}`}>{s.value}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => onNavigate('reports')}
                className="mt-6 w-full py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                Open Operations Feed →
              </button>
            </div>
          </div>
        </motion.div>

        {/* Quick Action Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {quickActions.map((action) => (
            <button
              key={action.tab}
              onClick={() => onNavigate(action.tab)}
              className="group relative bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-left overflow-hidden"
            >
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-emerald-50`} />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-3xl">{action.icon}</span>
                  {action.badge !== null && action.badge > 0 && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-[9px] font-black">{action.badge} active</span>
                  )}
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-2 group-hover:text-slate-700 transition-colors">{action.title}</h3>
                <p className="text-[11px] font-medium text-slate-500 leading-relaxed">{action.desc}</p>
                <div className={`mt-5 text-[9px] font-black uppercase tracking-widest flex items-center gap-1 text-emerald-600`}>
                  Open <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
                </div>
              </div>
            </button>
          ))}
        </motion.div>
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-5 gap-5">
           {/* Activity Feed */}
           <div className="lg:col-span-2 bg-slate-900 text-white rounded-[2rem] p-6 sm:p-8 shadow-2xl flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-amber-400 text-[9px] font-black uppercase tracking-[0.3em] mb-0.5">Live Situational Feed</p>
                  <h3 className="text-xl font-black">All Sector Reports</h3>
                </div>
                <button onClick={() => onNavigate('reports')} className="text-[9px] font-black text-amber-400 hover:text-amber-300 uppercase tracking-widest transition-colors">View All →</button>
              </div>
              <div className="space-y-3">
                {reports.length === 0 ? (
                  <p className="text-[11px] text-slate-500 italic">No reports yet.</p>
                ) : reports.slice(0, 4).map(r => (
                  <div key={r.id} className="flex items-start gap-3 bg-white/5 rounded-2xl p-4 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => onNavigate('reports')}>
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      r.status === 'resolved' ? 'bg-emerald-400' :
                      r.status === 'pending' ? 'bg-amber-400 animate-pulse' : 'bg-indigo-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black text-white truncate">{r.type}</p>
                      <p className="text-[9px] font-bold text-slate-500 truncate">{r.location.address || 'Unknown location'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Regional Activity Chart */}
          <div className="lg:col-span-3 bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden text-slate-900">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-xl">Sector Activity Trends</h3>
              <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-amber-100">Live Grid</span>
            </div>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="authGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d97706" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '11px' }} />
                  <Area type="monotone" dataKey="incidents" stroke="#d97706" strokeWidth={3} fill="url(#authGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // Standard User View — Rich Dashboard
  const timeOfDay = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const userFeatureCards = [
    {
      icon: '📝',
      title: 'Submit A Report',
      desc: 'Spotted illegal logging, pollution, or wildlife in distress? File a report instantly.',
      cta: 'Start Report',
      tab: 'report',
      gradient: 'from-emerald-500 to-teal-600',
      glow: 'shadow-emerald-500/20',
      badgeText: '+10 pts',
    },
    {
      icon: '📂',
      title: 'My Operations',
      desc: `Track ${reports.filter(r => r.reporterId === user.id).length} reports you've filed and their current resolution status.`,
      cta: 'View Feed',
      tab: 'reports',
      gradient: 'from-indigo-500 to-blue-600',
      glow: 'shadow-indigo-500/20',
      badgeText: `${reports.filter(r => r.reporterId === user.id).length} filed`,
    },
    {
      icon: '📚',
      title: 'Guardian Library',
      desc: 'Field guides, wildlife risk profiles, and official environmental governance portals.',
      cta: 'Explore',
      tab: 'notes',
      gradient: 'from-amber-500 to-orange-600',
      glow: 'shadow-amber-500/20',
      badgeText: 'Resources',
    },
    {
      icon: '🏆',
      title: 'Leaderboard',
      desc: 'See how you rank among other eco-sentinels in your sector. Earn more to climb up.',
      cta: 'View Rankings',
      tab: 'leaderboard',
      gradient: 'from-purple-500 to-pink-600',
      glow: 'shadow-purple-500/20',
      badgeText: `${user.points} pts`,
    },
  ];

  const earnSteps = [
    { icon: '📝', action: 'Submit a Report', points: '+10 pts', color: 'bg-emerald-100 text-emerald-700' },
    { icon: '✅', action: 'Report Verified', points: '+25 pts', color: 'bg-indigo-100 text-indigo-700' },
    { icon: '🎯', action: 'Incident Resolved', points: '+50 pts', color: 'bg-amber-100 text-amber-700' },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      {/* Hero Banner */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-2xl sm:rounded-[2rem] text-white shadow-2xl"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #064e3b 60%, #065f46 100%)' }}
      >
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-teal-500/15 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4" />

        <div className="relative z-10 p-6 sm:p-10">
          {/* Greeting row */}
          <div className="flex items-center gap-3 mb-6">
            {user.avatar && (
              <img src={user.avatar} className="w-12 h-12 rounded-2xl border-2 border-white/20 shadow-xl" alt="avatar" />
            )}
            <div>
              <p className="text-emerald-400 text-[9px] font-black uppercase tracking-[0.3em] mb-0.5">{timeOfDay()}</p>
              <h2 className="text-xl font-black tracking-tight">{user.name}</h2>
            </div>
            <div className="ml-auto px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Eco Sentinel
            </div>
          </div>

          {/* Main headline */}
          <h1 className="text-3xl sm:text-5xl font-black mb-3 leading-none tracking-tight">
            Safeguarding<br />Nature.
          </h1>
          <p className="text-slate-400 text-base sm:text-lg font-medium mb-8 max-w-xl leading-relaxed">
            Every report you file protects wildlife and holds polluters accountable. Your voice matters.
          </p>

          {/* CTA + Stat pills row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <button
              onClick={onNewReport}
              className="group flex items-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-white px-7 py-4 rounded-xl font-black transition-all shadow-xl shadow-emerald-900/40 text-sm"
            >
              <span className="text-lg">📝</span>
              New Field Report
              <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
            </button>
            <div className="flex items-center gap-3 flex-wrap">
              {[
                { label: 'Reports Filed', value: user.reportsCount, icon: '📂' },
                { label: 'Eco Points', value: user.points, icon: '⭐' },
                { label: 'Sector', value: user.sector || 'Alpha', icon: '📍' },
              ].map(stat => (
                <div key={stat.label} className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl">
                  <span className="text-base">{stat.icon}</span>
                  <div>
                    <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none">{stat.label}</p>
                    <p className="text-sm font-black text-white leading-none mt-0.5">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Feature Cards Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {userFeatureCards.map((card) => (
          <button
            key={card.tab}
            onClick={() => onNavigate(card.tab === 'report' ? 'report' : card.tab)}
            className={`group relative bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all text-left overflow-hidden ${card.glow}`}
          >
            {/* Hover gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl group-hover:scale-110 transition-transform inline-block">{card.icon}</span>
                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black bg-gradient-to-r ${card.gradient} text-white shadow-sm`}>
                  {card.badgeText}
                </span>
              </div>
              <h3 className="text-base font-black text-slate-900 mb-2">{card.title}</h3>
              <p className="text-[11px] font-medium text-slate-500 leading-relaxed">{card.desc}</p>
              <div className={`mt-5 text-[9px] font-black uppercase tracking-widest bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent flex items-center gap-1`}>
                {card.cta} <span className="group-hover:translate-x-1 transition-transform inline-block bg-gradient-to-r from-current to-current">→</span>
              </div>
            </div>
          </button>
        ))}
      </motion.div>

      {/* Bottom row: Chart + How to Earn */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Chart */}
        <div className="lg:col-span-3 bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black text-xl text-slate-900">Regional Activity</h3>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100">Live Feed</span>
          </div>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="ecoGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} />
                <YAxis hide />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '11px' }} />
                <Area type="monotone" dataKey="incidents" stroke="#10b981" strokeWidth={3} fill="url(#ecoGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* How to Earn Points */}
        <div className="lg:col-span-2 bg-slate-900 text-white rounded-[2rem] p-6 sm:p-8 shadow-2xl flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="relative z-10 flex-1">
            <p className="text-emerald-400 text-[9px] font-black uppercase tracking-[0.3em] mb-1">Rewards System</p>
            <h3 className="text-2xl font-black mb-1">How to Earn</h3>
            <p className="text-slate-400 text-[11px] font-medium mb-6 leading-relaxed">
              Your current total: <span className="text-white font-black">{user.points} pts</span>
            </p>
            <div className="space-y-3">
              {earnSteps.map((step, i) => (
                <div key={i} className="flex items-center gap-4 bg-white/5 rounded-2xl p-4 border border-white/5">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-xl shrink-0">
                    {step.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-white">{step.action}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-[9px] font-black ${step.color}`}>
                    {step.points}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => onNavigate('leaderboard')}
            className="relative z-10 mt-6 w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
          >
            View Leaderboard →
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
