import React from 'react';
// Fix: Added ArrowRight to the lucide-react imports
import { X, Code, Terminal, Info, Database, Copy, Check, TrendingUp, ShieldCheck, Zap, ArrowRight } from 'lucide-react';
import { MetricCardData } from '../types';

interface Props {
  kpi: MetricCardData;
  onClose: () => void;
}

export const KPIDetailPanel: React.FC<Props> = ({ kpi, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  const copySql = () => {
    if (kpi.sourceSql) {
      navigator.clipboard.writeText(kpi.sourceSql);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-end bg-slate-900/40 backdrop-blur-sm p-6 animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-white h-full rounded-3xl shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-2xl shadow-sm text-sky-500">
              {kpi.icon}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">{kpi.label} Detail</h2>
              <p className="text-sm text-slate-400 font-medium uppercase tracking-wider">KPI DRILL-DOWN & LINEAGE</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Main Stat Display */}
          <div className="flex items-end gap-4 animate-in zoom-in-95 duration-500">
            <span className="text-6xl font-black text-slate-800 tracking-tighter">{kpi.value}</span>
            <div className={`mb-2 px-3 py-1 rounded-full text-xs font-bold ${
              kpi.trend && kpi.trend > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            }`}>
              {kpi.trend && kpi.trend > 0 ? '+' : ''}{kpi.trend}% vs Last Period
            </div>
          </div>

          {/* Logic Details */}
          <section className="space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800 uppercase tracking-widest">
              <Info size={16} className="text-sky-500" />
              Calculation Methodology
            </h3>
            <div className="p-6 bg-sky-50/50 border border-sky-100 rounded-2xl">
              <p className="text-sm text-sky-900 leading-relaxed font-medium">
                {kpi.calculationLogic || "This metric represents the aggregate quality health across all monitored Snowflake assets, normalized by criticality weighting."}
              </p>
            </div>
          </section>

          {/* Optimization Strategies */}
          <section className="space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800 uppercase tracking-widest">
              <TrendingUp size={16} className="text-emerald-500" />
              Optimization Strategies
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {[
                { label: 'Auto-Remediation', desc: 'Enable SQL-driven fixes for common format violations.', icon: <Zap size={14} className="text-amber-500" /> },
                { label: 'Constraint Hardening', desc: 'Convert soft DQ rules into hard Snowflake constraints.', icon: <ShieldCheck size={14} className="text-sky-500" /> },
              ].map((strategy, i) => (
                <div key={i} className="p-4 bg-slate-50 border border-slate-100 rounded-xl hover:border-sky-200 transition-all flex items-start gap-3 group">
                  <div className="mt-1">{strategy.icon}</div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 group-hover:text-sky-600 transition-colors">{strategy.label}</p>
                    <p className="text-[10px] text-slate-500 font-medium">{strategy.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Source SQL */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800 uppercase tracking-widest">
                <Terminal size={16} className="text-slate-400" />
                Source SQL Transparency
              </h3>
              <button 
                onClick={copySql}
                className="flex items-center gap-2 text-[10px] font-bold text-sky-500 hover:text-sky-600 transition-colors bg-sky-50 px-2 py-1 rounded-lg"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? 'COPIED' : 'COPY SQL'}
              </button>
            </div>
            <pre className="p-6 bg-slate-900 rounded-2xl overflow-x-auto text-xs font-mono text-emerald-400 leading-relaxed border border-slate-800 shadow-inner">
              {kpi.sourceSql || `-- Calculation Logic Engine v2.4\nSELECT DQ_SCORE FROM DQ_DAILY_SUMMARY;`}
            </pre>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="p-8 border-t border-slate-100 bg-slate-50/50">
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('NAVIGATE_TO_TABLE_ANALYSIS'))}
            className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
          >
            Deep Dive into Table Pane <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};