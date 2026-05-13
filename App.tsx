import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Layout from './components/Layout.tsx';
import Dashboard from './components/Dashboard.tsx';
import ReportWizard from './components/ReportWizard.tsx';
import Login from './components/Login.tsx';
import SystemInsights from './components/SystemInsights.tsx';
import Resources from './components/Resources.tsx';
import ChatSentinel from './components/ChatSentinel.tsx';
import AdminDashboard from './components/AdminDashboard.tsx';
import DatabaseViewer from './components/DatabaseViewer.tsx';
import Leaderboard from './components/Leaderboard.tsx';

import EnvironmentalAnalytics from './components/EnvironmentalAnalytics.tsx';
import { User, Report, Severity, IncidentType, ReportStatus, TimelineEvent, Alert } from './types.ts';
import { logoutUser, getAuthHeader } from './services/authService.ts';
import { ShieldAlert } from 'lucide-react';

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

const INITIAL_ALERTS: Alert[] = [
  {
    id: 'A-001',
    title: 'Critical Weather Warning',
    message: 'Heavy rainfall expected in the northern sector. High risk of flash floods and land damage.',
    severity: 'critical',
    timestamp: new Date(),
    isRead: false
  }
];

const INITIAL_REPORTS: Report[] = [
  {
    id: 'R-1775541712358',
    reportNumber: 1,
    type: IncidentType.ILLEGAL_LOGGING,
    severity: Severity.CRITICAL,
    description: 'Fresh illegal felling detected in the deep wooded area.',
    location: { lat: 45.523, lng: -122.676, address: "Nandyal, Industrial Sector" },
    timestamp: new Date(Date.now() - 7200000),
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800',
    status: 'assigned',
    reporterId: 'user-001',
    assignedAuthorityId: 'Forestry Commission',
    timeline: [
      { status: 'pending', timestamp: new Date(Date.now() - 7200000), message: 'Incident reported. Dispatched to Global Command for triage.', actor: 'JAS' },
      { status: 'assigned', timestamp: new Date(Date.now() - 3600000), message: 'Central Command assigned this anomaly to Forestry Commission.', actor: 'ADMIN' }
    ]
  },
  {
    id: 'R-1775541712359',
    reportNumber: 2,
    type: IncidentType.LAND_DAMAGE,
    severity: Severity.HIGH,
    description: 'Unexplained excavation detected on rural site.',
    location: { lat: 45.512, lng: -122.658, address: "Kurnool, Rural Sector" },
    timestamp: new Date(Date.now() - 3600000),
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800',
    status: 'pending',
    reporterId: 'user-002',
    timeline: [
      { status: 'pending', timestamp: new Date(Date.now() - 3600000), message: 'Incident reported. Dispatched to Global Command for triage.', actor: 'Sentinel AI' }
    ]
  }
];

import { io } from 'socket.io-client';

import { Toaster, toast } from 'react-hot-toast';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolutionText, setResolutionText] = useState('');
  const [resolutionImage, setResolutionImage] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [newAlert, setNewAlert] = useState({ title: '', message: '', severity: 'info' as Alert['severity'] });
  const [pointsNotification, setPointsNotification] = useState<{ amount: number, type: string } | null>(null);

  // Real-time Socket Connection
  const socket = useMemo(() => io('http://localhost:5000'), []);

  useEffect(() => {
    // Initial Fetch from Database
    const fetchReports = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/reports');
        const data = await res.json();
        if (data && data.length > 0) {
          // Final safety: ensure every report has a number based on its position if missing
          const sanitized = data.map((r: any, idx: number) => ({
            ...r,
            reportNumber: r.reportNumber || (data.length - idx)
          }));
          setReports(sanitized);
        } else {
          setReports(INITIAL_REPORTS);
        }
      } catch (err) {
        console.error("Failed to fetch reports:", err);
        setReports(INITIAL_REPORTS);
      }
    };

    fetchReports();

    // Listen for Real-time Updates
    socket.on('newReport', (newReport: Report) => {
      setReports(prev => {
        // Prevent duplication if the report was already added locally
        const exists = prev.some(r => (r._id && r._id === newReport._id) || (r.id && r.id === newReport.id));
        if (exists) return prev;
        return [newReport, ...prev];
      });
      
      // Show notification if it's not our own report
      if (newReport.reporterId !== user?.id) {
        toast.custom((t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-slate-900 shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-white/10 p-4 border border-emerald-500/30`}>
            <div className="flex-1 w-0 p-1">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5 text-2xl">🌱</div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-black text-white uppercase tracking-widest">New Environmental Report</p>
                  <p className="mt-1 text-xs font-bold text-slate-400 capitalize">{newReport.type} — {newReport.location.address}</p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-white/5">
              <button onClick={() => { setActiveTab('reports'); toast.dismiss(t.id); }} className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-emerald-500 hover:text-emerald-400 focus:outline-none">View</button>
            </div>
          </div>
        ), { duration: 5000 });
      }
    });

    socket.on('statusUpdate', (updatedReport: Report) => {
      setReports(prev => {
        const index = prev.findIndex(r => (r._id && r._id === updatedReport._id) || (r.id && r.id === updatedReport.id));
        if (index === -1) {
          // If for some reason we missed the newReport event, add it now
          return [updatedReport, ...prev];
        }
        const updatedReports = [...prev];
        updatedReports[index] = updatedReport;
        return updatedReports;
      });
      
      // Notify if status changed to resolved
      if (updatedReport.status === 'resolved') {
        toast.success(`Incident Resolved at ${updatedReport.location.address}`, {
          style: { background: '#0f172a', color: '#10b981', fontWeight: 'bold', fontSize: '10px', textTransform: 'uppercase', borderRadius: '12px', border: '1px solid #10b981' },
          iconTheme: { primary: '#10b981', secondary: '#fff' }
        });
      }
    });

    return () => {
      socket.off('newReport');
      socket.off('statusUpdate');
    };
  }, [socket, user]);

  const handleLogout = () => {
    logoutUser();
    setIsAuthenticated(false);
    setUser(null);
  };

  const handleAuthSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    setIsAuthenticated(true);
    if (authenticatedUser.role === 'admin' || authenticatedUser.role === 'authority') {
      setActiveTab('reports');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleDismissAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, isRead: true } : a));
  };

  const handleBroadcastAlert = () => {
    if (!newAlert.title || !newAlert.message) return;
    const alert: Alert = {
      id: `A-${Math.random().toString(36).substr(2, 5)}`,
      ...newAlert,
      timestamp: new Date(),
      isRead: false
    };
    setAlerts(prev => [alert, ...prev]);
    setIsAlertModalOpen(false);
    setNewAlert({ title: '', message: '', severity: 'info' });
  };

  const handleAddNote = (id: string) => {
    if (!noteText.trim()) return;
    setReports(prev => prev.map(r => {
      if (r.id === id) {
        return {
          ...r,
          internalNotes: [...(r.internalNotes || []), `${user?.name} (${user?.organization}): ${noteText}`]
        };
      }
      return r;
    }));
    setNoteText('');
  };

  const handleResolveSubmit = async (id: string) => {
    if (!resolutionText.trim() || !user) return;
    try {
      const response = await fetch(`http://localhost:5000/api/reports/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({
          status: 'resolved',
          timelineEvent: {
            status: 'resolved',
            timestamp: new Date(),
            message: `${user.organization} has resolved the incident.`,
            actor: user.name,
            actionTaken: 'Incident resolved with photo proof.'
          },
          resolutionDetails: resolutionText,
          resolvedImageUrl: resolutionImage || undefined
        })
      });

      if (response.ok) {
        const resolvedReport = await response.json();
        setReports(prev => prev.map(r => (r.id === resolvedReport.id || r._id === resolvedReport.id) ? resolvedReport : r));
        setResolvingId(null);
        setResolutionText("");
        setResolutionImage(null);
        toast.success("Incident officially resolved!");
      } else {
        toast.error("Cloud sync failed.");
      }
    } catch (err) {
      console.error("Resolution Error:", err);
      toast.error("Failed to connect to authority grid.");
    }
  };

  const handleResolutionFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setResolutionImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNewReport = async (reportData: Partial<Report>) => {
    try {
      const reportToSubmit = {
        ...reportData,
        status: 'pending',
        reporterId: user?.id || 'anonymous',
        timestamp: reportData.timestamp || new Date(),
        timeline: [{
          status: 'pending',
          timestamp: new Date(),
          message: 'Incident reported. Dispatched to Global Command for triage.',
          actor: user?.name || 'Anonymous'
        }]
      };

      const response = await fetch('http://localhost:5000/api/reports', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(reportToSubmit)
      });

      if (!response.ok) throw new Error('Failed to save report to database');
      
      const savedReport = await response.json();
      setReports(prev => [savedReport, ...prev]);
      
      // Award points for submitting a report
      if (user && user.role === 'user') {
        setUser({ 
          ...user, 
          points: user.points + 10,
          reportsCount: user.reportsCount + 1 
        });
        setPointsNotification({ amount: 10, type: 'Report Submitted' });
        setTimeout(() => setPointsNotification(null), 3000);
      }
      
      setActiveTab('reports');
      toast.success(`Environmental Report Lodged: #${savedReport.reportNumber || '0'}`);
    } catch (err) {
      console.error("Error creating report:", err);
      toast.error("Database connection failure. Saving locally.");
      const nextNum = reports.length > 0 ? Math.max(...reports.map(r => r.reportNumber || 0)) + 1 : 1;
      const fallbackReport = { 
        ...reportData, 
        id: `R-${Date.now()}`,
        reportNumber: nextNum,
        status: 'pending',
        timestamp: new Date(),
        timeline: [{ status: 'pending', timestamp: new Date(), message: 'Offline Mode: Local Cache', actor: 'Local System' }]
      } as Report;
      setReports([fallbackReport, ...reports]);
      setActiveTab('reports');
    }
  };

  const handleDeleteReport = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this incident report?")) return;
    try {
      const response = await fetch(`http://localhost:5000/api/reports/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });

      if (response.ok) {
        setReports(prev => prev.filter(r => r.id !== id && r._id !== id));
        toast.success("Incident deleted.");
      } else {
        toast.error("Failed to delete incident.");
      }
    } catch (err) {
      console.error("Error deleting report:", err);
      toast.error("Network error. Could not delete incident.");
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: ReportStatus, message: string, actor: string, extraData?: any) => {
    try {
      const timelineEvent: TimelineEvent = {
        status: newStatus,
        timestamp: new Date(),
        message,
        actor,
        proofUrl: extraData?.proofUrl
      };

      const response = await fetch(`http://localhost:5000/api/reports/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({
          status: newStatus,
          timelineEvent,
          ...extraData
        })
      });

      if (!response.ok) throw new Error('Failed to update status on server');
      
      const updatedReport = await response.json();
      setReports(prev => prev.map(r => (r.id === updatedReport.id || r._id === updatedReport.id) ? updatedReport : r));

      // Award points logic remains local for now
      if (newStatus === 'resolved') {
        const originalReport = reports.find(r => r.id === id || r._id === id);
        if (originalReport && originalReport.reporterId === user?.id) {
          setUser(prevUser => prevUser ? { ...prevUser, points: prevUser.points + 50 } : null);
          setPointsNotification({ amount: 50, type: 'Incident Resolved' });
          setTimeout(() => setPointsNotification(null), 3000);
        }
        toast.success("Incident Resolved!");
      } else {
        toast.success(`Status updated to: ${newStatus}`);
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const visibleReports = useMemo(() => {
    if (!user) return [];
    if (user.role === 'admin') return reports;
    if (user.role === 'authority') {
      return reports.filter(r => r.assignedAuthorityId === user.organization);
    }
    return reports.filter(r => r.reporterId === user.id);
  }, [reports, user]);

  if (!isAuthenticated || !user) return <Login onLoginSuccess={handleAuthSuccess} />;

  return (
    <Layout user={user} onLogout={handleLogout} activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'dashboard' && (
        <Dashboard 
          reports={reports} 
          user={user} 
          onNewReport={() => setActiveTab('report')} 
          onNavigate={(t) => setActiveTab(t)} 
        />
      )}
      
      {activeTab === 'report' && <ReportWizard onComplete={handleNewReport} />}

      {activeTab === 'reports' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto px-4 sm:px-8 space-y-8"
        >
          {/* Critical Alerts Section */}
          {user.role === 'authority' && alerts.filter(a => !a.isRead && a.severity === 'critical').map(alert => (
            <motion.div 
              key={alert.id}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#fee2e2]/60 border border-red-100 p-6 rounded-[2.5rem] flex items-center justify-between relative group"
            >
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 bg-[#ef4444] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-red-500/20">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <div className="pt-1">
                  <h3 className="text-[#991b1b] text-xl font-black mb-1">{alert.title}</h3>
                  <p className="text-[#b91c1c] text-sm font-bold opacity-80 leading-relaxed max-w-2xl">{alert.message}</p>
                  <p className="text-[#ef4444] text-[10px] font-black uppercase tracking-widest mt-2">
                    {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => handleDismissAlert(alert.id)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-red-200/50 text-[#ef4444] transition-all"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </motion.div>
          ))}

          {/* Operational Reports List */}
          <div className="grid gap-8">
            {visibleReports.map((r, idx) => (
              <motion.div 
                key={r.id} 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-[2rem] sm:rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-white overflow-hidden flex flex-col md:flex-row"
              >
                {/* Image Section */}
                <div className="md:w-[200px] relative min-h-[200px] sm:min-h-0">
                  <img src={r.imageUrl} className="absolute inset-0 w-full h-full object-cover" alt="Incident" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6">
                    <span className="px-3 py-1.5 bg-[#10b981] rounded-xl text-[10px] font-black text-white uppercase tracking-widest">
                      {r.type === IncidentType.OTHER ? 'OTHER' : r.type}
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 p-6 sm:p-10 flex flex-col h-full bg-white">
                  <div className="flex justify-between items-start mb-4 sm:mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] shadow-[0_0_12px_#f59e0b]" />
                      <span className="text-[9px] sm:text-[11px] font-black text-[#94a3b8] uppercase tracking-[0.2em]">STATUS: {r.status}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[9px] sm:text-[11px] font-black text-[#cbd5e1] uppercase tracking-[0.1em]">
                        #{r.reportNumber || '0'}
                      </span>
                      {user.role === 'admin' && (
                        <button 
                          onClick={() => handleDeleteReport(r.id)} 
                          className="text-red-400 hover:text-red-500 transition-colors"
                          title="Delete Report"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </button>
                      )}
                    </div>
                  </div>

                  <h2 className="text-2xl sm:text-4xl font-black text-[#1e293b] mb-1 sm:mb-2 leading-tight">{r.location.address.split(',')[0]}</h2>
                  <p className="text-[#64748b] text-sm sm:text-lg font-bold italic mb-4 sm:mb-6 opacity-70 leading-relaxed">"{r.description}"</p>


                  {/* Resolution Proof (Visible to all) */}
                  {r.status === 'resolved' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mb-6 p-4 sm:p-5 bg-emerald-50 rounded-[1.5rem] border border-emerald-100"
                    >
                      <div className="flex items-center gap-2 sm:gap-3 mb-3">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M5 13l4 4L19 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                        <p className="text-[10px] sm:text-[11px] font-black text-emerald-800 uppercase tracking-widest">Resolution Verified by Authority</p>
                      </div>
                      <p className="text-emerald-900 text-xs sm:text-sm font-bold mb-3 sm:mb-4 leading-relaxed">{r.resolutionDetails}</p>
                      {r.resolvedImageUrl && (
                        <div className="mt-4">
                          <img 
                            src={r.resolvedImageUrl} 
                            className="w-full max-w-[240px] sm:max-w-[300px] h-32 sm:h-40 object-cover rounded-xl sm:rounded-2xl shadow-sm border border-emerald-200" 
                            alt="Resolution Evidence" 
                          />
                        </div>
                      )}
                    </motion.div>
                  )}

                  <div className="flex-1">
                    <p className="text-[10px] font-black text-[#cbd5e1] uppercase tracking-[0.2em] mb-6">Incident Timeline</p>
                    <div className="relative pl-10 space-y-10">
                      <div className="absolute left-1.5 top-2 bottom-2 w-0.5 bg-[#f1f5f9]" />
                      {r.timeline.map((event, i) => (
                        <div key={i} className="relative flex justify-between items-start group">
                          {/* Circle Indicator */}
                          <div className={`absolute -left-10 top-1 w-3.5 h-3.5 rounded-full bg-white border-2 z-10 transition-all ${
                            event.status === 'pending' ? 'border-[#f1f5f9]' : 'border-[#cbd5e1]'
                          }`} />
                          
                          <div>
                            <p className="text-[11px] font-black text-[#1e293b] uppercase tracking-[0.1em] mb-1.5">{event.status}</p>
                            <p className="text-[11px] font-bold text-[#64748b] opacity-80 leading-snug">{event.message}</p>
                            <p className="text-[9px] font-black text-[#94a3b8] uppercase tracking-widest mt-2">Actor: {event.actor}</p>
                          </div>

                          <div className="text-right">
                             <p className="text-[9px] font-black text-[#cbd5e1]">{new Date(event.timestamp).toLocaleDateString()}</p>
                             <p className="text-[9px] font-black text-[#cbd5e1]">{new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Resolution Form (Authorities only) */}
                  {user.role === 'authority' && resolvingId === r.id && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-8 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-200"
                    >
                      <h4 className="text-xl font-black text-slate-800 mb-6">Resolution Protocol</h4>
                      <textarea 
                        value={resolutionText}
                        onChange={(e) => setResolutionText(e.target.value)}
                        placeholder="Detail the field actions taken and the final environmental outcome..."
                        className="w-full bg-white border border-slate-200 rounded-2xl p-5 text-sm font-bold text-slate-900 outline-none min-h-[120px] mb-6 focus:border-[#10b981] transition-all"
                      />
                      
                      <div className="mb-8">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Photographic Proof (Required)</p>
                        <div className="flex items-center gap-4">
                          <label className="flex-1 cursor-pointer group">
                            <div className="w-full h-40 border-4 border-dashed border-slate-200 group-hover:border-[#10b981]/30 rounded-[2rem] flex flex-col items-center justify-center bg-white group-hover:bg-emerald-50 transition-all overflow-hidden relative">
                              {resolutionImage ? (
                                <img src={resolutionImage} className="w-full h-full object-cover" alt="Proof" />
                              ) : (
                                <>
                                  <svg className="w-10 h-10 text-slate-300 group-hover:text-emerald-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                  <span className="text-[10px] font-black text-slate-400 group-hover:text-emerald-600 uppercase tracking-widest">Select Evidence Image</span>
                                </>
                              )}
                            </div>
                            <input type="file" accept="image/*" className="hidden" onChange={handleResolutionFileChange} />
                          </label>
                          {resolutionImage && (
                            <button onClick={() => setResolutionImage(null)} className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-all">
                              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <button 
                          onClick={() => handleResolveSubmit(r.id)}
                          className="flex-1 py-4 bg-[#10b981] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-[#059669] shadow-xl shadow-emerald-900/10 transition-all">
                          Finalize Resolution
                        </button>
                        <button 
                          onClick={() => setResolvingId(null)}
                          className="px-8 py-4 bg-white border border-slate-200 text-slate-400 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Actions (Authorities only) */}
                  {user.role === 'authority' && r.assignedAuthorityId === user.organization && r.status !== 'resolved' && (
                    <div className="mt-12 flex gap-4">
                      {(r.status === 'assigned' || r.status === 'pending') && (
                        <button 
                          onClick={() => handleUpdateStatus(r.id, 'investigating', `${user.organization} has dispatched a field unit.`, user.name)}
                          className="px-8 py-3 bg-[#0f172a] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10"
                        >
                          Dispatch Response Unit
                        </button>
                      )}
                      {r.status === 'investigating' && resolvingId !== r.id && (
                        <button 
                          onClick={() => setResolvingId(r.id)}
                          className="px-8 py-3 bg-[#10b981] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#059669] transition-all"
                        >
                          Mark as Resolved
                        </button>
                      )}
                    </div>
                  )}

                  {/* Admin Command Controls */}
                  {user.role === 'admin' && r.status !== 'resolved' && r.status !== 'rejected' && (
                    <div className="mt-12 p-8 bg-indigo-50/50 rounded-[2.5rem] border border-indigo-100/50">
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-6">Central Command Assignment</p>
                      <div className="flex flex-wrap gap-3">
                        {AUTHORITIES.map(auth => (
                          <button 
                            key={auth} 
                            onClick={() => handleUpdateStatus(r.id, 'assigned', `Central Command assigned this anomaly to ${auth}.`, 'Admin', { assignedAuthorityId: auth })}
                            className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                              r.assignedAuthorityId === auth ? 
                              'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 
                              'bg-white text-indigo-400 border border-indigo-100 hover:bg-indigo-50'
                            }`}
                          >
                            {auth}
                          </button>
                        ))}
                        <button 
                          onClick={() => handleUpdateStatus(r.id, 'rejected', `Report dismissed by Central Command: Invalid or Duplicated data.`, 'Admin')}
                          className="px-5 py-2.5 bg-red-50 text-red-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-100 transition-all border border-red-100"
                        >
                          Reject Anomalous Data
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Floating Action Buttons */}
          <div className="fixed bottom-10 right-10 flex flex-col gap-4 z-[100]">

            <motion.button 
              whileHover={{ scale: 1.1, y: -5 }}
              className="w-16 h-16 bg-[#059669] text-white rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-500/40"
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.button>
          </div>
        </motion.div>
      )}

      {activeTab === 'analytics' && <EnvironmentalAnalytics />}
      {activeTab === 'notes' && <Resources user={user} />}
      {activeTab === 'leaderboard' && (user.role === 'admin' ? (
        <AdminDashboard 
          reports={reports} 
          alerts={alerts} 
          authorities={AUTHORITIES}
          onBroadcastAlert={() => setIsAlertModalOpen(true)} 
        />
      ) : user.role === 'authority' ? (
        <SystemInsights />
      ) : (
        <Leaderboard currentUser={user} />
      ))}

      {activeTab === 'database' && user.role === 'admin' && <DatabaseViewer />}

      {isAlertModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] p-10 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-2xl font-black text-slate-900 mb-6">Broadcast Emergency Alert</h3>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Alert Title</label>
                <input 
                  type="text" 
                  value={newAlert.title}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none"
                  placeholder="e.g. Severe Storm Warning"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Severity Level</label>
                <div className="flex gap-2">
                  {(['info', 'warning', 'critical'] as Alert['severity'][]).map(s => (
                    <button 
                      key={s}
                      onClick={() => setNewAlert(prev => ({ ...prev, severity: s }))}
                      className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${
                        newAlert.severity === s ? 
                        (s === 'critical' ? 'bg-red-600 border-red-600 text-white' : 
                         s === 'warning' ? 'bg-amber-600 border-amber-600 text-white' : 
                         'bg-indigo-600 border-indigo-600 text-white') : 
                        'bg-white border-slate-200 text-slate-400'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Detailed Message</label>
                <textarea 
                  value={newAlert.message}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none min-h-[100px]"
                  placeholder="Provide clear instructions for field units..."
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  onClick={handleBroadcastAlert}
                  className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all"
                >
                  Transmit Alert
                </button>
                <button 
                  onClick={() => setIsAlertModalOpen(false)}
                  className="px-8 py-4 border border-slate-200 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {user && <ChatSentinel user={user} />}

      <Toaster position="top-right" />

      {/* Points Notification */}
      <AnimatePresence>
        {pointsNotification && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-24 right-6 z-[200] bg-indigo-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-indigo-400/30"
          >
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-black text-lg">
              +{pointsNotification.amount}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Points Earned</p>
              <p className="text-sm font-black">{pointsNotification.type}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </Layout>
  );
};

export default App;