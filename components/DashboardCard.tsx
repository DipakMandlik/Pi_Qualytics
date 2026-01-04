
import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { MetricCardData } from '../types';
import { Tooltip } from './Tooltip';

interface Props extends MetricCardData {
  className?: string;
  description?: string;
}

export const DashboardCard: React.FC<Props> = ({ label, value, trend, status, icon, subtext, description, className = '' }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'success': return 'text-emerald-500';
      case 'warning': return 'text-amber-500';
      case 'error': return 'text-rose-500';
      default: return 'text-sky-500';
    }
  };

  return (
    <Tooltip text={description || `Detailed overview of ${label}`}>
      <div className={`bg-white p-6 rounded-xl shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${className} h-full w-full`}>
        <div className="flex justify-between items-start mb-4">
          <div className={`p-2 rounded-lg bg-slate-50 ${getStatusColor()}`}>
            {icon}
          </div>
          {trend !== undefined && (
            <div className={`flex items-center text-sm font-medium ${trend >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {trend >= 0 ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <div>
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{label}</h3>
          <p className="text-3xl font-bold text-slate-800 tracking-tight">{value}</p>
          {subtext && <p className="text-slate-400 text-xs mt-2">{subtext}</p>}
        </div>
      </div>
    </Tooltip>
  );
};
