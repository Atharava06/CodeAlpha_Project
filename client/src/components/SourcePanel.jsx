import React from 'react';
import { Mic, MicOff, X, Clipboard, Sparkles } from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';
import { POPULAR_SOURCE_CODES, LANGUAGE_MAP } from '../languages';

const MAX_CHARS = 5000;

const SAMPLE_PROMPTS = [
  "Hello, how are you today?",
  "Where is the nearest train station?",
  "Thank you very much for your kind help!",
  "Could you please recommend a good local restaurant?"
];

export function SourcePanel({
  sourceLanguage,
  setSourceLanguage,
  sourceText,
  setSourceText,
  detectedLanguage,
  isListening,
  onStartListening,
  onStopListening,
  speechSupported,
  onClear,
  onToast
}) {
  const charCount = sourceText.length;
  const isNearLimit = charCount > MAX_CHARS * 0.9;
  const isOverLimit = charCount > MAX_CHARS;

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setSourceText(text);
        onToast({ type: 'info', message: 'Text pasted from clipboard' });
      }
    } catch {
      onToast({ type: 'error', message: 'Could not access clipboard' });
    }
  };

  const detectedLanguageName = detectedLanguage && LANGUAGE_MAP[detectedLanguage]?.name;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-soft transition-all duration-200 focus-within:ring-2 focus-within:ring-indigo-500/40 focus-within:border-indigo-500">
      {/* Top Header: Language Selector */}
      <div className="p-3.5 border-b border-slate-100 dark:border-slate-800/80">
        <LanguageSelector
          id="source-lang-select"
          selectedCode={sourceLanguage}
          onChange={setSourceLanguage}
          isSource={true}
          popularCodes={POPULAR_SOURCE_CODES}
        />
        {/* Detected language banner if auto-detect was used */}
        {sourceLanguage === 'auto' && detectedLanguageName && (
          <div className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1.5 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Detected language: <strong>{detectedLanguageName}</strong></span>
          </div>
        )}
      </div>

      {/* Main Text Area */}
      <div className="relative flex-1 p-4 flex flex-col min-h-[200px] sm:min-h-[250px]">
        <textarea
          id="source-text-input"
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
          placeholder="Enter or paste text to translate..."
          aria-label="Source text to translate"
          maxLength={MAX_CHARS + 100}
          className="w-full flex-1 bg-transparent resize-none border-none outline-none text-slate-800 dark:text-slate-100 text-base sm:text-lg leading-relaxed placeholder:text-slate-400 dark:placeholder:text-slate-500 font-sans"
        />

        {/* Empty state sample suggestions */}
        {!sourceText && (
          <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800/60">
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-2 font-medium">
              Try an example prompt:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSourceText(prompt)}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-slate-700/80 transition-colors text-left"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="px-4 py-3 bg-slate-50/60 dark:bg-slate-900/60 rounded-b-2xl border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        {/* Left Actions: Voice input, Paste, Clear */}
        <div className="flex items-center gap-1">
          {/* Speech Input / Microphone Button */}
          {speechSupported && (
            <button
              type="button"
              id="speech-mic-button"
              onClick={isListening ? onStopListening : onStartListening}
              title={isListening ? "Stop listening" : "Voice input (Speak to enter text)"}
              aria-label={isListening ? "Stop microphone" : "Start voice recognition"}
              className={`p-2 rounded-xl transition-all duration-200 relative ${
                isListening
                  ? 'bg-rose-500 text-white shadow-md animate-pulse ring-4 ring-rose-400/30'
                  : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-200/60 dark:hover:bg-slate-800 dark:text-slate-400 dark:hover:text-indigo-400'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              {isListening && (
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                </span>
              )}
            </button>
          )}

          {/* Paste button */}
          <button
            type="button"
            id="paste-text-button"
            onClick={handlePaste}
            title="Paste from clipboard"
            aria-label="Paste from clipboard"
            className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-slate-200/60 dark:hover:bg-slate-800 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
          >
            <Clipboard className="w-4 h-4" />
          </button>

          {/* Clear button */}
          {sourceText && (
            <button
              type="button"
              id="clear-source-text-button"
              onClick={onClear}
              title="Clear text"
              aria-label="Clear source text"
              className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 dark:text-slate-400 dark:hover:text-rose-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Right Action: Character Counter */}
        <div className={`text-xs font-mono font-medium ${
          isOverLimit
            ? 'text-rose-600 font-bold dark:text-rose-400'
            : isNearLimit
            ? 'text-amber-600 dark:text-amber-400'
            : 'text-slate-400 dark:text-slate-500'
        }`}>
          {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
        </div>
      </div>
    </div>
  );
}
