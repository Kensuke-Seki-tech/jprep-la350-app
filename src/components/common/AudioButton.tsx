import React from 'react';
import type { AudioSpeed } from '../../types/word';

interface AudioButtonProps {
  text: string;
  speed?: AudioSpeed;
  isPlaying?: boolean;
  onSpeak: (text: string, speed?: AudioSpeed) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const AudioButton: React.FC<AudioButtonProps> = ({
  text,
  speed,
  isPlaying = false,
  onSpeak,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-7 h-7 text-sm',
    md: 'w-9 h-9 text-base',
    lg: 'w-11 h-11 text-lg',
  };

  return (
    <button
      onClick={() => onSpeak(text, speed)}
      className={`inline-flex items-center justify-center rounded-full transition-all
        ${isPlaying
          ? 'bg-blue-500 text-white shadow-md scale-110'
          : 'bg-blue-100 text-blue-600 hover:bg-blue-200 active:scale-95'
        }
        ${sizeClasses[size]} ${className}`}
      aria-label={`${text} を再生`}
      title={`発音を聴く${speed ? ` (×${speed})` : ''}`}
    >
      {isPlaying ? '⏸' : '🔊'}
    </button>
  );
};
