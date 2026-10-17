import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for Web Speech API Text-to-Speech Playback
 */
export function useSpeechSynthesis() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState([]);
  const currentUtteranceRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);

      const updateVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
      };

      updateVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = updateVoices;
      }
    } else {
      setIsSupported(false);
    }

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = useCallback((text, languageCode = 'en') => {
    if (!isSupported || !text || !text.trim()) return;

    window.speechSynthesis.cancel(); // Cancel any existing speech

    const utterance = new SpeechSynthesisUtterance(text);
    currentUtteranceRef.current = utterance;

    // Map short codes to BCP-47 prefixes
    const codePrefix = languageCode.split('-')[0].toLowerCase();

    // Try to find a matching voice
    if (voices.length > 0) {
      const matchedVoice = voices.find(v => {
        const vLang = v.lang.toLowerCase();
        return vLang === languageCode.toLowerCase() || vLang.startsWith(codePrefix);
      });

      if (matchedVoice) {
        utterance.voice = matchedVoice;
        utterance.lang = matchedVoice.lang;
      } else {
        utterance.lang = languageCode;
      }
    } else {
      utterance.lang = languageCode;
    }

    utterance.rate = 0.95; // Slightly measured pace for clarity
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsPlaying(true);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      currentUtteranceRef.current = null;
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      setIsPlaying(false);
      currentUtteranceRef.current = null;
    };

    window.speechSynthesis.speak(utterance);
  }, [isSupported, voices]);

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      currentUtteranceRef.current = null;
    }
  }, [isSupported]);

  return {
    speak,
    stop,
    isPlaying,
    isSupported
  };
}
