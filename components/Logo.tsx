
import React from 'react';

export const Logo: React.FC = () => (
  <div className="flex flex-col items-center lg:items-start group cursor-pointer">
    <div className="flex items-center gap-1.5 leading-none">
      {/* Pi symbol */}
      <span className="text-4xl font-bold brand-blue" style={{ fontFamily: 'serif' }}>π</span>
      
      {/* 'by' cursive text */}
      <span className="font-script text-2xl brand-yellow mt-1">by</span>
      
      {/* Blue box with 3 */}
      <div className="w-10 h-10 bg-brand-sky rounded-xl flex items-center justify-center shadow-sm ml-1">
        <span className="text-white text-3xl font-bold">3</span>
      </div>
      
      {/* TM symbol */}
      <span className="text-[8px] font-bold brand-blue self-start mt-1">TM</span>
    </div>
    
    {/* Tagline */}
    <span className="text-[9px] font-bold brand-blue uppercase tracking-tighter mt-1">
      Transforming Enterprises for Future
    </span>
  </div>
);
