import React from 'react';
import type { AudioSpeed } from '../../types/word';

interface SpeedControlProps {
  currentSpeed: AudioSpeed;
  onSpeedChange: (speed: AudioSpeed) => void;
  showDictation?: boolean;
  className?: string;
}

const SPEED_OPTIONS: { value: AudioSpeed; label: string; desc: string }[] = [
  { value: 1.0, label: '×1.0', desc: 'ネイティブ速度' },
  { value: 0.7, label: '×0.7', desc: 'ゆっくり' },
  { value: 0.5, label: '×0.5', desc: 'ディクテーション' },
];

export const SpeedControl: React.FC<SpeedControlProps> = ({
  currentSpeed,
  onSpeedChange,
  showDictation = true,
  className = '',
}) => {
  const options = showDictation ? SPEED_OPTIONS : SPEED_OPTIONS.slice(0, 2);

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <span className="text-xs text-gray-400 mr-1">速度</span>
      {options.map(({ value, label, desc }) => (
        <button
          key={value}
          onClick={() => onSpeedChange(value)}
          title={desc}
          className={`px-2 py-1 rounded-full text-xs font-medium transition-all
            ${currentSpeed === value
              ? 'bg-blue-500 text-white shadow-sm'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};
