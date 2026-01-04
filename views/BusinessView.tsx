
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  Cell, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { UserCheck, ShieldAlert, Activity, BarChart3, Clock, Layout } from 'lucide-react';
import { DashboardCard } from '../components/DashboardCard';
import { COLORS } from '../constants';

const domainImpact = [
  { domain: 'Banking', score: 92, impact: 'High' },
  { domain: 'Transaction', score: 88, impact: 'Critical' },
  { domain: 'Customer', score: 84, impact: 'High' },
  { domain: 'Account', score: 95, impact: 'Medium' },
  { domain: 'FX Rates', score: 65, impact: 'Low' },
];

const priorityData = [
  { x: 10, y: 80, z: 100, name: 'Compliance Risks' },
  { x: 30, y: 60, z: 200, name: 'Customer Inaccuracies' },
  { x: 70, y: 30, z: 50, name: 'Operational Delays' },
  { x: 45, y: 45, z: 300, name: 'Process Gaps' },
];

export const BusinessView: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard 
          id="biz_op_delay"
          label="Operational Delay"
          value="45m"
          trend={15}
          status="warning"
          icon={<Clock size={24} />}
          description="Average delay in business process execution caused by data quality remediation cycles."
          subtext="Impact on 12 workflow jobs"
        />
        <DashboardCard 
          id="biz_compliance"
          label="Rule Compliance"
          value="89.4%"
          trend={-2.1}
          status="warning"
          icon={<UserCheck size={24} />}
          description="Percentage of business-defined validation rules that passed successfully in the last cycle."
          subtext="34 rules failing currently"
        />
        <DashboardCard 
          id="biz_trust_score"
          label="Data Trust Index"
          value="92/100"
          trend={4}
          status="success"
          icon={<Activity size={24} />}
          description="Overall measure of data reliability for business users and stakeholder reports."
          subtext="Based on STG_CUSTOMER quality"
        />
        <DashboardCard 
          id="biz_process_breaches"
          label="Process Breaches"
          value="2"
          status="error"
          icon={<ShieldAlert size={24} />}
          description="Number of critical business process violations detected within the data ecosystem."
          subtext="Audit priority: High"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center">
            <BarChart3 size={18} className="mr-2 text-sky-500" />
            Domain Health Scores
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={domainImpact}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="domain" stroke="#94a3b8" fontSize={12} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} axisLine={false} tickLine={false} />
                <RechartsTooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="score" radius={[4, 4, 0, 0]} barSize={40}>
                  {domainImpact.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.score > 90 ? COLORS.success : entry.score > 80 ? COLORS.primary : COLORS.warning} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center">
            <Layout size={18} className="mr-2 text-sky-500" />
            Process Impact Matrix
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" dataKey="x" name="Frequency" unit="%" stroke="#94a3b8" />
                <YAxis type="number" dataKey="y" name="Impact" unit="%" stroke="#94a3b8" />
                <ZAxis type="number" dataKey="z" range={[60, 400]} name="Volume" />
                <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Issues" data={priorityData} fill={COLORS.primary} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
