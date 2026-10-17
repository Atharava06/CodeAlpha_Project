import React, { useState } from 'react';
import { Copy, Check, Volume2, VolumeX, Share2, Download, Loader2 } from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';
import { POPULAR_TARGET_CODES, LANGUAGE_MAP } from '../languages';

export function TranslationPanel({
  targetLanguage,
  setTargetLanguage,
  translatedText,
  isLoading,
  providerDisplayName,
  onSpeak,
  onStopSpeak,
  isSpeaking,
  ttsSupported,
  onToast
}) {
  const [copied, setCopied] = useState(false);

  const targetLangMeta = LANGUAGE_MAP[targetLanguage];
  const isRTL = targetLangMeta?.dir === 'rtl';

  const handleCopy = async () => {
    if (!translatedText) return;
    try {
      await navigator.clipboard.writeText(translatedText);
      setCopied(true);
      onToast({ type: 'success', title: 'Copied!', message: 'Translation copied to clipboard' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      onToast({ type: 'error', message: 'Failed to copy to clipboard' });
    }
  };

  const handleShare = async () => {
    if (!translatedText) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'LinguaTranslate Translation',
          text: translatedText
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          handleCopy();
        }
      }
    } else {
      handleCopy();
    }
  };

  const handleDownload = () => {
    if (!translatedText) return;
    const blob = new Blob([translatedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `translation-${targetLanguage}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    onToast({ type: 'info', message: 'Translation downloaded as text file' });
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-soft transition-all duration-200">
      {/* Top Header: Language Selector */}
      <div className="p-3.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <LanguageSelector
          id="target-lang-select"
          selectedCode={targetLanguage}
          onChange={setTargetLanguage}
          isSource={false}
          popularCodes={POPULAR_TARGET_CODES}
        />
        {providerDisplayName && (
          <span className="hidden sm:inline-block text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
            {providerDisplayName}
          </span>
        )}
      </div>

      {/* Main Translated Text Display */}
      <div className="relative flex-1 p-4 flex flex-col min-h-[200px] sm:min-h-[250px] overflow-y-auto">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 py-10 text-slate-400 dark:text-slate-500 animate-pulse">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-sm font-medium">Translating text...</p>
          </div>
        ) : translatedText ? (
          <div
            id="translated-text-output"
            dir={isRTL ? 'rtl' : 'ltr'}
            className={`flex-1 text-slate-800 dark:text-slate-100 text-base sm:text-lg leading-relaxed font-sans whitespace-pre-wrap select-text animate-fade-in ${
              isRTL ? 'font-serif text-right' : ''
            }`}
          >
            {translatedText}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400 dark:text-slate-500 select-none">
            <p className="text-sm">Translation will appear here</p>
            <p className="text-xs text-slate-400/80 dark:text-slate-600 mt-1">
              Select languages, enter text, and press Translate
            </p>
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="px-4 py-3 bg-slate-50/60 dark:bg-slate-900/60 rounded-b-2xl border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        {/* Left Actions: TTS Audio, Copy, Share, Download */}
        <div className="flex items-center gap-1">
          {/* Text to Speech Button */}
          {ttsSupported && (
            <button
              type="button"
              id="speech-tts-button"
              disabled={!translatedText || isLoading}
              onClick={isSpeaking ? onStopSpeak : () => onSpeak(translatedText, targetLanguage)}
              title={isSpeaking ? "Stop playback" : "Listen to translation"}
              aria-label={isSpeaking ? "Stop audio" : "Listen to translated text"}
              className={`p-2 rounded-xl transition-all duration-200 ${
                isSpeaking
                  ? 'bg-indigo-600 text-white shadow-md animate-pulse ring-4 ring-indigo-400/30'
                  : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-200/60 dark:hover:bg-slate-800 dark:text-slate-400 dark:hover:text-indigo-400 disabled:opacity-30 disabled:pointer-events-none'
              }`}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          )}

          {/* Copy Button */}
          <button
            type="button"
            id="copy-translation-button"
            disabled={!translatedText || isLoading}
            onClick={handleCopy}
            title="Copy translation"
            aria-label="Copy translated text"
            className={`p-2 rounded-xl transition-colors ${
              copied
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-200/60 dark:hover:bg-slate-800 dark:text-slate-400 dark:hover:text-indigo-400 disabled:opacity-30 disabled:pointer-events-none'
            }`}
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          {/* Share Button */}
          <button
            type="button"
            id="share-translation-button"
            disabled={!translatedText || isLoading}
            onClick={handleShare}
            title="Share translation"
            aria-label="Share translated text"
            className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-slate-200/60 dark:hover:bg-slate-800 dark:text-slate-400 dark:hover:text-indigo-400 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Download Button */}
          <button
            type="button"
            id="download-translation-button"
            disabled={!translatedText || isLoading}
            onClick={handleDownload}
            title="Download translation text file"
            aria-label="Download translation as text"
            className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-slate-200/60 dark:hover:bg-slate-800 dark:text-slate-400 dark:hover:text-indigo-400 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>

        {/* Right Info: Character count of translation */}
        {translatedText && (
          <div className="text-xs font-mono text-slate-400 dark:text-slate-500">
            {translatedText.length.toLocaleString()} chars
          </div>
        )}
      </div>
    </div>
  );
}
