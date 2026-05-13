
import React, { useMemo, useState } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  AreaChart, Area
} from 'recharts';
import { Shield, Activity, TreePine, Bird, Wind, Download, CheckCircle2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const POPULATION_DATA = [
  { year: '2020', wolves: 45, deer: 450, eagles: 12 },
  { year: '2021', wolves: 52, deer: 420, eagles: 15 },
  { year: '2022', wolves: 48, deer: 480, eagles: 18 },
  { year: '2023', wolves: 60, deer: 510, eagles: 22 },
  { year: '2024', wolves: 65, deer: 490, eagles: 25 },
  { year: '2025', wolves: 72, deer: 530, eagles: 31 },
  { year: '2026', wolves: 78, deer: 515, eagles: 34 },
  { year: '2027*', wolves: 84, deer: 540, eagles: 38 },
  { year: '2028*', wolves: 90, deer: 525, eagles: 42 },
  { year: '2029*', wolves: 95, deer: 550, eagles: 45 },
  { year: '2030*', wolves: 102, deer: 535, eagles: 50 },
];

const PREDICTIVE_INSIGHTS = [
  { metric: 'Reforestation Rate', current: '1.2%', forecast: '2.5%', confidence: 92 },
  { metric: 'Species Recovery', current: '42', forecast: '68', confidence: 85 },
  { metric: 'Pollution Reduction', current: '15%', forecast: '35%', confidence: 89 },
  { metric: 'Habitat Connectivity', current: '68%', forecast: '82%', confidence: 94 },
];

const HABITAT_HEALTH = [
  { region: 'North', health: 85, biodiversity: 78 },
  { region: 'South', health: 62, biodiversity: 55 },
  { region: 'East', health: 92, biodiversity: 88 },
  { region: 'West', health: 74, biodiversity: 70 },
  { region: 'Central', health: 58, biodiversity: 42 },
];

const INCIDENT_TYPES = [
  { name: 'Logging', value: 400, color: '#ef4444' },
  { name: 'Poaching', value: 300, color: '#f59e0b' },
  { name: 'Pollution', value: 300, color: '#3b82f6' },
  { name: 'Wildfire', value: 200, color: '#f97316' },
];

const AIR_QUALITY = [
  { time: '00:00', aqi: 42 },
  { time: '04:00', aqi: 38 },
  { time: '04:39', aqi: 40, current: true },
  { time: '08:00', aqi: 55 },
  { time: '12:00', aqi: 68 },
  { time: '16:00', aqi: 62 },
  { time: '20:00', aqi: 48 },
];

const EnvironmentalAnalytics: React.FC = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    
    try {
      const doc = new jsPDF();
      const timestamp = new Date().toLocaleString();
      
      // Header
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text("EcoGuardian Intelligence Report", 15, 20);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${timestamp}`, 15, 30);
      doc.text("Biosphere Forecast 2026-2030", 160, 30);

      // Section: Predictive Insights
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(16);
      doc.text("Predictive Insights (2026-2030)", 15, 55);
      
      autoTable(doc, {
        startY: 60,
        head: [['Metric', 'Current Status', '2030 Forecast', 'Confidence']],
        body: PREDICTIVE_INSIGHTS.map(i => [i.metric, i.current, i.forecast, `${i.confidence}%`]),
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129] }, // emerald-500
      });

      // Section: Habitat Health
      doc.text("Regional Habitat Health Index", 15, (doc as any).lastAutoTable.finalY + 15);
      
      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 20,
        head: [['Region', 'Health Score', 'Biodiversity Index']],
        body: HABITAT_HEALTH.map(h => [h.region, `${h.health}/100`, `${h.biodiversity}/100`]),
        theme: 'grid',
        headStyles: { fillColor: [99, 102, 241] }, // indigo-500
      });

      // Summary
      const finalY = (doc as any).lastAutoTable.finalY + 20;
      doc.setFillColor(248, 250, 252); // slate-50
      doc.rect(15, finalY, 180, 30, 'F');
      doc.setDrawColor(16, 185, 129);
      doc.rect(15, finalY, 180, 30, 'S');
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'italic');
      const splitText = doc.splitTextToSize("The current trajectory suggests a 24% increase in biodiversity stability if current conservation protocols are maintained.", 170);
      doc.text(splitText, 20, finalY + 12);

      // Footer
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text("Confidential Environmental Intelligence Data • EcoGuardian Network", 105, 285, { align: 'center' });

      doc.save(`EcoGuardian_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setIsDownloading(false);
    }
  };

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
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="bg-slate-900 p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Live Network Feed</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black mb-2 tracking-tight">Nature's Vital Signs</h2>
            <p className="text-slate-400 text-sm font-medium max-w-2xl leading-relaxed">
              Real-time tracking of our forests and wildlife to protect the future of our planet.
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wildlife Trends */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-[2.5rem] border border-slate-100 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
              <Bird size={20} />
            </div>
            <div className="flex flex-col">
              <h3 className="text-xl font-black text-slate-900">Wildlife Population Trends</h3>
              <div className="flex items-center gap-1.5">
                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Live Updates Enabled</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={POPULATION_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" />
                <Line type="monotone" dataKey="wolves" stroke="#10b981" strokeWidth={4} dot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="deer" stroke="#3b82f6" strokeWidth={4} dot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="eagles" stroke="#f59e0b" strokeWidth={4} dot={{ r: 6, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Habitat Health */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-[2.5rem] border border-slate-100 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
              <TreePine size={20} />
            </div>
            <div className="flex flex-col">
              <h3 className="text-xl font-black text-slate-900">Habitat Health Index</h3>
              <div className="flex items-center gap-1.5">
                <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Regional Sync Active</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={HABITAT_HEALTH}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="region" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" />
                <Bar dataKey="health" fill="#10b981" radius={[6, 6, 0, 0]} barSize={30} />
                <Bar dataKey="biodiversity" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Incident Distribution */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-[2.5rem] border border-slate-100 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-600">
              <Shield size={20} />
            </div>
            <div className="flex flex-col">
              <h3 className="text-xl font-black text-slate-900">Incident Distribution</h3>
              <div className="flex items-center gap-1.5">
                <span className="flex h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-600">Sentinel Alert Feed</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={INCIDENT_TYPES}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {INCIDENT_TYPES.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Air Quality */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-[2.5rem] border border-slate-100 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
              <Wind size={20} />
            </div>
            <div className="flex flex-col">
              <h3 className="text-xl font-black text-slate-900">Air Quality Index (AQI)</h3>
              <div className="flex items-center gap-1.5">
                <span className="flex h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Atmospheric Sensor Sync</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={AIR_QUALITY}>
                <defs>
                  <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="aqi" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorAqi)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      {/* Summary Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Forest Cover', value: '64.2%', change: '+1.2%', icon: TreePine, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Species Count', value: '1,242', change: '+42', icon: Bird, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Active Patrols', value: '24', change: 'Live', icon: Shield, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Network Health', value: '99.9%', change: 'Stable', icon: Activity, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
              <stat.icon size={20} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-black text-slate-900">{stat.value}</p>
              <span className="text-[10px] font-bold text-emerald-500">{stat.change}</span>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Predictive Forecast Section */}
      <motion.div variants={itemVariants} className="bg-slate-900 rounded-[2.5rem] p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full -ml-40 -mb-40 blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-emerald-400 border border-white/10">
              <Activity size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tight">Biosphere Forecast 2026-2030</h3>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Neural Network Projections</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {PREDICTIVE_INSIGHTS.map((insight, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl hover:bg-white/10 transition-all">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{insight.metric}</p>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Current</p>
                    <p className="text-xl font-black">{insight.current}</p>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div className="text-right">
                    <p className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">2030 Forecast</p>
                    <p className="text-xl font-black text-emerald-400">{insight.forecast}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[8px] font-black uppercase tracking-widest">
                    <span className="text-slate-500">Confidence Score</span>
                    <span className="text-emerald-500">{insight.confidence}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all duration-1000" 
                      style={{ width: `${insight.confidence}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-10 p-6 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center animate-pulse">
                <Shield size={20} className="text-white" />
              </div>
              <p className="text-sm font-bold text-emerald-100 italic">
                "The current trajectory suggests a 24% increase in biodiversity stability if current conservation protocols are maintained."
              </p>
            </div>
            <button 
              onClick={handleDownload}
              disabled={isDownloading}
              className="px-6 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-950/40 whitespace-nowrap flex items-center gap-2 disabled:opacity-70"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download Full Projection
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-10 left-1/2 z-50 bg-slate-900 border border-emerald-500/30 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3"
          >
            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-black text-xs uppercase tracking-widest">Report Ready</p>
              <p className="text-[10px] text-slate-400 font-bold">PDF Intelligence report has been downloaded.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default EnvironmentalAnalytics;
