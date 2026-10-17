import express from 'express';
import { translationService, ConfigurationError, TranslationApiError } from '../services/translationService.js';
import { isValidLanguageCode } from '../languages.js';

const router = express.Router();

// Maximum character limit for translation requests
const MAX_TEXT_LENGTH = 5000;

/**
 * POST /api/translate
 * Translates text between source and target languages
 * 
 * Request body:
 * {
 *   "text": "Hello, how are you?",
 *   "sourceLanguage": "en" | "auto",
 *   "targetLanguage": "hi",
 *   "provider": "google" | "azure" | "mymemory" (optional)
 * }
 */
router.post('/translate', async (req, res) => {
  try {
    const { text, sourceLanguage = 'auto', targetLanguage, provider } = req.body;

    // 1. Validate 'text'
    if (text === undefined || text === null || typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'INVALID_INPUT',
        message: 'The "text" field is required and must be a string.'
      });
    }

    const trimmedText = text.trim();
    if (trimmedText.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'EMPTY_TEXT',
        message: 'The text to translate cannot be empty.'
      });
    }

    if (trimmedText.length > MAX_TEXT_LENGTH) {
      return res.status(400).json({
        success: false,
        error: 'TEXT_TOO_LONG',
        message: `Text exceeds the maximum allowed length of ${MAX_TEXT_LENGTH} characters. Received: ${trimmedText.length}.`
      });
    }

    // 2. Validate 'targetLanguage'
    if (!targetLanguage || typeof targetLanguage !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'INVALID_TARGET_LANGUAGE',
        message: 'The "targetLanguage" field is required and must be a valid language code.'
      });
    }

    if (targetLanguage === 'auto') {
      return res.status(400).json({
        success: false,
        error: 'INVALID_TARGET_LANGUAGE',
        message: 'Target language cannot be "auto". Please select a specific destination language.'
      });
    }

    if (!isValidLanguageCode(targetLanguage, false)) {
      return res.status(400).json({
        success: false,
        error: 'UNSUPPORTED_TARGET_LANGUAGE',
        message: `Target language '${targetLanguage}' is not recognized or supported.`
      });
    }

    // 3. Validate 'sourceLanguage'
    const normalizedSource = (sourceLanguage || 'auto').trim();
    if (!isValidLanguageCode(normalizedSource, true)) {
      return res.status(400).json({
        success: false,
        error: 'UNSUPPORTED_SOURCE_LANGUAGE',
        message: `Source language '${normalizedSource}' is not recognized or supported.`
      });
    }

    // 4. Quick return if source equals target and not auto
    if (normalizedSource !== 'auto' && normalizedSource === targetLanguage) {
      return res.status(200).json({
        success: true,
        translatedText: trimmedText,
        detectedLanguage: normalizedSource,
        provider: 'identity',
        providerDisplayName: 'Same Language'
      });
    }

    // 5. Execute translation via translation service
    const result = await translationService.translate(
      trimmedText,
      normalizedSource,
      targetLanguage,
      provider
    );

    return res.status(200).json({
      success: true,
      translatedText: result.translatedText,
      detectedLanguage: result.detectedLanguage,
      provider: result.provider,
      providerDisplayName: result.providerDisplayName
    });

  } catch (error) {
    if (error instanceof ConfigurationError) {
      return res.status(error.statusCode || 503).json({
        success: false,
        error: 'API_KEY_NOT_CONFIGURED',
        message: error.message,
        provider: error.provider,
        setupGuide: error.setupGuide
      });
    }

    if (error instanceof TranslationApiError) {
      return res.status(error.statusCode || 502).json({
        success: false,
        error: 'TRANSLATION_API_ERROR',
        message: error.message,
        provider: error.provider,
        details: process.env.NODE_ENV === 'development' ? error.details : undefined
      });
    }

    // Unexpected internal server error (never leak sensitive internals or stacks)
    console.error('[Translation Route Error]:', error.message || error);
    return res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected internal error occurred while processing the translation request.'
    });
  }
});

export default router;
