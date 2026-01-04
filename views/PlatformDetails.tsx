
import React, { useState, useEffect } from 'react';
import { Search, Filter, ArrowRight, CheckCircle2, XCircle, AlertCircle, PlayCircle, Download, Zap, Key, Server, Settings, ShieldCheck, SearchCode, Loader2, Clock, Calendar, Terminal } from 'lucide-react';
import { COLORS } from '../constants';
import { snowflakeService } from '../services/SnowflakeService';
import { DQRun } from '../types';

export const PlatformDetails: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'RUNS' | 'CONFIG' | 'RULES'>('RUNS');
  const [isConnecting, setIsConnecting] = useState(false);
  const [runs, setRuns] = useState<DQRun[]>([]);
  const [selectedRun, setSelectedRun] = useState<DQRun | null>(null);
  const [logs, setLogs] = useState<string[]>(["-- PI_Qualytics Connection Manager v2.4"]);
  const [config, setConfig] = useState({
    account: 'xyz123',
    warehouse: 'COMPUTE_WH',
    database: 'BANKING_DW',
    role: 'ACCOUNTADMIN',
    token: ''
  });

  useEffect(() => {
    snowflakeService.fetchRuns().then(setRuns);
  }, []);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, msg]);
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    addLog(`[INFO] Attempting connection to ${config.account}...`);
    
    // Simulate auth handshake
    setTimeout(() => addLog("[INFO] Decrypting OAUTH credentials..."), 500);
    
    const success = await snowflakeService.connect({
      account: config.account,
      warehouse: config.warehouse,
      database: config.database,
      role: config.role,
      authType: 'OAUTH'
    }, config.token || 'demo-token');

    if (success) {
      addLog("[OK] Session established with Snowflake SQL API.");
      addLog("[OK] Ready for data extraction.");
    } else {
      addLog("[ERROR] Failed to establish session. Check Account URL and Token.");
    }
    setIsConnecting(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-100 w-fit shadow-sm">
        {[
          { id: 'RUNS', label: 'Execution History' },
          { id: 'RULES', label: 'Rule Library' },
          { id: 'CONFIG', label: 'Snowflake Settings' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id 
                ? 'bg-sky-500 text-white shadow-lg shadow-sky-100' 
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'RUNS' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* List of Runs */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
               <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                 <h3 className="font-bold text-slate-800">DQ Execution History</h3>
                 <div className="flex gap-2">
                    <button className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-sky-500 transition-colors"><Filter size={16} /></button>
                    <button className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-sky-500 transition-colors"><Download size={16} /></button>
                 </div>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead>
                     <tr className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                       <th className="px-6 py-4">Run ID</th>
                       <th className="px-6 py-4">Status</th>
                       <th className="px-6 py-4">Duration</th>
                       <th className="px-6 py-4">SLA Met</th>
                       <th className="px-6 py-4 text-right">Credits</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                     {runs.map(run => (
                       <tr 
                        key={run.runId} 
                        onClick={() => setSelectedRun(run)}
                        className={`hover:bg-slate-50/50 transition-colors group cursor-pointer ${selectedRun?.runId === run.runId ? 'bg-sky-50/30' : ''}`}
                       >
                         <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-600 group-hover:text-sky-600">
                           {run.runId}
                           <div className="text-[9px] text-slate-400 font-medium mt-1 uppercase tracking-tighter">{run.timestamp}</div>
                         </td>
                         <td className="px-6 py-4">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              run.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                            }`}>{run.status}</span>
                         </td>
                         <td className="px-6 py-4 text-xs text-slate-500">{run.duration}</td>
                         <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5">
                              <CheckCircle2 size={12} className="text-emerald-500" />
                              <span className="text-[10px] font-bold text-slate-500">YES</span>
                            </div>
                         </td>
                         <td className="px-6 py-4 text-right font-mono text-xs text-slate-700">{run.credits}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
            
            {/* Run Detail Sidebar */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
               {selectedRun ? (
                 <div className="animate-in slide-in-from-right-4 duration-300">
                   <div className="flex items-center justify-between mb-8">
                      <h3 className="font-bold text-slate-800">Run Details</h3>
                      <span className="text-[10px] font-bold text-sky-500 bg-sky-50 px-2 py-1 rounded uppercase tracking-widest">{selectedRun.runId}</span>
                   </div>
                   
                   <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-xl">
                          <p className="text-[9px] font-bold text-slate-400 uppercase mb-1 tracking-widest">Passed</p>
                          <p className="text-2xl font-black text-emerald-500">{selectedRun.summary.passed}</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl">
                          <p className="text-[9px] font-bold text-slate-400 uppercase mb-1 tracking-widest">Failed</p>
                          <p className="text-2xl font-black text-rose-500">{selectedRun.summary.failed}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                         <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Execution Timeline</h4>
                         <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="absolute left-0 h-full bg-emerald-400" style={{ width: '70%' }} />
                            <div className="absolute left-[70%] h-full bg-amber-400" style={{ width: '20%' }} />
                            <div className="absolute left-[90%] h-full bg-rose-400" style={{ width: '10%' }} />
                         </div>
                         <div className="flex justify-between text-[9px] font-bold text-slate-400">
                            <span>0s</span>
                            <span>{selectedRun.duration}</span>
                         </div>
                      </div>

                      <div className="pt-4 space-y-2">
                        <button className="w-full py-3 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                           <Terminal size={14} /> View Raw SQL Log
                        </button>
                        <button className="w-full py-3 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                           <Download size={14} /> Export Check Results
                        </button>
                      </div>
                   </div>
                 </div>
               ) : (
                 <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400">
                    <Clock size={48} className="mb-4 opacity-20" />
                    <p className="text-sm font-bold">Select a run to view deep diagnostics</p>
                    <p className="text-xs mt-1">Detailed breakdown of checks and failures will appear here.</p>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'CONFIG' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
               <Server size={24} className="text-sky-500" />
               Snowflake Authentication
            </h3>
            <div className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Account URL</label>
                  <input 
                    type="text" 
                    value={config.account}
                    onChange={(e) => setConfig({...config, account: e.target.value})}
                    placeholder="xyz123.snowflakecomputing.com" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20" 
                  />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Warehouse</label>
                    <input 
                      type="text" 
                      value={config.warehouse}
                      onChange={(e) => setConfig({...config, warehouse: e.target.value})}
                      placeholder="COMPUTE_WH" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20" 
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Role</label>
                    <input 
                      type="text" 
                      value={config.role}
                      onChange={(e) => setConfig({...config, role: e.target.value})}
                      placeholder="ACCOUNTADMIN" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20" 
                    />
                 </div>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Auth Token / Key</label>
                  <input 
                    type="password" 
                    value={config.token}
                    onChange={(e) => setConfig({...config, token: e.target.value})}
                    placeholder="Enter OAUTH token..." 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20" 
                  />
               </div>
               <button 
                onClick={handleConnect}
                disabled={isConnecting}
                className="w-full py-4 bg-sky-500 text-white font-bold rounded-xl shadow-lg shadow-sky-100 hover:bg-sky-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
               >
                  {isConnecting ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                  Establish Secure Connection
               </button>
            </div>
          </div>
          <div className="bg-slate-900 p-8 rounded-2xl shadow-xl flex flex-col min-h-[400px]">
             <div className="flex items-center gap-2 text-emerald-400 mb-6">
                <div className={`w-2 h-2 rounded-full bg-emerald-400 ${isConnecting ? 'animate-pulse' : ''}`} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Connection Console</span>
             </div>
             <div className="grow font-mono text-xs text-slate-400 space-y-2 overflow-y-auto max-h-[300px] scrollbar-hide">
                {logs.map((log, i) => (
                  <p key={i}>
                    {log.startsWith('[OK]') && <span className="text-emerald-500">{log.substring(0,4)}</span>}
                    {log.startsWith('[INFO]') && <span className="text-sky-500">{log.substring(0,6)}</span>}
                    {log.startsWith('[ERROR]') && <span className="text-rose-500">{log.substring(0,7)}</span>}
                    {!log.startsWith('[') ? log : log.substring(log.indexOf(']') + 1)}
                  </p>
                ))}
                {isConnecting && <p className="text-slate-500 animate-pulse">_</p>}
             </div>
          </div>
        </div>
      )}

      {activeTab === 'RULES' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
           <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Global DQ Rules</h3>
                <p className="text-xs text-slate-400 font-medium">Standardized validation rules applied across the Banking DW environment.</p>
              </div>
              <button className="px-6 py-3 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
                + New SQL Validator
              </button>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: 'Standard Email Validity', type: 'VALIDITY', tables: 12, health: 98.4, sql: "REGEXP_LIKE(EMAIL, '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}$', 'i')" },
                { name: 'Primary Key Uniqueness', type: 'UNIQUENESS', tables: 45, health: 100, sql: "COUNT(DISTINCT PK) = COUNT(*)" },
                { name: 'Negative Balance Guard', type: 'CUSTOM', tables: 4, health: 92.1, sql: "ACCOUNT_BALANCE >= 0" },
                { name: 'STG_CUSTOMER Completeness', type: 'COMPLETENESS', tables: 1, health: 99.1, sql: "FIRST_NAME IS NOT NULL" },
                { name: 'FX Referential Integrity', type: 'CONSISTENCY', tables: 8, health: 85.0, sql: "CURRENCY_CODE IN (SELECT CODE FROM ISO_CURRENCIES)" },
              ].map((rule, idx) => (
                <div key={idx} className="p-6 bg-slate-50/50 border border-slate-50 rounded-2xl hover:border-sky-300 transition-all group">
                   <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-white rounded-xl shadow-sm text-sky-500 group-hover:scale-110 transition-transform">
                         <SearchCode size={20} />
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] font-bold text-slate-400 uppercase">Health</p>
                         <p className={`text-sm font-bold ${rule.health > 95 ? 'text-emerald-500' : 'text-amber-500'}`}>{rule.health}%</p>
                      </div>
                   </div>
                   <p className="font-bold text-slate-800 mb-1">{rule.name}</p>
                   <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-4">{rule.type} • Active on {rule.tables} assets</p>
                   
                   <div className="p-3 bg-slate-900 rounded-xl font-mono text-[9px] text-emerald-400/80 mb-4 overflow-hidden truncate">
                      {rule.sql}
                   </div>
                   
                   <button className="w-full flex items-center justify-center gap-2 py-2 text-[10px] font-bold text-slate-500 hover:text-sky-600 border border-slate-100 bg-white rounded-lg transition-colors">
                     Edit Validation Logic <ArrowRight size={12} />
                   </button>
                </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
};
