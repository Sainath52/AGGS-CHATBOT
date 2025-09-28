import React from 'react';
import LogoIcon from './LogoIcon';

const Header: React.FC = () => {
  return (
    <header className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-lg p-4 sticky top-0 z-20 border-b border-slate-300/50 dark:border-slate-700/50">
      <div className="max-w-5xl mx-auto flex items-center justify-center gap-3">
        <LogoIcon className="w-8 h-8" />
        <h1 className="text-2xl font-bold bg-gradient-to-r from-sky-400 to-indigo-500 bg-clip-text text-transparent">
          AGGS Educational Assistant
        </h1>
      </div>
    </header>
  );
};

export default Header;