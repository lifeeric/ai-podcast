import React from 'react';
import type { PlaybackState } from '../types';

interface IconProps {
  className?: string;
}

const PlayIcon: React.FC<IconProps> = ({ className = "w-8 h-8" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M8 5v14l11-7z" />
  </svg>
);

const PauseIcon: React.FC<IconProps> = ({ className = "w-8 h-8" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
);

const StopIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M6 6h12v12H6z" />
  </svg>
);


interface AudioPlayerProps {
  playbackState: PlaybackState;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ playbackState, onPlay, onPause, onStop }) => {
  const isPlaying = playbackState === 'playing';
  const isPaused = playbackState === 'paused';

  const getStatusText = () => {
    switch (playbackState) {
      case 'playing': return 'PLAYING';
      case 'paused': return 'PAUSED';
      case 'ended': return 'FINISHED';
      default: return 'IDLE';
    }
  }

  return (
    <div className="bg-slate-900/70 p-6 rounded-lg border border-slate-700 w-full">
      <div className="flex items-center gap-6">
        <button
          onClick={isPlaying ? onPause : onPlay}
          disabled={playbackState === 'ended'}
          className="flex items-center justify-center w-16 h-16 bg-cyan-600 text-white rounded-full shadow-lg hover:bg-cyan-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying || isPaused ? <PauseIcon /> : <PlayIcon />}
        </button>
        <div className="flex-grow flex flex-col justify-center">
           <div className="text-slate-300 font-semibold text-lg tracking-wider">
             {getStatusText()}
           </div>
           <div className="text-slate-400 text-sm">
             High-Fidelity AI Voice
           </div>
        </div>
         <button
          onClick={onStop}
          className="flex items-center justify-center w-12 h-12 bg-slate-700 text-slate-300 rounded-full hover:bg-slate-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-slate-500"
          aria-label="Stop"
        >
          <StopIcon />
        </button>
      </div>
    </div>
  );
};

export default AudioPlayer;
