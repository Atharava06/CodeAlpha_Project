/**
 * API service for LinguaTranslate frontend
 */

const API_BASE = '/api';

/**
 * Sends a translation request to the backend
 */
export async function translateText({ text, sourceLanguage, targetLanguage, provider }) {
  const payload = {
    text,
    sourceLanguage,
    targetLanguage
  };

  if (provider) {
    payload.provider = provider;
  }

  const response = await fetch(`${API_BASE}/translate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({
    success: false,
    error: 'PARSE_ERROR',
    message: 'Failed to parse server response.'
  }));

  if (!response.ok || !data.success) {
    const errorObj = new Error(data.message || `Translation failed with status ${response.status}`);
    errorObj.code = data.error || 'TRANSLATION_ERROR';
    errorObj.status = response.status;
    errorObj.setupGuide = data.setupGuide;
    errorObj.provider = data.provider;
    throw errorObj;
  }

  return data;
}

/**
 * Fetches server health, status, and configured providers
 */
export async function fetchServerStatus() {
  try {
    const response = await fetch(`${API_BASE}/status`);
    if (!response.ok) return null;
    return await response.json();
  } catch (err) {
    console.warn('Could not connect to translation server:', err.message);
    return null;
  }
}

/**
 * Fetches supported languages from server
 */
export async function fetchLanguages() {
  try {
    const response = await fetch(`${API_BASE}/languages`);
    if (!response.ok) return null;
    const data = await response.json();
    return data.languages;
  } catch (err) {
    console.warn('Could not fetch language list from server, using local fallback:', err.message);
    return null;
  }
}
