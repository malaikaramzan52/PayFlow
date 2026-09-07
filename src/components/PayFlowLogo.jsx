import React from 'react';

export default function PayFlowLogo({ size = 'md', lightMode = false }) {
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const titleSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className="flex items-center gap-3 select-none">
      {/* Brand Icon Box */}
      <div className={`${iconSizes[size]} rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 p-2.5 shadow-md shadow-blue-500/20 flex items-center justify-center shrink-0 border border-blue-400/30`}>
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-white stroke-current stroke-[2.2] stroke-linecap-round stroke-linejoin-round">
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
          <line x1="4" y1="22" x2="4" y2="15" />
          <circle cx="15" cy="11" r="2.5" className="fill-white/30" />
        </svg>
      </div>

      {/* Brand Text */}
      <div className="flex flex-col">
        <div className={`font-extrabold tracking-tight ${titleSizes[size]} flex items-center leading-none`}>
          <span className={lightMode ? "text-white" : "text-slate-900"}>Pay</span>
          <span className="text-blue-600">Flow</span>
        </div>
        <span className={`text-[11px] font-medium tracking-wide mt-0.5 ${lightMode ? "text-blue-200" : "text-slate-500"}`}>
          Enterprise System
        </span>
      </div>
    </div>
  );
}
