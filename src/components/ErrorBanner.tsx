import React from 'react';
import { AlertCircle, RefreshCw, X, RotateCcw } from 'lucide-react';

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  onSelectDefault?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  message,
  onRetry,
  onDismiss,
  onSelectDefault,
}) => {
  return (
    <div className="relative overflow-hidden rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-slate-100 shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-rose-200">
              Weather Intelligence Notice
            </h4>
            <p className="mt-1 text-xs text-rose-300 leading-relaxed max-w-xl">
              {message}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="flex items-center gap-1.5 rounded-lg bg-rose-500/20 px-3 py-1.5 text-xs font-medium text-rose-200 ring-1 ring-rose-500/30 hover:bg-rose-500/30 transition-colors"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Retry Request</span>
                </button>
              )}

              {onSelectDefault && (
                <button
                  type="button"
                  onClick={onSelectDefault}
                  className="flex items-center gap-1.5 rounded-lg bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-300 ring-1 ring-slate-700/80 hover:bg-slate-800 transition-colors"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Load Tokyo Weather Baseline</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="rounded p-1 text-rose-400 hover:text-rose-200 transition-colors"
            title="Dismiss notice"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};
