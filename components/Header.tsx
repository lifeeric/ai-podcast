
import React from 'react';

const MicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
    <line x1="12" y1="19" x2="12" y2="23"></line>
    <line x1="8" y1="23" x2="16" y2="23"></line>
  </svg>
);

const Header: React.FC = () => {
  return (
    <header className="text-center py-6 border-b-2 border-slate-700">
      <div className="flex justify-center items-center gap-4">
        <MicIcon />
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">Blogcast AI</h1>
          <p className="mt-2 text-lg text-slate-400">Transform your blog posts into engaging podcasts instantly.</p>
        </div>
      </div>
    </header>
  );
};

export default Header;
