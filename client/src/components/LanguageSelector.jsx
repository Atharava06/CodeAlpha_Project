import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search, Check, Globe } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../languages';

export function LanguageSelector({
  selectedCode,
  onChange,
  isSource = false,
  popularCodes = [],
  id = 'lang-selector'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const popoverRef = useRef(null);
  const searchInputRef = useRef(null);

  // Filter available languages
  const availableLanguages = useMemo(() => {
    return SUPPORTED_LANGUAGES.filter(lang => {
      if (!isSource && lang.isSourceOnly) return false;
      return true;
    });
  }, [isSource]);

  const selectedLang = useMemo(() => {
    return availableLanguages.find(l => l.code === selectedCode) || availableLanguages[0];
  }, [availableLanguages, selectedCode]);

  // Filter by search query
  const filteredLanguages = useMemo(() => {
    if (!searchQuery.trim()) return availableLanguages;
    const q = searchQuery.toLowerCase().trim();
    return availableLanguages.filter(
      l => l.name.toLowerCase().includes(q) ||
           l.nativeName.toLowerCase().includes(q) ||
           l.code.toLowerCase().includes(q)
    );
  }, [availableLanguages, searchQuery]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (code) => {
    onChange(code);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="relative w-full" ref={popoverRef}>
      {/* Quick Pills + Dropdown Trigger Bar */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Popular quick pills */}
        <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none max-w-full">
          {popularCodes.map((code) => {
            const lang = availableLanguages.find(l => l.code === code);
            if (!lang) return null;
            const isSelected = selectedCode === code;

            return (
              <button
                key={code}
                type="button"
                onClick={() => onChange(code)}
                className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all duration-150 whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-400/40 dark:ring-indigo-500/50'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800'
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            );
          })}
        </div>

        {/* Dropdown Opener Button */}
        <button
          type="button"
          id={id}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg border transition-all duration-150 ${
            isOpen
              ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300'
              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm'
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
          <span className="font-medium truncate max-w-[110px] sm:max-w-[140px]">
            {selectedLang?.name || 'Select'}
          </span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Dropdown Menu Modal / Popover */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-40 w-full sm:w-80 md:w-96 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl animate-fade-in">
          {/* Search Input */}
          <div className="relative mb-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search 40+ languages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-100 dark:bg-slate-800/80 rounded-xl border-none outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
            />
          </div>

          {/* Languages List */}
          <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
            {filteredLanguages.length === 0 ? (
              <p className="text-center py-6 text-xs text-slate-500 dark:text-slate-400">
                No matching languages found
              </p>
            ) : (
              filteredLanguages.map((lang) => {
                const isSelected = selectedCode === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleSelect(lang.code)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-sm transition-colors ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg leading-none">{lang.flag}</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span>{lang.name}</span>
                          {lang.isSourceOnly && (
                            <span className="text-[10px] px-1.5 py-0.2 bg-slate-200 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-300">
                              Detect
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 dark:text-slate-500">
                          {lang.nativeName}
                        </div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
