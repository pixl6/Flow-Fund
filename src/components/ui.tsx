import React from 'react';
import classNames from 'classnames';

export const NeonCard: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => {
  return (
    <div className={classNames('bg-background-surface border border-white/10 rounded-xl p-8 flex flex-col relative overflow-hidden inner-glow', className)} {...props}>
      {children}
    </div>
  );
};

export const NeonButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'ghost' }> = ({ className, variant = 'primary', children, ...props }) => {
  const baseClasses = 'px-6 py-3 font-semibold rounded-full transition-all duration-300 ease-out active:scale-95 flex items-center justify-center font-label';
  const variants = {
    primary: 'bg-action-neon text-black shadow-[0_0_15px_rgba(228,255,110,0.3)] hover:scale-105',
    secondary: 'bg-white/5 border border-white/10 text-white hover:bg-white/10',
    danger: 'bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30',
    ghost: 'text-text-muted hover:text-white transition-colors'
  };
  return (
    <button className={classNames(baseClasses, variants[variant], className)} {...props}>
      {children}
    </button>
  );
};

export const ProgressBar: React.FC<{ percentage: number; className?: string; colorClass?: string }> = ({ percentage, className, colorClass = 'bg-action-neon' }) => {
  const safePercentage = Math.min(Math.max(percentage, 0), 100);
  
  return (
    <div className={classNames('w-full h-1 bg-white/5 rounded-full overflow-hidden', className)}>
      <div 
        className={classNames('h-full transition-all duration-700 ease-out', colorClass)} 
        style={{ width: `${safePercentage}%` }}
      />
    </div>
  );
};
