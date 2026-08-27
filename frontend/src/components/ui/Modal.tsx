import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusedElementRef = useRef<HTMLElement | null>(null);
  const titleId = title ? 'modal-title' : undefined;

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      previousFocusedElementRef.current = document.activeElement as HTMLElement | null;
      const previousOverflow = document.body.style.overflow;
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => dialogRef.current?.focus());

      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = previousOverflow;
        previousFocusedElementRef.current?.focus();
      };
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity"
    >
      <div
        ref={overlayRef}
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        className={cn(
          "relative z-[101] w-full max-w-md bg-paper-white p-6 sketch-border hard-shadow-lg",
          "animate-in fade-in zoom-in-95 duration-200",
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <div className="flex items-center justify-between mb-4">
          {title && <h2 id={titleId} className="text-xl font-bold">{title}</h2>}
          <Button 
            variant="outline" 
            size="icon" 
            onClick={onClose}
            className="rounded-full hover:bg-black/5"
            aria-label="Close modal"
          >
            <X className="size-5" />
          </Button>
        </div>
        <div className="mt-2">
          {children}
        </div>
      </div>
    </div>
  );
}
