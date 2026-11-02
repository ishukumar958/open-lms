import React from 'react';
import { cn } from '../../lib/utils';
import { X } from 'lucide-react';

export function Modal({ isOpen, onClose, title, description, children, maxWidth = 'max-w-md' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-navy-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className={cn(
          'relative w-full max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl shadow-hero border border-ink-border p-4 sm:p-6 z-10 transition-all transform animate-in fade-in zoom-in-95 duration-200',
          maxWidth
        )}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            {title && <h3 className="text-lg font-bold text-ink">{title}</h3>}
            {description && (
              <p className="text-sm text-ink-muted mt-1">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-ink-muted hover:text-ink hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
