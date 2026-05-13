
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Database, User as UserIcon, FileText, Activity, Search, RefreshCw, Bell, Code, Trash2, BrainCircuit } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAuthHeader } from '../services/authService.ts';
import { checkReportAuthenticity } from '../services/geminiService.ts';
const DatabaseViewer: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'users' | 'reports' | 'alerts'>('reports');
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [verifyingId, setVerifyingId] = useState<string | null>(null);
    const [verifyingAll, setVerifyingAll] = useState(false);
    const [verifications, setVerifications] = useState<Record<string, { isReal: boolean; confidence: number; analysis: string }>>({});
    const [search, setSearch] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            let endpoint = '/api/reports';
            if (activeTab === 'users') endpoint = '/api/users';
            if (activeTab === 'alerts') endpoint = '/api/alerts';
            const response = await fetch(`http://localhost:5000${endpoint}`, {
                headers: { ...getAuthHeader() }
            });
            const result = await response.json();
            const rawArray = Array.isArray(result) ? result : [result];
            
            if (activeTab === 'reports' && rawArray.length > 0) {
                // Same safety net as App.tsx
                const sanitized = rawArray.map((r: any, idx: number) => ({
                    ...r,
                    reportNumber: r.reportNumber || (rawArray.length - idx)
                }));
                setData(sanitized);
            } else {
                setData(rawArray);
            }
        } catch (error) {
            console.error('Error fetching database data:', error);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to permanently delete this record?')) return;
        
        try {
            let endpoint = '/api/reports';
            if (activeTab === 'users') endpoint = '/api/users';
            if (activeTab === 'alerts') endpoint = '/api/alerts';

            const response = await fetch(`http://localhost:5000${endpoint}/${id}`, {
                method: 'DELETE',
                headers: { ...getAuthHeader() }
            });

            if (response.ok) {
                toast.success('Record purged from Sentinel storage.');
                fetchData();
            } else {
                throw new Error('Deletion failed');
            }
        } catch (error) {
            console.error('Error deleting record:', error);
            toast.error('Failed to delete record.');
        }
    };

    const handleVerifyAI = async (report: any) => {
        const rid = report.id || report._id;
        setVerifyingId(rid);
        toast.loading('Neural Network scanning report...', { id: `ai-verify-${rid}` });
        try {
            const result = await checkReportAuthenticity(report) as any;
            setVerifications(prev => ({ ...prev, [rid]: result }));
            if (result.isReal) {
                toast.success(
                    <div className="flex flex-col gap-0.5"><b>✅ REAL — {result.confidence}% confidence</b><span className="text-xs opacity-80">{result.analysis}</span></div>,
                    { id: `ai-verify-${rid}`, duration: 5000 }
                );
            } else {
                toast.error(
                    <div className="flex flex-col gap-0.5"><b>⚠️ FAKE — {result.confidence}% confidence</b><span className="text-xs opacity-80">{result.analysis}</span></div>,
                    { id: `ai-verify-${rid}`, duration: 6000 }
                );
            }
        } catch {
            toast.error('AI verification failed.', { id: `ai-verify-${rid}` });
        } finally {
            setVerifyingId(null);
        }
    };

    const handleVerifyAll = async () => {
        const reports = filteredData.filter(item => !verifications[item.id || item._id]);
        if (!reports.length) { toast('All visible reports already scanned.'); return; }
        setVerifyingAll(true);
        toast.loading(`Scanning ${reports.length} reports...`, { id: 'verify-all' });
        let real = 0; let fake = 0;
        for (const report of reports) {
            const rid = report.id || report._id;
            setVerifyingId(rid);
            try {
                const result = await checkReportAuthenticity(report) as any;
                setVerifications(prev => ({ ...prev, [rid]: result }));
                result.isReal ? real++ : fake++;
            } catch { /* skip */ }
        }
        setVerifyingId(null);
        setVerifyingAll(false);
        toast.success(<div className="flex flex-col gap-0.5"><b>Bulk Scan Complete</b><span className="text-xs">{real} real · {fake} flagged as fake</span></div>, { id: 'verify-all', duration: 6000 });
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const filteredData = data.filter(item => 
        JSON.stringify(item).toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
            <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                        <Database className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-800">Database Explorer</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Sentinel Storage</p>
                    </div>
                </div>

                <div className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto max-w-full">
                    {[
                        { id: 'reports', label: 'Reports', icon: <FileText className="w-3.5 h-3.5" />, color: 'text-indigo-600' },
                        { id: 'users', label: 'Users', icon: <UserIcon className="w-3.5 h-3.5" />, color: 'text-emerald-600' },
                        { id: 'alerts', label: 'Alerts', icon: <Bell className="w-3.5 h-3.5" />, color: 'text-red-600' }
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black transition-all whitespace-nowrap ${activeTab === tab.id ? `bg-white ${tab.color} shadow-sm` : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-6 bg-slate-50/50 flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        type="text"
                        placeholder="Search records..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                    />
                </div>
                {activeTab === 'reports' && (
                    <button
                        onClick={handleVerifyAll}
                        disabled={verifyingAll}
                        className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-xl text-xs font-black transition-colors"
                    >
                        <BrainCircuit className={`w-4 h-4 ${verifyingAll ? 'animate-pulse' : ''}`} />
                        {verifyingAll ? 'Scanning...' : 'Verify All Reports'}
                    </button>
                )}
                <button 
                    onClick={fetchData}
                    className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="flex-1 overflow-x-auto">
                {loading ? (
                    <div className="h-full flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : filteredData.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center py-20 text-center">
                        <Activity className="w-12 h-12 text-slate-200 mb-4" />
                        <p className="text-slate-400 font-bold">No records found matching your query.</p>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                {activeTab === 'reports' ? (
                                    <>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Severity</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ref #</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest"><span className="flex items-center gap-1"><BrainCircuit className="w-3 h-3" />AI Verdict</span></th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                    </>
                                ) : activeTab === 'users' ? (
                                    <>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">User</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Points</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Organization</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                    </>
                                ) : (
                                    <>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Title</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Message</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Severity</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((item) => (
                                <tr key={item.id || item._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                    {activeTab === 'reports' ? (
                                        <>
                                            <td className="px-6 py-4 font-bold text-slate-700 text-sm">{item.type}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                                    item.severity === 'critical' || item.severity === 'High' ? 'bg-red-50 text-red-600' :
                                                    item.severity === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                                                }`}>
                                                    {item.severity}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                                    item.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' :
                                                    item.status === 'assigned' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-[10px] font-medium text-slate-500 max-w-[200px] truncate">{item.location?.address}</td>
                                            <td className="px-6 py-4 text-[10px] font-black text-slate-900 uppercase">
                                                #{item.reportNumber || '0'}
                                            </td>
                                            <td className="px-6 py-4">
                                                {(() => {
                                                    const rid = item.id || item._id;
                                                    const v = verifications[rid];
                                                    if (verifyingId === rid) return <span className="flex items-center gap-1 text-[9px] font-black text-indigo-500 animate-pulse"><BrainCircuit className="w-3 h-3" />Scanning…</span>;
                                                    if (!v) return <span className="text-[9px] text-slate-300 font-bold">—</span>;
                                                    return v.isReal
                                                        ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100">✅ REAL · {v.confidence}%</span>
                                                        : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-red-50 text-red-600 border border-red-100">⚠️ FAKE · {v.confidence}%</span>;
                                                })()}
                                            </td>
                                        </>
                                    ) : activeTab === 'users' ? (
                                        <>
                                            <td className="px-6 py-4 flex items-center gap-3">
                                                <img src={item.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.name}`} className="w-7 h-7 rounded-full bg-slate-100" alt="" />
                                                <span className="font-bold text-slate-700 text-sm">{item.name}</span>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-semibold text-slate-500">{item.email}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${
                                                    item.role === 'admin' ? 'bg-slate-900 text-white' :
                                                    item.role === 'authority' ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-700'
                                                }`}>
                                                    {item.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-black text-slate-900 text-xs">{item.points || 0}</td>
                                            <td className="px-6 py-4 text-[10px] font-bold text-slate-400">{item.organization || '—'}</td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="px-6 py-4 font-bold text-slate-800 text-sm">{item.title}</td>
                                            <td className="px-6 py-4 text-xs text-slate-500 max-w-[300px]">{item.message}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                                    item.severity === 'critical' ? 'bg-red-500 text-white' : 
                                                    item.severity === 'warning' ? 'bg-amber-500 text-white' : 'bg-indigo-500 text-white'
                                                }`}>
                                                    {item.severity}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-[10px] font-bold text-slate-400">{new Date(item.timestamp).toLocaleString()}</td>
                                        </>
                                    )}
                                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                        {activeTab === 'reports' && (
                                            <button 
                                                onClick={() => handleVerifyAI(item)}
                                                disabled={verifyingId === (item.id || item._id)}
                                                className={`p-2 rounded-lg transition-all ${verifyingId === (item.id || item._id) ? 'text-indigo-400 bg-indigo-50 animate-pulse' : 'text-indigo-600 hover:bg-indigo-50'}`}
                                                title="Verify with Neural Network"
                                            >
                                                <BrainCircuit className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => handleDelete(item.id || item._id)}
                                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                            title="Delete Record"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span>Total records: {filteredData.length}</span>
                <span className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Live connection active
                </span>
            </div>
        </div>
    );
};

export default DatabaseViewer;
