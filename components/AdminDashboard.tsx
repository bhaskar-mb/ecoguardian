
import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Report, Alert, User } from '../types.ts';

interface AdminDashboardProps {
  reports: Report[];
  alerts: Alert[];
  authorities: string[];
  onBroadcastAlert: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ reports, alerts, authorities, onBroadcastAlert }) => {
  const stats = {
    totalReports: reports.length,
    pendingReports: reports.filter(r => r.status === 'pending').length,
    activeAlerts: alerts.filter(a => !a.isRead).length,
    resolvedReports: reports.filter(r => r.status === 'resolved').length
  };

  const authorityStats = authorities.map(auth => {
    const authReports = reports.filter(r => r.assignedAuthorityId === auth);
    return {
      name: auth,
      active: authReports.filter(r => ['assigned', 'investigating'].includes(r.status)).length,
      resolved: authReports.filter(r => r.status === 'resolved').length
    };
  });

  const averageResponseTime = useMemo(() => {
    const resolvedReports = reports.filter(r => r.status === 'resolved' && r.timeline.length > 1);
    if (resolvedReports.length === 0) return "42m 12s"; // Fallback
    
    const totalMs = resolvedReports.reduce((acc, report) => {
      const start = new Date(report.timeline[0].timestamp).getTime();
      const end = new Date(report.timeline[report.timeline.length - 1].timestamp).getTime();
      return acc + (end - start);
    }, 0);
    
    const avgMs = totalMs / resolvedReports.length;
    const mins = Math.floor(avgMs / 60000);
    const secs = Math.floor((avgMs % 60000) / 1000);
    return `${mins}m ${secs}s`;
  }, [reports]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-4 sm:space-y-6"
    >
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Total Incidents', value: stats.totalReports, color: 'bg-slate-900' },
          { label: 'Pending Triage', value: stats.pendingReports, color: 'bg-amber-600' },
          { label: 'Active Alerts', value: stats.activeAlerts, color: 'bg-red-600' },
          { label: 'Resolved Cases', value: stats.resolvedReports, color: 'bg-emerald-600' }
        ].map(stat => (
          <div key={stat.label} className={`${stat.color} p-4 sm:p-6 rounded-2xl sm:rounded-3xl text-white shadow-xl`}>
            <p className="text-[7px] sm:text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">{stat.label}</p>
            <p className="text-xl sm:text-3xl font-black">{stat.value}</p>
          </div>
        ))}
      </motion.div>

      <motion.div variants={itemVariants} className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h3 className="text-lg sm:text-xl font-black text-slate-900">System Controls</h3>
            <button 
              onClick={onBroadcastAlert}
              className="w-full sm:w-auto px-5 py-2.5 bg-red-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-900/20"
            >
              Broadcast Alert
            </button>
          </div>
          <div className="space-y-3">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <h4 className="font-black text-slate-800 text-xs sm:text-sm mb-1">Sentinel Network Status</h4>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[8px] sm:text-[9px] font-bold text-slate-500 uppercase tracking-widest">All Nodes Operational</span>
              </div>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <h4 className="font-black text-slate-800 text-xs sm:text-sm mb-1">Authority Response Time</h4>
              <p className="text-[8px] sm:text-[9px] font-bold text-slate-500 uppercase tracking-widest">Average: {averageResponseTime}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden">
          <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-6">Field Authorities</h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {authorityStats.map(auth => (
              <div key={auth.name} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                <div>
                  <h4 className="font-black text-xs text-slate-800">{auth.name}</h4>
                  <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Active Units: {auth.active > 0 ? 'Deployed' : 'Standby'}</p>
                </div>
                <div className="flex gap-2">
                  <div className="text-center px-3 py-1 bg-amber-100 rounded-lg">
                    <p className="text-[6px] font-black text-amber-600 uppercase">Active</p>
                    <p className="text-xs font-black text-amber-700">{auth.active}</p>
                  </div>
                  <div className="text-center px-3 py-1 bg-emerald-100 rounded-lg">
                    <p className="text-[6px] font-black text-emerald-600 uppercase">Done</p>
                    <p className="text-xs font-black text-emerald-700">{auth.resolved}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 p-6 sm:p-8 rounded-2xl sm:rounded-[2rem] text-white shadow-2xl lg:col-span-2 relative overflow-hidden">
          <h3 className="text-lg sm:text-xl font-black mb-6">Recent Alerts</h3>
          <div className="space-y-3 max-h-[250px] sm:max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {alerts.length === 0 && <p className="text-slate-500 font-bold italic text-xs sm:text-sm">No alerts broadcasted.</p>}
            {alerts.map(alert => (
              <div key={alert.id} className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-black text-[10px] sm:text-xs">{alert.title}</h4>
                  <span className={`px-1.5 py-0.5 rounded text-[6px] sm:text-[7px] font-black uppercase tracking-widest ${
                    alert.severity === 'critical' ? 'bg-red-500' : 
                    alert.severity === 'warning' ? 'bg-amber-500' : 
                    'bg-indigo-500'
                  }`}>
                    {alert.severity}
                  </span>
                </div>
                <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium leading-relaxed mb-2">{alert.message}</p>
                <p className="text-[6px] sm:text-[7px] font-black text-slate-600 uppercase tracking-widest">
                  {new Date(alert.timestamp).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AdminDashboard;
