import React from 'react';
import { X, Trash2, ArrowRight, Copy, RotateCcw, Clock } from 'lucide-react';
import { LANGUAGE_MAP } from '../languages';

export function HistoryDrawer({
  isOpen,
  onClose,
  history,
  onSelectHistoryItem,
  onClearHistory,
  onToast
}) {
  if (!isOpen) return null;

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    onToast({ type: 'info', message: 'Copied to clipboard' });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col animate-slide-left">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-slate-900 dark:text-white">
              Recent Translations
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
              {history.length}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {history.length > 0 && (
              <button
                type="button"
                onClick={onClearHistory}
                title="Clear all history"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Clock className="w-10 h-10 stroke-[1.5] mb-2 opacity-50" />
              <p className="text-sm font-medium">No translation history yet</p>
              <p className="text-xs text-slate-400/80 mt-1">
                Your completed translations will automatically be saved here
              </p>
            </div>
          ) : (
            history.map((item) => {
              const srcName = LANGUAGE_MAP[item.sourceLanguage]?.name || item.sourceLanguage;
              const tgtName = LANGUAGE_MAP[item.targetLanguage]?.name || item.targetLanguage;
              const srcFlag = LANGUAGE_MAP[item.sourceLanguage]?.flag || '🌐';
              const tgtFlag = LANGUAGE_MAP[item.targetLanguage]?.flag || '🌐';

              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all duration-150 space-y-2 group"
                >
                  {/* Language bar & timestamp */}
                  <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <span>{srcFlag} {srcName}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span>{tgtFlag} {tgtName}</span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Source snippet */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 italic">
                    "{item.sourceText}"
                  </p>

                  {/* Translated snippet */}
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 line-clamp-2">
                    {item.translatedText}
                  </p>

                  {/* Actions */}
                  <div className="pt-1 flex items-center justify-between border-t border-slate-200/50 dark:border-slate-700/50 text-xs">
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                      {item.provider || 'translation'}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => copyText(item.translatedText)}
                        title="Copy translated text"
                        className="p-1 rounded text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200/50 dark:hover:bg-slate-700"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectHistoryItem(item);
                          onClose();
                        }}
                        title="Load into editor"
                        className="p-1 rounded text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200/50 dark:hover:bg-slate-700 flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Load</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
