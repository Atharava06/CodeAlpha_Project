import React, { useState } from 'react';
import { X, KeyRound, ExternalLink, Check, Copy, AlertTriangle, Sparkles } from 'lucide-react';

export function ConfigGuideModal({
  isOpen,
  onClose,
  currentProvider,
  setCurrentProvider,
  onToast
}) {
  const [activeTab, setActiveTab] = useState(currentProvider === 'azure' ? 'azure' : 'google');
  const [copiedKey, setCopiedKey] = useState(null);

  if (!isOpen) return null;

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    onToast({ type: 'info', message: 'Copied to clipboard' });
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const handleSwitchToMyMemory = () => {
    setCurrentProvider('mymemory');
    onToast({
      type: 'success',
      title: 'Provider Changed',
      message: 'Now using MyMemory Public API. No API key required!'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Translation API Setup & Guide
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure real translation providers in server/.env
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Switch Banner: Instant Testing with MyMemory */}
        <div className="mx-6 mt-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
                Want to test real translations immediately?
              </p>
              <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80">
                Switch to MyMemory Free Public API. Real responses, zero API keys required.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSwitchToMyMemory}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-sm transition-colors whitespace-nowrap self-start sm:self-auto"
          >
            Use Free MyMemory
          </button>
        </div>

        {/* Provider Tabs */}
        <div className="px-6 pt-4 flex gap-2 border-b border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('google')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'google'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            Google Cloud Translation
          </button>
          <button
            onClick={() => setActiveTab('azure')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'azure'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            Microsoft Azure Translator
          </button>
          <button
            onClick={() => setActiveTab('mymemory')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'mymemory'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            MyMemory (Public API)
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm text-slate-600 dark:text-slate-300">
          {activeTab === 'google' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 dark:text-white">
                  How to get your Google Cloud Translation API Key:
                </span>
                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium"
                >
                  <span>Google Cloud Console</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <ol className="list-decimal list-inside space-y-2 text-xs sm:text-sm pl-1">
                <li>Create or open a project in the <strong>Google Cloud Console</strong>.</li>
                <li>Go to <strong>APIs & Services &gt; Library</strong> and enable <strong>Cloud Translation API</strong>.</li>
                <li>Go to <strong>APIs & Services &gt; Credentials</strong> and click <strong>Create Credentials &gt; API Key</strong>.</li>
                <li>Copy your API key.</li>
                <li>Open your <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-mono text-xs">server/.env</code> file.</li>
                <li>Add your key:</li>
              </ol>

              <div className="relative p-3 rounded-xl bg-slate-100 dark:bg-slate-950 font-mono text-xs text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800">
                <span>GOOGLE_TRANSLATE_API_KEY=AIzaSyD...your_real_key_here</span>
                <button
                  onClick={() => copyToClipboard('GOOGLE_TRANSLATE_API_KEY=your_key_here', 'google-env')}
                  className="absolute right-2 top-2 p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800"
                >
                  {copiedKey === 'google-env' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <p className="text-xs text-slate-500">
                * Note: Google provides 500,000 characters free translation per month on the Cloud Translation API free tier.
              </p>
            </div>
          )}

          {activeTab === 'azure' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 dark:text-white">
                  How to get your Azure Translator API Credentials:
                </span>
                <a
                  href="https://portal.azure.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium"
                >
                  <span>Azure Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <ol className="list-decimal list-inside space-y-2 text-xs sm:text-sm pl-1">
                <li>Sign in to <strong>Microsoft Azure Portal</strong>.</li>
                <li>Create a <strong>Translator</strong> resource under Cognitive Services.</li>
                <li>Select the Free pricing tier (F0 - 2 million characters per month free).</li>
                <li>Go to <strong>Resource Management &gt; Keys and Endpoint</strong>.</li>
                <li>Copy <strong>Key 1</strong> and the <strong>Location/Region</strong>.</li>
                <li>Update your <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-mono text-xs">server/.env</code> file:</li>
              </ol>

              <div className="relative p-3 rounded-xl bg-slate-100 dark:bg-slate-950 font-mono text-xs text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 space-y-1">
                <div>AZURE_TRANSLATOR_KEY=your_azure_key_here</div>
                <div>AZURE_TRANSLATOR_REGION=eastus</div>
              </div>
            </div>
          )}

          {activeTab === 'mymemory' && (
            <div className="space-y-3">
              <span className="font-semibold text-slate-900 dark:text-white">
                MyMemory Translated.net Free Public API:
              </span>
              <p className="text-xs sm:text-sm">
                MyMemory is the world's largest translation memory service created by Translated.net.
                It provides a public API allowing real-time translation across 50+ languages without requiring any billing or API keys for standard testing.
              </p>
              <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 text-xs space-y-1">
                <p><strong>Configured out-of-the-box:</strong></p>
                <p>To set it as the server default, simply set <code className="font-mono bg-white/50 dark:bg-black/30 px-1 py-0.5 rounded">TRANSLATION_PROVIDER=mymemory</code> in your <code className="font-mono bg-white/50 dark:bg-black/30 px-1 py-0.5 rounded">server/.env</code>.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
