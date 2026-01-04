
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, ComposedChart, Line
} from 'recharts';
import { Code2, Hash, Layers, ShieldAlert, Cpu } from 'lucide-react';
import { DashboardCard } from '../components/DashboardCard';
// Added MOCK_CHART_DATA to the imports
import { COLORS, MOCK_CHART_DATA } from '../constants';

const ruleTypeData = [
  { type: 'Completeness', passed: 450, failed: 12 },
  { type: 'Uniqueness', passed: 320, failed: 45 },
  { type: 'Validity', passed: 580, failed: 22 },
  { type: 'Consistency', passed: 210, failed: 8 },
  { type: 'Volume', passed: 150, failed: 2 },
];

export const TechnicalView: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Added required id property */}
        <DashboardCard 
          id="tech_execution_time"
          label="Execution Time"
          value="452ms"
          trend={-12}
          status="success"
          icon={<Cpu size={24} />}
          subtext="Avg per check run"
        />
        {/* Added required id property */}
        <DashboardCard 
          id="tech_failed_rules"
          label="Failed Rules"
          value="34"
          status="warning"
          icon={<ShieldAlert size={24} />}
          subtext="From total 580 rules"
        />
        {/* Added required id property */}
        <DashboardCard 
          id="tech_null_rate"
          label="Null Record Rate"
          value="0.12%"
          trend={-2}
          status="success"
          icon={<Hash size={24} />}
          subtext="Across critical columns"
        />
        {/* Added required id property */}
        <DashboardCard 
          id="tech_checks_executed"
          label="Checks Executed"
          value="4.5k"
          status="info"
          icon={<Layers size={24} />}
          subtext="Last 24 hours"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center">
            <Code2 size={18} className="mr-2 text-sky-500" />
            Rule Performance by Dimension
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ruleTypeData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="type" type="category" stroke="#94a3b8" fontSize={12} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px' }} />
                <Bar dataKey="passed" stackId="a" fill={COLORS.primary} radius={[0, 0, 0, 0]} barSize={20} />
                <Bar dataKey="failed" stackId="a" fill={COLORS.error} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-6">Column Quality Heatmap</h3>
          <div className="space-y-3">
            {[
              { col: 'customer_id', score: 100 },
              { col: 'email', score: 85 },
              { col: 'phone_number', score: 72 },
              { col: 'address_line_1', score: 98 },
              { col: 'created_at', score: 100 },
              { col: 'kyc_status', score: 64 },
              { col: 'segment', score: 89 },
            ].map((col, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs p-2 rounded hover:bg-slate-50">
                <span className="font-mono text-slate-500">{col.col}</span>
                <div className={`w-3 h-3 rounded-sm ${
                  col.score > 90 ? 'bg-emerald-500' : col.score > 80 ? 'bg-sky-400' : 'bg-rose-500'
                }`} title={`Score: ${col.score}%`} />
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-slate-50 flex items-center gap-4 text-[10px] font-bold text-slate-400">
            <div className="flex items-center gap-1"><div className="w-2 h-2 bg-emerald-500 rounded-sm" /> Healthy</div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 bg-sky-400 rounded-sm" /> Warning</div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 bg-rose-500 rounded-sm" /> Critical</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Anomaly Detection</h3>
          <span className="text-[10px] font-bold bg-rose-50 text-rose-600 px-2 py-1 rounded-full uppercase">3 Spikes Detected</span>
        </div>
        <div className="p-6 h-64">
           <ResponsiveContainer width="100%" height="100%">
             <ComposedChart data={MOCK_CHART_DATA}>
               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
               <XAxis dataKey="date" hide />
               <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
               <Tooltip />
               <Bar dataKey="score" fill="#f1f5f9" radius={[4, 4, 0, 0]} barSize={40} />
               <Line type="monotone" dataKey="score" stroke={COLORS.primary} strokeWidth={2} dot={{ fill: COLORS.primary, r: 4 }} />
             </ComposedChart>
           </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
