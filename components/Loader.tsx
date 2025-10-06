
import React from 'react';
import type { PodcastGenerationStatus } from '../types';

interface LoaderProps {
  message: PodcastGenerationStatus;
}

const Loader: React.FC<LoaderProps> = ({ message }) => {
  return (
    <div className="flex items-center justify-center space-x-3 p-4">
      <div className="w-4 h-4 rounded-full bg-cyan-400 animate-pulse"></div>
      <div className="w-4 h-4 rounded-full bg-cyan-400 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
      <div className="w-4 h-4 rounded-full bg-cyan-400 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
      <p className="text-slate-300">{message}</p>
    </div>
  );
};

export default Loader;
