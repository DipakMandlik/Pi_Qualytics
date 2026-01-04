
import React, { useState } from 'react';
import { Calculator, ChevronUp, ChevronDown, CheckCircle2, Zap, ArrowRight, Info, Settings2 } from 'lucide-react';

interface CalculationStep {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const steps: CalculationStep[] = [
  { 
    title: 'Data Ingestion', 
    description: 'Raw metadata and failed record samples are extracted via Snowflake SQL API v2.', 
    icon: <Settings2 size={16} /> 
  },
  { 
    title: 'Atomic Validation', 
    description: 'Each record is evaluated against 5 core DQ dimensions (Completeness, Uniqueness, etc.).', 
    icon: <CheckCircle2 size={16} /> 
  },
  { 
    title: 'Weighting Engine', 
    description: 'Criticality coefficients (0.1 - 1.0) are applied based on table business domain.', 
    icon: <Zap size={16} /> 
  },
  { 
    title: 'Final Grade', 
    description: 'Scores are normalized into a 0-100 scale using a proprietary Bayesian scoring model.', 
    icon: <Calculator size={16} /> 
  }
];

export const ScoreMethodology: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-6 pb-6 pointer-events-none">
      <div className="max-w-[1600px] mx-auto w-full flex flex-col items-end">
        <div className={`pointer-events-auto bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'w-full max-h-[400px]' : 'w-72 max-h-12'}`}>
          {/* Header */}
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full h-12 px-5 flex items-center justify-between bg-slate-900 text-white hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Calculator size={16} className="text-sky-400" />
              <span className="text-xs font-bold uppercase tracking-widest">Score Methodology</span>
            </div>
            {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>

          {/* Content */}
          <div className="p-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
            {steps.map((step, idx) => (
              <div key={idx} className="relative group animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${idx * 150}ms` }}>
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    {step.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 mb-1">{step.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">{step.description}</p>
                  </div>
                </div>
                {idx < steps.length - 1 && (
                  <ArrowRight size={16} className="hidden lg:block absolute top-1/2 -right-4 -translate-y-1/2 text-slate-200" />
                )}
              </div>
            ))}
            
            <div className="lg:col-span-4 mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Info size={16} className="text-emerald-600" />
                <p className="text-xs font-bold text-emerald-800">
                  Optimization Suggestion: <span className="font-medium">Increase sampling rate to 10% on BANK_DW.BRONZE tables to improve scoring accuracy.</span>
                </p>
              </div>
              <button className="text-[10px] font-bold text-white bg-emerald-600 px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors uppercase">
                Optimize Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
