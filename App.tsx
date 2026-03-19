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
import IntercomChat from './components/IntercomChat.tsx';
import EnvironmentalAnalytics from './components/EnvironmentalAnalytics.tsx';
import { User, Report, Severity, IncidentType, ReportStatus, TimelineEvent, Alert } from './types.ts';

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
  },
  {
    id: 'A-002',
    title: 'System Maintenance',
    message: 'EcoGuardian sentinel network will undergo maintenance at 02:00 UTC.',
    severity: 'info',
    timestamp: new Date(Date.now() - 3600000),
    isRead: true
  }
];

const INITIAL_REPORTS: Report[] = [
  {
    id: 'R-902',
    type: IncidentType.ILLEGAL_LOGGING,
    severity: Severity.HIGH,
    description: 'Fresh tree stumps and heavy tire marks detected in the protected buffer zone.',
    location: { lat: 45.523, lng: -122.676, address: "Northern Ridge Biosphere, Sector 7" },
    timestamp: new Date(Date.now() - 7200000),
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800',
    status: 'assigned',
    reporterId: 'user-001',
    assignedAuthorityId: 'Forestry Commission',
    aiInsights: 'Vision analysis confirms recent logging activity in a restricted zone.',
    timeline: [
      { status: 'pending', timestamp: new Date(Date.now() - 7200000), message: 'Incident reported by Sentinel.', actor: 'John Sentinel' },
      { status: 'assigned', timestamp: new Date(Date.now() - 3600000), message: 'Admin assigned case to Forestry Commission.', actor: 'Chief Warden' }
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
        setReports(data);
      } catch (err) {
        console.error("Failed to fetch reports:", err);
        // Fallback to initial data if DB fails
        setReports(INITIAL_REPORTS);
      }
    };

    fetchReports();

    // Listen for Real-time Updates
    socket.on('newReport', (newReport: Report) => {
      setReports(prev => [newReport, ...prev]);
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
      setReports(prev => prev.map(r => r._id === updatedReport._id || r.id === updatedReport.id ? updatedReport : r));
      
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

  const handleAuthSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    setIsAuthenticated(true);
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
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
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
      toast.success("Environmental Report Lodged.");
    } catch (err) {
      console.error("Error creating report:", err);
      toast.error("Database connection failure. Saving locally.");
      const fallbackReport = { 
        ...reportData, 
        id: `R-${Date.now()}`,
        status: 'pending',
        timestamp: new Date(),
        timeline: [{ status: 'pending', timestamp: new Date(), message: 'Offline Mode: Local Cache', actor: 'Local System' }]
      } as Report;
      setReports([fallbackReport, ...reports]);
      setActiveTab('reports');
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
        headers: { 'Content-Type': 'application/json' },
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
    if (user.role === 'admin' || user.role === 'authority') return reports;
    return reports.filter(r => r.reporterId === user.id);
  }, [reports, user]);

  if (!isAuthenticated || !user) return <Login onLoginSuccess={handleAuthSuccess} />;

  return (
    <Layout user={user} onLogout={() => setIsAuthenticated(false)} activeTab={activeTab} setActiveTab={setActiveTab}>
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
          className="space-y-4 sm:space-y-6"
        >
          <div className="bg-slate-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-2xl">
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">Operational Feed</h2>
              <p className="text-slate-400 text-[10px] sm:text-xs font-medium">Monitoring {visibleReports.length} active anomalies in your sector.</p>
            </div>
            {user.role === 'authority' && (
              <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                <div className="flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 bg-white/5 rounded-lg sm:rounded-xl border border-white/10 text-center">
                  <p className="text-[6px] sm:text-[7px] font-black text-emerald-400 uppercase tracking-widest mb-0.5 sm:mb-1">Resolved</p>
                  <p className="text-base sm:text-lg font-black">{reports.filter(r => r.status === 'resolved' && r.assignedAuthorityId === user.organization).length}</p>
                </div>
                <div className="flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 bg-white/5 rounded-lg sm:rounded-xl border border-white/10 text-center">
                  <p className="text-[6px] sm:text-[7px] font-black text-amber-400 uppercase tracking-widest mb-0.5 sm:mb-1">Active</p>
                  <p className="text-base sm:text-lg font-black">{reports.filter(r => ['assigned', 'investigating'].includes(r.status) && r.assignedAuthorityId === user.organization).length}</p>
                </div>
              </div>
            )}
            <div className="hidden sm:block px-4 py-1.5 bg-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest border border-white/10">
              Grid Secure
            </div>
            {user.role === 'admin' && (
              <button 
                onClick={() => setIsAlertModalOpen(true)}
                className="w-full sm:w-auto px-5 py-2 bg-red-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-900/20"
              >
                Broadcast Alert
              </button>
            )}
          </div>

          {user.role === 'authority' && alerts.filter(a => !a.isRead).length > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-4 overflow-hidden"
            >
              {alerts.filter(a => !a.isRead).map(alert => (
                <div 
                  key={alert.id} 
                  className={`p-6 rounded-[2rem] border flex items-start justify-between gap-6 ${
                    alert.severity === 'critical' ? 'bg-red-50 border-red-100' : 
                    alert.severity === 'warning' ? 'bg-amber-50 border-amber-100' : 
                    'bg-indigo-50 border-indigo-100'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                      alert.severity === 'critical' ? 'bg-red-600 text-white' : 
                      alert.severity === 'warning' ? 'bg-amber-600 text-white' : 
                      'bg-indigo-600 text-white'
                    }`}>
                      {alert.severity === 'critical' ? (
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      ) : (
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      )}
                    </div>
                    <div>
                      <h4 className={`font-black text-lg ${
                        alert.severity === 'critical' ? 'text-red-900' : 
                        alert.severity === 'warning' ? 'text-amber-900' : 
                        'text-indigo-900'
                      }`}>
                        {alert.title}
                      </h4>
                      <p className={`text-sm font-medium leading-relaxed ${
                        alert.severity === 'critical' ? 'text-red-700' : 
                        alert.severity === 'warning' ? 'text-amber-700' : 
                        'text-indigo-700'
                      }`}>
                        {alert.message}
                      </p>
                      <p className="text-[9px] font-black uppercase tracking-widest mt-2 opacity-50">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDismissAlert(alert.id)}
                    className={`p-2 rounded-xl transition-all ${
                      alert.severity === 'critical' ? 'hover:bg-red-100 text-red-400' : 
                      alert.severity === 'warning' ? 'hover:bg-amber-100 text-amber-400' : 
                      'hover:bg-indigo-100 text-indigo-400'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                </div>
              ))}
            </motion.div>
          )}

          <div className="grid gap-6">
            {visibleReports.length === 0 && (
              <div className="text-center py-12 bg-slate-100 rounded-3xl border border-dashed border-slate-300">
                <p className="font-black text-slate-400 uppercase tracking-widest text-xs">No reports found.</p>
              </div>
            )}
            {visibleReports.map((r, idx) => (
              <motion.div 
                key={r.id} 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: idx * 0.1, type: "spring", stiffness: 300, damping: 24 }}
                className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col md:flex-row group hover:shadow-2xl hover:border-indigo-100 transition-shadow"
              >
                <div className="md:w-1/4 h-48 md:h-auto relative">
                  <img src={r.imageUrl} className="w-full h-full object-cover" alt="Incident" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <span className="px-2 py-1 bg-emerald-500 rounded text-[9px] font-black text-white uppercase tracking-widest">
                      {r.type}
                    </span>
                  </div>
                </div>
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full animate-pulse ${r.status === 'resolved' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Status: {r.status}</span>
                      </div>
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">#{r.id}</span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">{r.location.address}</h3>
                    <p className="text-slate-500 text-sm font-medium italic mb-4 leading-relaxed">"{r.description}"</p>
                    {r.aiInsights && (
                      <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                         <p className="text-[8px] font-black text-indigo-600 uppercase tracking-widest mb-1">Sentinel Insight</p>
                         <p className="text-[10px] font-bold text-indigo-900">{r.aiInsights}</p>
                      </div>
                    )}

                    {r.resolutionDetails && (
                      <div className="mt-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                        <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-2">Resolution Report</p>
                        <p className="text-xs font-bold text-slate-800 mb-3 leading-relaxed">{r.resolutionDetails}</p>
                        {r.resolvedImageUrl && (
                          <div className="mt-3">
                            <p className="text-[8px] font-black text-emerald-400 uppercase tracking-widest mb-1">Evidence of Resolution</p>
                            <img src={r.resolvedImageUrl} className="w-full max-h-48 object-cover rounded-xl border border-emerald-200 shadow-lg" alt="Resolution Proof" />
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-6 space-y-4">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Incident Timeline</p>
                      <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-1 before:bottom-1 before:w-0.5 before:bg-slate-100">
                        {r.timeline.map((event, i) => (
                          <div key={i} className="relative">
                            <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-white border-2 border-slate-100 z-10" />
                            <div className="flex justify-between items-start mb-1">
                              <p className="text-[9px] font-black text-slate-900 uppercase tracking-widest">{event.status}</p>
                              <p className="text-[7px] font-bold text-slate-300">{new Date(event.timestamp).toLocaleString()}</p>
                            </div>
                            <p className="text-[10px] font-bold text-slate-500 mb-1">{event.message}</p>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Actor: {event.actor}</p>
                            {event.proofUrl && (
                              <div className="mt-2">
                                <img src={event.proofUrl} className="w-16 h-16 object-cover rounded-lg border border-slate-200 shadow-sm" alt="Event Proof" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {user.role === 'authority' && r.assignedAuthorityId === user.organization && (
                      <div className="mt-6 space-y-4">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Internal Warden Notes</p>
                          <div className="space-y-2 mb-3">
                            {r.internalNotes?.map((note, i) => (
                              <p key={i} className="text-[10px] font-bold text-slate-600 bg-white p-2 rounded-lg border border-slate-100">{note}</p>
                            ))}
                            {(!r.internalNotes || r.internalNotes.length === 0) && <p className="text-[10px] italic text-slate-400">No internal notes yet.</p>}
                          </div>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                              placeholder="Add a warden note..." 
                              className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-bold outline-none"
                            />
                            <button 
                              onClick={() => handleAddNote(r.id)}
                              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest">
                              Add
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-50">
                    {user.role === 'admin' && r.status !== 'resolved' && r.status !== 'rejected' && (
                      <div className="space-y-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Admin Command Controls</p>
                        <div className="flex flex-wrap gap-2">
                          {AUTHORITIES.map(auth => (
                            <button key={auth} 
                              onClick={() => handleUpdateStatus(r.id, 'assigned', `Admin reassigned report to ${auth}.`, 'Admin', { assignedAuthorityId: auth })}
                              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                r.assignedAuthorityId === auth ? 'bg-indigo-900 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                              }`}>
                              {r.assignedAuthorityId === auth ? 'Assigned to ' : 'Assign '} {auth}
                            </button>
                          ))}
                          <button 
                            onClick={() => handleUpdateStatus(r.id, 'rejected', `Admin rejected the report as invalid.`, 'Admin')}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-700">
                            Reject Report
                          </button>
                        </div>
                      </div>
                    )}

                    {user.role === 'authority' && r.assignedAuthorityId === user.organization && (
                      <div className="space-y-4">
                        {resolvingId === r.id ? (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 overflow-hidden"
                          >
                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-3">Resolution Protocol</p>
                            <textarea 
                              value={resolutionText}
                              onChange={(e) => setResolutionText(e.target.value)}
                              placeholder="Describe the actions taken and final outcome..."
                              className="w-full bg-white border border-emerald-200 rounded-xl p-4 text-xs font-bold text-slate-900 outline-none min-h-[100px] mb-4"
                            />
                            
                            <div className="mb-4">
                              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Attach Proof (Image)</p>
                              <div className="flex items-center gap-4">
                                <label className="flex-1 cursor-pointer">
                                  <div className="w-full h-32 border-2 border-dashed border-emerald-200 rounded-xl flex flex-col items-center justify-center bg-white hover:bg-emerald-50 transition-all">
                                    {resolutionImage ? (
                                      <img src={resolutionImage} className="w-full h-full object-cover rounded-lg" alt="Proof" />
                                    ) : (
                                      <>
                                        <svg className="w-8 h-8 text-emerald-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                        <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Upload Evidence</span>
                                      </>
                                    )}
                                  </div>
                                  <input type="file" accept="image/*" className="hidden" onChange={handleResolutionFileChange} />
                                </label>
                                {resolutionImage && (
                                  <button onClick={() => setResolutionImage(null)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="flex gap-3">
                              <button 
                                onClick={() => handleResolveSubmit(r.id)}
                                className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700">
                                Confirm Resolution
                              </button>
                              <button 
                                onClick={() => setResolvingId(null)}
                                className="px-6 py-3 border border-emerald-200 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                Cancel
                              </button>
                            </div>
                          </motion.div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {r.status === 'assigned' && (
                              <>
                                <button 
                                  onClick={() => handleUpdateStatus(r.id, 'investigating', `${user.organization} has dispatched a field unit.`, user.name)}
                                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700">
                                  Dispatch Unit
                                </button>
                                <button 
                                  onClick={() => handleUpdateStatus(r.id, 'investigating', `${user.organization} has started an investigation.`, user.name)}
                                  className="px-4 py-2 bg-amber-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-amber-700">
                                  Start Investigation
                                </button>
                              </>
                            )}
                            {r.status === 'investigating' && (
                              <button 
                                onClick={() => setResolvingId(r.id)}
                                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700">
                                Resolve Incident
                              </button>
                            )}
                            {['assigned', 'investigating'].includes(r.status) && (
                              <button 
                                onClick={() => handleUpdateStatus(r.id, 'rejected', `${user.organization} rejected the report as invalid.`, user.name)}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-700">
                                Reject
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
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
      ) : (
        <SystemInsights />
      ))}

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

      <ChatSentinel user={user} />
      <IntercomChat user={user} />
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