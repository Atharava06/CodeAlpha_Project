import React from 'react';
import { Globe2, ShieldCheck, Heart } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../languages';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const languagesCount = SUPPORTED_LANGUAGES.length;

  return (
    <footer className="mt-auto border-t border-slate-200/80 dark:border-slate-800 py-6 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 dark:text-slate-400">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left: Language support info */}
        <div className="flex items-center gap-2">
          <Globe2 className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
          <span>
            Supporting <strong>{languagesCount}+ global languages</strong> with auto-detection & neural audio.
          </span>
        </div>

        {/* Center: Security / Privacy assurance */}
        <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Secure server-side API processing &bull; Zero credential leaks</span>
        </div>

        {/* Right: Copyright */}
        <div className="flex items-center gap-1">
          <span>&copy; {currentYear} LinguaTranslate. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
