
import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import { ShieldCheck, AlertCircle, Database, Target, TrendingUp, Link2, ChevronRight, Info, Activity } from 'lucide-react';
import { DashboardCard } from '../components/DashboardCard';
import { KPIDetailPanel } from '../components/KPIDetailPanel';
import { MOCK_CHART_DATA, COLORS } from '../constants';
import { snowflakeService } from '../services/SnowflakeService';
import { MetricCardData } from '../types';

const statusData = [
  { name: 'Passed', value: 37, color: COLORS.success },
  { name: 'Failed', value: 12, color: COLORS.error },
  { name: 'Warning', value: 11, color: COLORS.warning },
];

export const ExecutiveView: React.FC = () => {
  const [isConnected, setIsConnected] = useState(snowflakeService.connectionStatus);
  const [selectedKpi, setSelectedKpi] = useState<MetricCardData | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsConnected(snowflakeService.connectionStatus);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleConnectClick = () => {
    window.dispatchEvent(new CustomEvent('NAVIGATE_TO_PLATFORM'));
  };

  const kpis: (MetricCardData & { description: string })[] = [
    { 
      id: 'dq_score',
      label: "Overall DQ Score",
      value: "94.5%",
      trend: 1.2,
      status: "success",
      icon: <ShieldCheck size={24} />,
      subtext: "vs previous run (93.3%)",
      description: "Aggregated quality health across all monitored Snowflake assets based on automated checks.",
      calculationLogic: "Weighted average of rule pass rates across all active datasets.",
      sourceSql: `SELECT AVG(DQ_SCORE) FROM DQ_DAILY_SUMMARY;`
    },
    { 
      id: 'data_trust',
      label: "Data Trust Index",
      value: "88/100",
      trend: 2.5,
      status: "info",
      icon: <Activity size={24} />,
      subtext: "Confidence in decision accuracy",
      description: "A proprietary index measuring the reliability of your data for downstream analytics and AI applications.",
      calculationLogic: "Normalized score based on validity, consistency, and freshness dimensions.",
      sourceSql: `SELECT (COUNT_IF(CHECK_STATUS = 'PASS') / COUNT(*)) * 100 FROM DQ_CHECK_RESULTS;`
    },
    { 
      id: 'critical_issues',
      label: "Open Critical Issues",
      value: "12",
      status: "error",
      icon: <AlertCircle size={24} />,
      subtext: "Action required immediately",
      description: "High-priority data quality failures that impact core business operations or regulatory reporting.",
      calculationLogic: "Count of failed checks where severity level is marked as 'Critical'.",
      sourceSql: `SELECT COUNT(*) FROM DQ_CHECK_RESULTS WHERE RULE_LEVEL = 'CRITICAL' AND CHECK_STATUS = 'FAIL';`
    },
    { 
      id: 'sla_compliance',
      label: "SLA Compliance",
      value: "98.2%",
      trend: 0.5,
      status: "success",
      icon: <Target size={24} />,
      subtext: "Target: 95.0%",
      description: "Percentage of data loads that met both timeliness and quality thresholds as defined in SLAs.",
      calculationLogic: "Ratio of successful, on-time runs to total scheduled runs.",
      sourceSql: `SELECT (COUNT_IF(IS_SLA_MET = TRUE) / COUNT(*)) * 100 FROM DQ_DAILY_SUMMARY;`
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {selectedKpi && <KPIDetailPanel kpi={selectedKpi} onClose={() => setSelectedKpi(null)} />}

      {!isConnected && (
        <div className="bg-sky-600 rounded-2xl p-6 text-white shadow-xl shadow-sky-200 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />
          <div className="flex items-center gap-5 relative z-10">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
              <Link2 size={28} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Connect your Snowflake Account</h2>
              <p className="text-sky-100 text-sm mt-1 max-w-md">Unlock full automation and real-time data integrity monitoring by linking your enterprise Snowflake instance.</p>
            </div>
          </div>
          <button 
            onClick={handleConnectClick}
            className="px-8 py-3 bg-white text-sky-600 font-bold rounded-xl shadow-lg hover:scale-105 transition-all flex items-center gap-2 group/btn relative z-10"
          >
            Connect Now <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map(kpi => (
          <div key={kpi.id} onClick={() => setSelectedKpi(kpi)} className="cursor-pointer relative group">
            <DashboardCard {...kpi} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 flex items-center">
              <TrendingUp size={18} className="mr-2 text-sky-500" />
              Strategic Health Trend
            </h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_CHART_DATA}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.1}/>
                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={[80, 100]} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="score" stroke={COLORS.primary} fillOpacity={1} fill="url(#colorScore)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-6 text-center">Execution Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={1500}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
