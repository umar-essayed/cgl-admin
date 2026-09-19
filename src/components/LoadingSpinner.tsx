'use client';

import React from 'react';

interface LoadingSpinnerProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  fullHeight?: boolean;
}

export default function LoadingSpinner({
  label = 'جاري التحميل...',
  size = 'md',
  fullHeight = true,
}: LoadingSpinnerProps) {
  const sizeMap = {
    sm: { svg: 'w-8 h-8', ball: 5, radius: 14, text: 'text-xs' },
    md: { svg: 'w-14 h-14', ball: 6.5, radius: 22, text: 'text-xs' },
    lg: { svg: 'w-20 h-20', ball: 8, radius: 30, text: 'text-sm' },
  };

  const currentSize = sizeMap[size];

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3.5 py-12 ${
        fullHeight ? 'min-h-[260px]' : ''
      }`}
    >
      <div className="relative flex items-center justify-center">
        {/* Glow halo */}
        <div className="absolute w-16 h-16 rounded-full blur-xl bg-[#3b76b3]/25 pointer-events-none" />

        {/* Orbit vector spinner */}
        <svg
          className={`${currentSize.svg} text-[#3b76b3]`}
          viewBox="0 0 80 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="adminOrbGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#93c5fd" />
              <stop offset="50%" stopColor="#3b76b3" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </radialGradient>
          </defs>

          {/* Subtle background guide track */}
          <circle
            cx="40"
            cy="40"
            r={currentSize.radius}
            stroke="#222630"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />

          {/* Rotating group */}
          <g className="admin-orbit-group">
            <circle
              cx="40"
              cy={40 - currentSize.radius}
              r={currentSize.ball}
              fill="url(#adminOrbGrad)"
              className="drop-shadow-[0_0_8px_rgba(59,118,179,0.8)]"
            />
            <circle
              cx="40"
              cy={40 + currentSize.radius}
              r={currentSize.ball}
              fill="url(#adminOrbGrad)"
              className="drop-shadow-[0_0_8px_rgba(59,118,179,0.8)]"
            />
            <circle
              cx="40"
              cy="40"
              r="2.5"
              fill="#93c5fd"
            />
          </g>
        </svg>
      </div>

      {label && (
        <p className={`${currentSize.text} font-medium text-stone-400 font-sans tracking-wide animate-pulse`}>
          {label}
        </p>
      )}

      <style jsx>{`
        .admin-orbit-group {
          transform-origin: 40px 40px;
          animation: adminSpin 1.1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        @keyframes adminSpin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
