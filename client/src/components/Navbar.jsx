import React from 'react';
import { Sun, Moon, Languages, History, Settings, ExternalLink } from 'lucide-react';

export function Navbar({
  theme,
  toggleTheme,
  currentProvider,
  setCurrentProvider,
  historyCount,
  onOpenHistory,
  onOpenConfigModal
}) {
  const isDark = theme === 'dark';

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-white/80 dark:bg-slate-950/80 border-b border-slate-200/80 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
            <Languages className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 dark:from-white dark:via-indigo-100 dark:to-slate-200 bg-clip-text text-transparent">
                LinguaTranslate
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              Intelligent Full-Stack Translation
            </p>
          </div>
        </div>

        {/* Right side items: Provider selector, History, Config guide, Dark mode */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Provider selector pill */}
          <div className="flex items-center">
            <select
              id="provider-selector"
              value={currentProvider}
              onChange={(e) => setCurrentProvider(e.target.value)}
              aria-label="Select translation provider"
              className="text-xs font-medium py-1.5 px-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
            >
              <option value="google">Google Cloud Translation</option>
              <option value="mymemory">MyMemory Public API (Free)</option>
              <option value="azure">Azure Translator</option>
            </select>
          </div>

          {/* Setup / Config Guide Button */}
          <button
            type="button"
            id="open-config-btn"
            onClick={onOpenConfigModal}
            title="API Setup & Configuration Guide"
            aria-label="Open API Setup Guide"
            className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* History Drawer Trigger */}
          <button
            type="button"
            id="open-history-btn"
            onClick={onOpenHistory}
            title="Translation History"
            aria-label="Open Translation History"
            className="relative p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
          >
            <History className="w-4 h-4" />
            {historyCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white leading-none">
                {historyCount > 9 ? '9+' : historyCount}
              </span>
            )}
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            type="button"
            id="theme-toggle-btn"
            onClick={toggleTheme}
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            aria-label="Toggle dark/light theme"
            className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
