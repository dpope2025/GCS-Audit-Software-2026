import React from 'react';

interface ProgressBarProps {
  progress: number;
  height?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, height = 'h-4' }) => {
  const roundedProgress = Math.round(progress);
  return (
    <div className="w-full bg-gray-200 rounded-full dark:bg-gray-700">
      <div
        className={`bg-brand-primary text-xs font-medium text-blue-100 rounded-full transition-all duration-500 flex items-center justify-center ${height}`}
        style={{ width: `${roundedProgress}%` }}
      >
        {roundedProgress > 10 && `${roundedProgress}%`}
      </div>
    </div>
  );
};

export default ProgressBar;