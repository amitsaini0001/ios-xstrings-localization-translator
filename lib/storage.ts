import { STORAGE_KEYS } from './constants';

// Simple obfuscation (not true encryption, but better than plain text)
const obfuscate = (text: string): string => {
  return btoa(encodeURIComponent(text));
};

const deobfuscate = (text: string): string => {
  try {
    return decodeURIComponent(atob(text));
  } catch {
    return '';
  }
};

export const storage = {
  // API Key management
  saveApiKey: (apiKey: string): void => {
    if (typeof window === 'undefined') return;
    try {
      const obfuscated = obfuscate(apiKey);
      localStorage.setItem(STORAGE_KEYS.API_KEY, obfuscated);
    } catch (error) {
      console.error('Failed to save API key:', error);
    }
  },

  loadApiKey: (): string => {
    if (typeof window === 'undefined') return '';
    try {
      const obfuscated = localStorage.getItem(STORAGE_KEYS.API_KEY);
      return obfuscated ? deobfuscate(obfuscated) : '';
    } catch (error) {
      console.error('Failed to load API key:', error);
      return '';
    }
  },

  removeApiKey: (): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(STORAGE_KEYS.API_KEY);
    } catch (error) {
      console.error('Failed to remove API key:', error);
    }
  },

  // Model preference
  saveModel: (model: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.MODEL, model);
    } catch (error) {
      console.error('Failed to save model:', error);
    }
  },

  loadModel: (): string => {
    if (typeof window === 'undefined') return '';
    try {
      return localStorage.getItem(STORAGE_KEYS.MODEL) || '';
    } catch (error) {
      console.error('Failed to load model:', error);
      return '';
    }
  },

  // Save API key preference
  setSaveApiKeyPreference: (shouldSave: boolean): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.SAVE_API_KEY, shouldSave.toString());
    } catch (error) {
      console.error('Failed to save preference:', error);
    }
  },

  getSaveApiKeyPreference: (): boolean => {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem(STORAGE_KEYS.SAVE_API_KEY) === 'true';
    } catch (error) {
      console.error('Failed to load preference:', error);
      return false;
    }
  },

  // App context management
  saveAppContext: (context: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.APP_CONTEXT, context);
    } catch (error) {
      console.error('Failed to save app context:', error);
    }
  },

  loadAppContext: (): string => {
    if (typeof window === 'undefined') return '';
    try {
      return localStorage.getItem(STORAGE_KEYS.APP_CONTEXT) || '';
    } catch (error) {
      console.error('Failed to load app context:', error);
      return '';
    }
  },
};

