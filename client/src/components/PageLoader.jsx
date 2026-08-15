import React from 'react';

const PageLoader = () => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-primary-500/20 border-t-primary-600 animate-spin" />
        <span className="text-xs text-neutral-400 font-medium tracking-wide">Loading...</span>
      </div>
    </div>
  );
};

export default PageLoader;
