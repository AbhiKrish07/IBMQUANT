import React from 'react';

export function ComingSoon({ title }) {
  return (
    <div className="p-8 max-w-[1400px] mx-auto flex flex-col items-center justify-center h-full min-h-[600px] text-center">
      <h1 className="text-4xl font-['VT323'] tracking-widest text-gray-500 dark:text-zinc-500 mb-4">{title}</h1>
      <p className="text-gray-400 dark:text-zinc-600 font-mono text-sm max-w-md">
        This workspace module is currently under development. Please check back later.
      </p>
    </div>
  );
}
