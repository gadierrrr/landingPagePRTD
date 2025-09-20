import React from 'react';

interface WaveDividerProps {
  className?: string;
  flip?: boolean;
}

export const WaveDivider: React.FC<WaveDividerProps> = ({ className = '', flip = false }) => {
  return (
    <div className={`relative z-10 w-full overflow-hidden ${className}`}>
      <svg
        viewBox="0 0 1200 160"
        preserveAspectRatio="none"
        className={`relative block w-full ${flip ? 'rotate-180' : ''} h-[80px] sm:h-[120px] lg:h-[160px]`}
        style={{ fill: 'var(--color-brand-blue)' }}
      >
        {/* Simplified wave layers that match the mockup better */}
        <path 
          d="M0,0V40c80,20,160,40,240,35c80,-5,160,-25,240,-20c80,5,160,25,240,20c80,-5,160,-25,240,-20c80,5,160,25,240,20V0Z"
          opacity="0.2"
        />
        <path 
          d="M0,0V60c100,25,200,35,300,30c100,-5,200,-20,300,-15c100,5,200,20,300,15c100,-5,200,-20,300,-15V0Z"
          opacity="0.4"
        />
        <path 
          d="M0,0V80c120,30,240,40,360,35c120,-5,240,-25,360,-20c120,5,240,25,360,20c120,-5,240,-25,360,-20V0Z"
          opacity="0.6"
        />
        {/* Main wave layer */}
        <path 
          d="M0,0V100c150,35,300,45,450,40c150,-5,300,-30,450,-25c150,5,300,30,450,25V0Z"
          opacity="1"
        />
        {/* Bottom fill to ensure clean transition */}
        <rect x="0" y="120" width="1200" height="40" opacity="1" />
      </svg>
    </div>
  );
};