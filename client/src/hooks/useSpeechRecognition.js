import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for Web Speech API Speech-to-Text (Microphone input)
 */
export function useSpeechRecognition({ onTranscript, onError } = {}) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const startListening = useCallback((languageCode = 'en-US') => {
    if (!recognitionRef.current) {
      if (onError) onError('Speech recognition is not supported in this browser.');
      return;
    }

    try {
      const recognition = recognitionRef.current;
      // Map simplified codes to BCP 47
      const langMap = {
        'auto': 'en-US',
        'en': 'en-US',
        'hi': 'hi-IN',
        'mr': 'mr-IN',
        'es': 'es-ES',
        'fr': 'fr-FR',
        'de': 'de-DE',
        'ja': 'ja-JP',
        'zh': 'zh-CN',
        'zh-TW': 'zh-TW',
        'ar': 'ar-SA',
        'pt': 'pt-BR',
        'ru': 'ru-RU',
        'it': 'it-IT',
        'ko': 'ko-KR',
      };

      recognition.lang = langMap[languageCode] || languageCode || 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (onTranscript) {
          onTranscript(transcript);
        }
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        if (event.error !== 'no-speech') {
          if (onError) onError(`Speech recognition error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      setIsListening(false);
      if (onError) onError(err.message || 'Could not start microphone');
    }
  }, [onTranscript, onError]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  return {
    isListening,
    isSupported,
    startListening,
    stopListening
  };
}
