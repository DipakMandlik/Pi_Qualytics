import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Zap, 
  Layers, 
  Activity, 
  ChevronRight, 
  ArrowUpRight,
  Clock,
  Database,
  Search,
  PieChart as PieIcon,
  BarChart2,
  AlertTriangle,
  Lightbulb,
  // Fix: Import Radar icon from lucide-react and alias it to avoid naming conflict with Recharts' Radar component
  Radar as RadarIcon
} from 'lucide-react';
import { DashboardCard } from '../components/DashboardCard';
import { COLORS } from '../constants';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  AreaChart, Area
} from 'recharts';

const radarData = [
  { subject: 'Completeness', A: 120, fullMark: 150 },
  { subject: 'Uniqueness', A: 98, fullMark: 150 },
  { subject: 'Validity', A: 86, fullMark: 150 },
  { subject: 'Consistency', A: 99, fullMark: 150 },
  { subject: 'Timeliness', A: 85, fullMark: 150 },
];

const distributionData = [
  { name: 'Null', value: 12 },
  { name: 'Invalid', value: 8 },
  { name: 'Duplicate', value: 5 },
  { name: 'Valid', value: 75 },
];

export const TableAnalysisView: React.FC = () => {
  const [selectedTable, setSelectedTable] = useState('STG_CUSTOMER');
  const [selectedPane, setSelectedPane] = useState<'PROFILE' | 'STATISTICS' | 'LINEAGE'>('PROFILE');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-sky-50 p-3 rounded-2xl text-sky-600 shadow-sm border border-sky-100">
            <Database size={24} />
          </div>
          <div>
            <select 
              className="bg-transparent border-none text-2xl font-black text-slate-800 outline-none focus:ring-0 cursor-pointer hover:text-sky-600 transition-colors"
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
            >
              <option value="STG_CUSTOMER">STG_CUSTOMER (BANKING_DW)</option>
              <option value="STG_ACCOUNT">STG_ACCOUNT (BANKING_DW)</option>
              <option value="STG_TXN">STG_TRANSACTION (BANKING_DW)</option>
            </select>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Real-time Asset Diagnostics</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <button className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2">
             <Layers size={16} /> View Lineage
           </button>
           <button className="px-5 py-2.5 bg-sky-500 text-white font-bold rounded-xl shadow-lg shadow-sky-100 hover:scale-105 transition-all flex items-center gap-2">
             <Activity size={18} /> Trigger Profiler
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard 
          id="table_health_score"
          label="Health Score"
          value="92.4%"
          trend={2.1}
          status="success"
          icon={<ShieldCheck size={24} />}
          description="Composite score derived from all DQ dimensions applied to this table."
          subtext="Profiled 5 mins ago"
        />
        <DashboardCard 
          id="table_impact_factor"
          label="Impact Factor"
          value="Critical"
          status="error"
          icon={<Zap size={24} />}
          description="Measures the dependency of downstream Snowflake jobs and dashboards on this table."
          subtext="Used in 14 production jobs"
        />
        <DashboardCard 
          id="table_credits_consumed"
          label="Resource Usage"
          value="4.23 Cr"
          trend={-5}
          status="info"
          icon={<BarChart2 size={24} />}
          description="Total Snowflake compute credits consumed by DQ processes for this asset."
          subtext="Daily average optimization"
        />
        <DashboardCard 
          id="table_freshness"
          label="Data Freshness"
          value="12m ago"
          status="success"
          icon={<Clock size={24} />}
          description="Time elapsed since the last data load completion in Snowflake."
          subtext="Target: < 15m (MET)"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Analysis Pane */}
        <div className="lg:col-span-8 space-y-6">
           {/* Navigation Tabs */}
           <div className="flex gap-1 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm w-fit">
              {[
                { id: 'PROFILE', label: 'Column Profile', icon: <Search size={14} /> },
                { id: 'STATISTICS', label: 'Value Statistics', icon: <BarChart2 size={14} /> },
                { id: 'LINEAGE', label: 'Failure Samples', icon: <AlertTriangle size={14} /> },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedPane(tab.id as any)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
                    selectedPane === tab.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
           </div>

           <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[500px] animate-in slide-in-from-left-4 duration-500">
              <div className="p-8">
                {selectedPane === 'PROFILE' && (
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-4">
                        <th className="pb-4">Column Name</th>
                        <th className="pb-4">Type</th>
                        <th className="pb-4">Integrity</th>
                        <th className="pb-4">Trend</th>
                        <th className="pb-4 text-right">Optimization</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {[
                        { name: 'ACCOUNT_ID', type: 'VARCHAR', integrity: 100, trend: 'up' },
                        { name: 'EMAIL_ADDR', type: 'VARCHAR', integrity: 82, trend: 'down' },
                        { name: 'POSTAL_CODE', type: 'NUMBER', integrity: 94, trend: 'up' },
                        { name: 'LAST_LOGIN', type: 'TIMESTAMP', integrity: 99, trend: 'stable' },
                        { name: 'BALANCE', type: 'DECIMAL', integrity: 100, trend: 'up' },
                        { name: 'KYC_DOC_URL', type: 'VARCHAR', integrity: 45, trend: 'down' },
                      ].map((col, idx) => (
                        <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="py-4">
                            <div className="flex flex-col">
                              <span className="font-mono text-xs font-bold text-slate-800">{col.name}</span>
                              <span className="text-[10px] text-slate-400 font-medium">Dimension: Accuracy</span>
                            </div>
                          </td>
                          <td className="py-4 text-xs font-bold text-slate-400">{col.type}</td>
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden shrink-0">
                                <div className={`h-full ${col.integrity > 90 ? 'bg-emerald-500' : col.integrity > 70 ? 'bg-sky-500' : 'bg-rose-500'}`} style={{ width: `${col.integrity}%` }} />
                              </div>
                              <span className="text-xs font-black text-slate-700">{col.integrity}%</span>
                            </div>
                          </td>
                          <td className="py-4">
                             {col.trend === 'up' && <ArrowUpRight size={14} className="text-emerald-500" />}
                             {col.trend === 'down' && <ArrowUpRight size={14} className="text-rose-500 rotate-90" />}
                             {col.trend === 'stable' && <div className="w-2 h-0.5 bg-slate-300 rounded" />}
                          </td>
                          <td className="py-4 text-right">
                             <button className="text-[10px] font-bold text-sky-500 hover:underline">REPAIR</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {selectedPane === 'STATISTICS' && (
                  <div className="space-y-8 animate-in fade-in duration-500">
                    <div className="grid grid-cols-2 gap-8">
                       <div className="space-y-4">
                          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                             <PieIcon size={14} className="text-sky-500" /> Value Distribution
                          </h4>
                          <div className="h-64 border border-slate-100 rounded-2xl p-4">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={distributionData.map((d, i) => ({ name: d.name, value: d.value }))}>
                                <defs>
                                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
                                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                                <Area type="monotone" dataKey="value" stroke={COLORS.primary} fill="url(#colorVal)" strokeWidth={2} />
                                <Tooltip />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                       </div>
                       <div className="space-y-4">
                          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                             <Activity size={14} className="text-rose-500" /> Statistical Profiling
                          </h4>
                          <div className="space-y-3">
                            {[
                              { label: 'Standard Deviation', value: '4.2%', health: 'good' },
                              { label: 'Outlier Frequency', value: '1.2%', health: 'warning' },
                              { label: 'Skewness (Normal)', value: '0.12', health: 'good' },
                              { label: 'Kurtosis Range', value: '3.14', health: 'good' },
                            ].map((stat, i) => (
                              <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <span className="text-xs font-bold text-slate-500 uppercase">{stat.label}</span>
                                <span className="text-sm font-black text-slate-800">{stat.value}</span>
                              </div>
                            ))}
                          </div>
                       </div>
                    </div>
                  </div>
                )}
                {selectedPane === 'LINEAGE' && (
                  <div className="flex flex-col items-center justify-center p-20 text-center animate-in zoom-in-95">
                    <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-500 mb-6">
                      <AlertTriangle size={40} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Detailed Failure Logs</h3>
                    <p className="text-sm text-slate-500 max-w-sm mb-8">
                      Row-level failures are being streamed from Snowflake. Connect your account to view actual invalid record samples and PK traces.
                    </p>
                    <button className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-xl hover:bg-slate-800 transition-all uppercase text-xs tracking-widest">
                      Grant Stream Access
                    </button>
                  </div>
                )}
              </div>
           </div>
        </div>

        {/* Sidebar Insights */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 animate-in slide-in-from-right-4 duration-500">
              <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-3">
                {/* Fix: Use RadarIcon (aliased from lucide-react) instead of RadarChart (from recharts) for the icon */}
                <RadarIcon size={18} className="text-sky-500" />
                Dimension Breakdown
              </h3>
              <div className="h-64 flex justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#f1f5f9" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                    <PolarRadiusAxis hide />
                    <Radar
                      name="Quality"
                      dataKey="A"
                      stroke={COLORS.primary}
                      fill={COLORS.primary}
                      fillOpacity={0.4}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 space-y-3">
                 <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
                   <span>Top Strength</span>
                   <span className="text-emerald-500">Uniqueness</span>
                 </div>
                 <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
                   <span>Gap Area</span>
                   <span className="text-rose-500">Validity</span>
                 </div>
              </div>
           </div>

           <div className="bg-slate-900 p-8 rounded-2xl shadow-xl animate-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center gap-3 text-sky-400 mb-6">
                <Lightbulb size={24} />
                <h3 className="text-lg font-bold text-white tracking-tight">Optimization Insight</h3>
              </div>
              <div className="space-y-6">
                 <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-xs text-slate-300 leading-relaxed italic">
                      "We've detected a recurring pattern in the <strong>POSTAL_CODE</strong> column. 12% of records use deprecated ISO formats. Automated remediation can improve validity to 99.8%."
                    </p>
                 </div>
                 <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Proposed Actions</p>
                    <div className="flex items-center justify-between group cursor-pointer">
                       <span className="text-xs font-bold text-white group-hover:text-sky-400 transition-colors">Apply Format Mask</span>
                       <ChevronRight size={14} className="text-slate-600" />
                    </div>
                    <div className="w-full h-px bg-white/5" />
                    <div className="flex items-center justify-between group cursor-pointer">
                       <span className="text-xs font-bold text-white group-hover:text-sky-400 transition-colors">Harden Constraint</span>
                       <ChevronRight size={14} className="text-slate-600" />
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};