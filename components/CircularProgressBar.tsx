import React from 'react';

interface CircularProgressBarProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
}

const CircularProgressBar: React.FC<CircularProgressBarProps> = ({ progress, size = 120, strokeWidth = 10 }) => {
  const roundedProgress = Math.round(progress);
  const center = size / 2;
  const radius = center - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (roundedProgress / 100) * circumference;

  const textSize = size >= 120 ? 'text-2xl' : size >= 80 ? 'text-xl' : 'text-lg';

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-gray-200"
          stroke="currentColor"
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-brand-primary transition-all duration-300 ease-in-out"
          stroke="currentColor"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`font-bold text-brand-primary ${textSize}`}>{`${roundedProgress}%`}</span>
      </div>
    </div>
  );
};

export default CircularProgressBar;