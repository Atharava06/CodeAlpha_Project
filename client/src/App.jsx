import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { SourcePanel } from './components/SourcePanel';
import { TranslationPanel } from './components/TranslationPanel';
import { ControlsBar } from './components/ControlsBar';
import { ConfigGuideModal } from './components/ConfigGuideModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { Toast } from './components/Toast';
import { Footer } from './components/Footer';
import { useTheme } from './hooks/useTheme';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';
import { translateText, fetchServerStatus } from './services/api';
import { Sparkles, AlertCircle, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export default function App() {
  // Theme management
  const { theme, toggleTheme } = useTheme();

  // Translation state
  const [sourceLanguage, setSourceLanguage] = useState('auto');
  const [targetLanguage, setTargetLanguage] = useState('hi');
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [providerDisplayName, setProviderDisplayName] = useState('');
  const [currentProvider, setCurrentProvider] = useState('google');
  const [serverStatus, setServerStatus] = useState(null);
  const [isSwapping, setIsSwapping] = useState(false);
  const [autoTranslate, setAutoTranslate] = useState(false);

  // Modals & Drawers
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);

  // Translation History (stored in localStorage)
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('lingua_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Toast notification management
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback(({ type = 'info', title = '', message = '' }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('lingua_history', JSON.stringify(history.slice(0, 50)));
    } catch (e) {
      console.warn('Could not save translation history:', e);
    }
  }, [history]);

  // Fetch server status on initial mount
  useEffect(() => {
    async function checkServer() {
      const status = await fetchServerStatus();
      if (status) {
        setServerStatus(status);
        if (status.activeProvider) {
          setCurrentProvider(status.activeProvider);
        }
      }
    }
    checkServer();
  }, []);

  // Speech Recognition (Speech to Text)
  const handleSpeechTranscript = useCallback((transcript) => {
    setSourceText((prev) => {
      const separator = prev && !prev.endsWith(' ') ? ' ' : '';
      return prev + separator + transcript;
    });
  }, []);

  const handleSpeechError = useCallback((errMessage) => {
    addToast({ type: 'error', title: 'Microphone Error', message: errMessage });
  }, [addToast]);

  const {
    isListening,
    isSupported: speechSupported,
    startListening,
    stopListening
  } = useSpeechRecognition({
    onTranscript: handleSpeechTranscript,
    onError: handleSpeechError
  });

  // Speech Synthesis (Text to Speech)
  const {
    speak,
    stop: stopSpeak,
    isPlaying: isSpeaking,
    isSupported: ttsSupported
  } = useSpeechSynthesis();

  // Core Translation Function
  const handleTranslate = useCallback(async () => {
    const textToTranslate = sourceText.trim();
    if (!textToTranslate) {
      addToast({ type: 'error', message: 'Please enter text to translate.' });
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    stopSpeak();

    try {
      const result = await translateText({
        text: textToTranslate,
        sourceLanguage,
        targetLanguage,
        provider: currentProvider
      });

      setTranslatedText(result.translatedText);
      setDetectedLanguage(result.detectedLanguage);
      setProviderDisplayName(result.providerDisplayName || result.provider);

      // Add to history
      const newHistoryItem = {
        id: Date.now().toString(),
        sourceText: textToTranslate,
        translatedText: result.translatedText,
        sourceLanguage: result.detectedLanguage || sourceLanguage,
        targetLanguage,
        provider: result.providerDisplayName || result.provider,
        timestamp: new Date().toISOString()
      };
      setHistory((prev) => [newHistoryItem, ...prev.filter(item => item.sourceText !== textToTranslate)]);

    } catch (error) {
      console.error('Translation error:', error);

      if (error.code === 'API_KEY_NOT_CONFIGURED') {
        addToast({
          type: 'error',
          title: 'API Key Required',
          message: error.message || 'Google Cloud Translation API key is not configured.'
        });
        setIsConfigModalOpen(true);
      } else {
        addToast({
          type: 'error',
          title: 'Translation Failed',
          message: error.message || 'An error occurred while connecting to the translation service.'
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [sourceText, sourceLanguage, targetLanguage, currentProvider, isLoading, addToast, stopSpeak]);

  // Debounced Auto-Translate when user types
  const debounceTimerRef = useRef(null);
  useEffect(() => {
    if (!autoTranslate) return;
    if (!sourceText.trim()) {
      setTranslatedText('');
      return;
    }

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      handleTranslate();
    }, 700);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [sourceText, sourceLanguage, targetLanguage, currentProvider, autoTranslate, handleTranslate]);

  // Swap Languages Handler
  const handleSwapLanguages = () => {
    if (sourceLanguage === 'auto') {
      addToast({
        type: 'info',
        message: 'Cannot swap when "Auto Detect" is selected as source language.'
      });
      return;
    }

    setIsSwapping(true);
    setTimeout(() => setIsSwapping(false), 300);

    const oldSource = sourceLanguage;
    const oldTarget = targetLanguage;
    const oldSourceText = sourceText;
    const oldTranslatedText = translatedText;

    setSourceLanguage(oldTarget);
    setTargetLanguage(oldSource);
    setSourceText(oldTranslatedText);
    setTranslatedText(oldSourceText);
    setDetectedLanguage(null);
  };

  // Clear All Handler
  const handleClearAll = () => {
    setSourceText('');
    setTranslatedText('');
    setDetectedLanguage(null);
    stopSpeak();
    if (isListening) stopListening();
  };

  // Keyboard Shortcuts Handler (Ctrl+Enter to translate, Ctrl+Shift+S to swap)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleTranslate();
      } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'S' || e.key === 's')) {
        e.preventDefault();
        handleSwapLanguages();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTranslate]);

  const canTranslate = Boolean(sourceText.trim());
  const canSwap = sourceLanguage !== 'auto';

  // Check if current provider has missing key warning
  const isGoogleUnconfigured = currentProvider === 'google' && serverStatus?.providers?.google?.isConfigured === false;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      {/* Toast Notifications */}
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* Navigation Bar */}
      <Navbar
        theme={theme}
        toggleTheme={toggleTheme}
        currentProvider={currentProvider}
        setCurrentProvider={setCurrentProvider}
        historyCount={history.length}
        onOpenHistory={() => setIsHistoryDrawerOpen(true)}
        onOpenConfigModal={() => setIsConfigModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-6">
        
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold text-indigo-700 dark:text-indigo-300 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>AI-Powered Multi-Language Neural Engine</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Break Language <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 bg-clip-text text-transparent">Barriers</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Translate text between languages instantly with voice recognition, neural speech playback, and auto-detection.
          </p>
        </div>

        {/* Unconfigured API Key Alert Banner (if Google selected without key) */}
        {isGoogleUnconfigured && (
          <div className="max-w-4xl mx-auto w-full p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 dark:text-amber-200 animate-slide-up">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm">
                <span className="font-semibold">Google Cloud Translation API key is not yet set in server/.env.</span>
                <p className="text-amber-700/80 dark:text-amber-300/80 mt-0.5">
                  You can set your key in .env or switch to the free MyMemory Public API to test immediately.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  setCurrentProvider('mymemory');
                  addToast({ type: 'success', message: 'Switched to MyMemory Free Public API!' });
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs transition-colors shadow-sm"
              >
                Use Free Public API
              </button>
              <button
                type="button"
                onClick={() => setIsConfigModalOpen(true)}
                className="px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-900 dark:text-amber-100 font-medium text-xs transition-colors"
              >
                Setup Guide
              </button>
            </div>
          </div>
        )}

        {/* Translation Workspace Container */}
        <div className="flex-1 flex flex-col gap-4">
          
          {/* Action Bar (Swap, Clear All, Auto-translate toggle, Translate Button) */}
          <ControlsBar
            onTranslate={handleTranslate}
            onSwapLanguages={handleSwapLanguages}
            onClearAll={handleClearAll}
            isLoading={isLoading}
            canTranslate={canTranslate}
            canSwap={canSwap}
            isSwapping={isSwapping}
            autoTranslate={autoTranslate}
            setAutoTranslate={setAutoTranslate}
          />

          {/* Two Large Side-by-Side Translation Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 flex-1 min-h-[400px]">
            {/* Source Panel */}
            <SourcePanel
              sourceLanguage={sourceLanguage}
              setSourceLanguage={setSourceLanguage}
              sourceText={sourceText}
              setSourceText={setSourceText}
              detectedLanguage={detectedLanguage}
              isListening={isListening}
              onStartListening={() => startListening(sourceLanguage)}
              onStopListening={stopListening}
              speechSupported={speechSupported}
              onClear={() => setSourceText('')}
              onToast={addToast}
            />

            {/* Translation Panel */}
            <TranslationPanel
              targetLanguage={targetLanguage}
              setTargetLanguage={setTargetLanguage}
              translatedText={translatedText}
              isLoading={isLoading}
              providerDisplayName={providerDisplayName}
              onSpeak={speak}
              onStopSpeak={stopSpeak}
              isSpeaking={isSpeaking}
              ttsSupported={ttsSupported}
              onToast={addToast}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* API Configuration Modal */}
      <ConfigGuideModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        currentProvider={currentProvider}
        setCurrentProvider={setCurrentProvider}
        onToast={addToast}
      />

      {/* Translation History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        history={history}
        onSelectHistoryItem={(item) => {
          setSourceLanguage(item.sourceLanguage);
          setTargetLanguage(item.targetLanguage);
          setSourceText(item.sourceText);
          setTranslatedText(item.translatedText);
          addToast({ type: 'info', message: 'Translation restored from history' });
        }}
        onClearHistory={() => {
          setHistory([]);
          localStorage.removeItem('lingua_history');
          addToast({ type: 'info', message: 'History cleared' });
        }}
        onToast={addToast}
      />
    </div>
  );
}
