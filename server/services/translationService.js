import dotenv from 'dotenv';
dotenv.config();

/**
 * Custom Error for missing or invalid API configurations
 */
export class ConfigurationError extends Error {
  constructor(message, provider, setupGuide) {
    super(message);
    this.name = 'ConfigurationError';
    this.provider = provider;
    this.setupGuide = setupGuide;
    this.statusCode = 503;
  }
}

/**
 * Custom Error for provider API failures
 */
export class TranslationApiError extends Error {
  constructor(message, provider, statusCode = 502, details = null) {
    super(message);
    this.name = 'TranslationApiError';
    this.provider = provider;
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Google Cloud Translation API Provider (v2 REST API)
 */
class GoogleTranslationProvider {
  constructor() {
    this.name = 'google';
    this.displayName = 'Google Cloud Translation API';
  }

  isConfigured() {
    const key = process.env.GOOGLE_TRANSLATE_API_KEY;
    return Boolean(key && key.trim() !== '' && !key.includes('your_google_cloud_api_key_here'));
  }

  async translate(text, sourceLanguage, targetLanguage) {
    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
    if (!this.isConfigured()) {
      throw new ConfigurationError(
        'Google Cloud Translation API key is not configured. Please supply a valid GOOGLE_TRANSLATE_API_KEY in server/.env, or switch TRANSLATION_PROVIDER=mymemory in .env for zero-config public translation.',
        this.name,
        {
          step1: 'Sign in to Google Cloud Console (https://console.cloud.google.com)',
          step2: 'Enable the Cloud Translation API in your project',
          step3: 'Generate an API key under APIs & Services > Credentials',
          step4: 'Add GOOGLE_TRANSLATE_API_KEY=your_key in server/.env and restart the server',
          fallbackTip: 'To test immediately with real translations without billing, set TRANSLATION_PROVIDER=mymemory in server/.env'
        }
      );
    }

    const url = `https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(apiKey.trim())}`;
    
    const requestBody = {
      q: text,
      target: targetLanguage,
      format: 'text'
    };

    if (sourceLanguage && sourceLanguage !== 'auto') {
      requestBody.source = sourceLanguage;
    }

    let response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
    } catch (networkErr) {
      throw new TranslationApiError(
        `Failed to connect to Google Cloud Translation API: ${networkErr.message}`,
        this.name,
        503,
        networkErr.message
      );
    }

    const data = await response.json();

    if (!response.ok) {
      const errMessage = data?.error?.message || 'Google Translation API request failed.';
      const errStatus = response.status;
      throw new TranslationApiError(
        `Google Cloud Translation error (${errStatus}): ${errMessage}`,
        this.name,
        errStatus >= 500 ? 502 : 400,
        data?.error
      );
    }

    const translation = data?.data?.translations?.[0];
    if (!translation) {
      throw new TranslationApiError('No translation data returned from Google Cloud Translation API.', this.name);
    }

    return {
      translatedText: translation.translatedText,
      detectedLanguage: translation.detectedSourceLanguage || (sourceLanguage !== 'auto' ? sourceLanguage : null),
      provider: this.name,
      providerDisplayName: this.displayName
    };
  }
}

/**
 * Microsoft Azure Translator Provider (Cognitive Services)
 */
class AzureTranslationProvider {
  constructor() {
    this.name = 'azure';
    this.displayName = 'Microsoft Azure Translator';
  }

  isConfigured() {
    const key = process.env.AZURE_TRANSLATOR_KEY;
    const region = process.env.AZURE_TRANSLATOR_REGION;
    return Boolean(
      key && key.trim() !== '' && !key.includes('your_azure_translator_key_here') &&
      region && region.trim() !== ''
    );
  }

  async translate(text, sourceLanguage, targetLanguage) {
    if (!this.isConfigured()) {
      throw new ConfigurationError(
        'Microsoft Azure Translator credentials are not configured. Please supply AZURE_TRANSLATOR_KEY and AZURE_TRANSLATOR_REGION in server/.env.',
        this.name,
        {
          step1: 'Sign in to the Azure Portal (https://portal.azure.com)',
          step2: 'Create a Translator resource (Cognitive Services)',
          step3: 'Obtain Key 1 and Location/Region from Keys and Endpoint tab',
          step4: 'Add AZURE_TRANSLATOR_KEY and AZURE_TRANSLATOR_REGION in server/.env and restart server'
        }
      );
    }

    const key = process.env.AZURE_TRANSLATOR_KEY.trim();
    const region = process.env.AZURE_TRANSLATOR_REGION.trim();

    let url = `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=${encodeURIComponent(targetLanguage)}`;
    if (sourceLanguage && sourceLanguage !== 'auto') {
      url += `&from=${encodeURIComponent(sourceLanguage)}`;
    }

    let response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': key,
          'Ocp-Apim-Subscription-Region': region,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify([{ Text: text }])
      });
    } catch (networkErr) {
      throw new TranslationApiError(
        `Failed to reach Azure Translator service: ${networkErr.message}`,
        this.name,
        503,
        networkErr.message
      );
    }

    const data = await response.json();

    if (!response.ok) {
      const errMessage = data?.error?.message || 'Azure Translator API request failed.';
      throw new TranslationApiError(
        `Azure Translator error (${response.status}): ${errMessage}`,
        this.name,
        response.status >= 500 ? 502 : 400,
        data?.error
      );
    }

    const result = data?.[0];
    const translation = result?.translations?.[0];
    if (!translation) {
      throw new TranslationApiError('No translation returned from Azure Translator.', this.name);
    }

    return {
      translatedText: translation.text,
      detectedLanguage: result?.detectedLanguage?.language || (sourceLanguage !== 'auto' ? sourceLanguage : null),
      provider: this.name,
      providerDisplayName: this.displayName
    };
  }
}

/**
 * MyMemory Public Translation API Provider
 * Free, real-world public translation API from Translated.net
 * Requires no API key for basic usage, supports real translations for 50+ languages!
 */
class MyMemoryTranslationProvider {
  constructor() {
    this.name = 'mymemory';
    this.displayName = 'MyMemory Translated API (Free Public)';
  }

  isConfigured() {
    return true; // Always configured, public endpoint
  }

  async translate(text, sourceLanguage, targetLanguage) {
    const src = (!sourceLanguage || sourceLanguage === 'auto') ? 'autodetect' : sourceLanguage;
    const langpair = `${src}|${targetLanguage}`;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(langpair)}`;

    let response;
    try {
      response = await fetch(url, {
        headers: {
          'Accept': 'application/json'
        }
      });
    } catch (networkErr) {
      throw new TranslationApiError(
        `Failed to connect to MyMemory Translation API: ${networkErr.message}`,
        this.name,
        503,
        networkErr.message
      );
    }

    if (!response.ok) {
      throw new TranslationApiError(
        `MyMemory API returned status ${response.status}`,
        this.name,
        response.status
      );
    }

    const data = await response.json();

    // Status 200 in body indicates success
    if (data.responseStatus !== 200 && data.responseStatus !== '200') {
      const msg = data.responseDetails || 'MyMemory translation service returned an error.';
      throw new TranslationApiError(msg, this.name, 400, data);
    }

    const translatedText = data.responseData?.translatedText;
    if (!translatedText) {
      throw new TranslationApiError('Empty translation received from MyMemory API.', this.name);
    }

    // Unescape common HTML entities if returned by MyMemory
    const decodedText = translatedText
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');

    return {
      translatedText: decodedText,
      detectedLanguage: (sourceLanguage !== 'auto') ? sourceLanguage : null,
      provider: this.name,
      providerDisplayName: this.displayName
    };
  }
}

/**
 * Modular Translation Service Manager
 */
class TranslationServiceManager {
  constructor() {
    this.providers = {
      google: new GoogleTranslationProvider(),
      azure: new AzureTranslationProvider(),
      mymemory: new MyMemoryTranslationProvider()
    };
  }

  getDefaultProviderName() {
    return (process.env.TRANSLATION_PROVIDER || 'google').toLowerCase().trim();
  }

  getProvider(name) {
    const key = (name || this.getDefaultProviderName()).toLowerCase().trim();
    const provider = this.providers[key];
    if (!provider) {
      throw new Error(`Unsupported translation provider: '${key}'. Available: ${Object.keys(this.providers).join(', ')}`);
    }
    return provider;
  }

  async translate(text, sourceLanguage, targetLanguage, requestedProvider) {
    const provider = this.getProvider(requestedProvider);
    return await provider.translate(text, sourceLanguage, targetLanguage);
  }

  getStatus() {
    const defaultProvider = this.getDefaultProviderName();
    const providersStatus = {};

    for (const [key, provider] of Object.entries(this.providers)) {
      providersStatus[key] = {
        name: provider.name,
        displayName: provider.displayName,
        isConfigured: provider.isConfigured(),
        isDefault: key === defaultProvider
      };
    }

    return {
      activeProvider: defaultProvider,
      providers: providersStatus
    };
  }
}

export const translationService = new TranslationServiceManager();
