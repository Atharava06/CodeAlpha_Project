import React from 'react';
import { ArrowLeftRight, Sparkles, Trash2, Loader2, Zap } from 'lucide-react';

export function ControlsBar({
  onTranslate,
  onSwapLanguages,
  onClearAll,
  isLoading,
  canTranslate,
  canSwap,
  isSwapping,
  autoTranslate,
  setAutoTranslate
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-2 px-1">
      {/* Left controls: Swap button + Auto translate toggle */}
      <div className="flex items-center gap-2">
        {/* Swap button */}
        <button
          type="button"
          id="swap-languages-btn"
          disabled={!canSwap || isLoading}
          onClick={onSwapLanguages}
          title="Swap languages (Ctrl+Shift+S)"
          aria-label="Swap source and target languages"
          className="group flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 disabled:opacity-40 disabled:pointer-events-none shadow-sm transition-all duration-200 active:scale-95"
        >
          <ArrowLeftRight
            className={`w-4 h-4 text-indigo-600 dark:text-indigo-400 transition-transform duration-300 ${
              isSwapping ? 'rotate-180' : 'group-hover:rotate-180'
            }`}
          />
          <span className="hidden sm:inline">Swap Languages</span>
        </button>

        {/* Clear All button */}
        <button
          type="button"
          id="clear-all-btn"
          onClick={onClearAll}
          disabled={isLoading}
          title="Clear both source and translated text"
          aria-label="Clear all text"
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl border border-transparent text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:text-slate-400 dark:hover:text-rose-400 dark:hover:bg-rose-950/30 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          <span className="hidden sm:inline">Clear All</span>
        </button>

        {/* Auto translate toggle */}
        <button
          type="button"
          id="auto-translate-toggle"
          onClick={() => setAutoTranslate(!autoTranslate)}
          title="Toggle instant translation while typing"
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border transition-all ${
            autoTranslate
              ? 'border-indigo-300 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 shadow-sm'
              : 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Zap className={`w-3.5 h-3.5 ${autoTranslate ? 'text-indigo-600 dark:text-indigo-400 fill-indigo-600 dark:fill-indigo-400' : 'text-slate-400'}`} />
          <span>Instant: {autoTranslate ? 'On' : 'Off'}</span>
        </button>
      </div>

      {/* Right controls: Translate Button */}
      <div className="flex items-center gap-2 ml-auto">
        <span className="hidden md:inline-block text-[11px] text-slate-400 dark:text-slate-500 font-mono">
          Ctrl + Enter to translate
        </span>

        <button
          type="button"
          id="translate-button"
          disabled={!canTranslate || isLoading}
          onClick={onTranslate}
          className={`relative flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-white shadow-md transition-all duration-200 active:scale-95 ${
            isLoading
              ? 'bg-indigo-500 cursor-wait opacity-90'
              : !canTranslate
              ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-500 shadow-none cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Translating...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Translate</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
