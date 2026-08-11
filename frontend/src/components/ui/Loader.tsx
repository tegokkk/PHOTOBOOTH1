import React from 'react';
import { cn } from '@/lib/utils';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export function Loader({ size = 'md', className, text }: LoaderProps) {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-20 h-20',
    lg: 'w-32 h-32'
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
      <div className={cn("scribble-loader", sizeClasses[size])}>
        <svg viewBox="25 25 50 50" className="w-full h-full">
          <circle cx="50" cy="50" r="20" fill="none" />
        </svg>
      </div>
      {text && (
        <p className="font-bold text-lg animate-pulse">{text}</p>
      )}
    </div>
  );
}
