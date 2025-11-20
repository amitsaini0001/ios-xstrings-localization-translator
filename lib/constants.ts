// Language codes mapping (ISO 639-1 with region codes where applicable)
export const SUPPORTED_LANGUAGES = [
  { code: "ar", name: "Arabic", native: "العربية" },
  { code: "zh-Hans", name: "Chinese (Simplified)", native: "简体中文" },
  { code: "zh-Hant", name: "Chinese (Traditional)", native: "繁體中文" },
  { code: "cs", name: "Czech", native: "Čeština" },
  { code: "da", name: "Danish", native: "Dansk" },
  { code: "nl", name: "Dutch", native: "Nederlands" },
  { code: "en", name: "English", native: "English" },
  { code: "en-AU", name: "English (Australia)", native: "English (Australia)" },
  { code: "en-GB", name: "English (UK)", native: "English (UK)" },
  { code: "fi", name: "Finnish", native: "Suomi" },
  { code: "fr", name: "French", native: "Français" },
  { code: "fr-CA", name: "French (Canada)", native: "Français (Canada)" },
  { code: "de", name: "German", native: "Deutsch" },
  { code: "el", name: "Greek", native: "Ελληνικά" },
  { code: "he", name: "Hebrew", native: "עברית" },
  { code: "hi", name: "Hindi", native: "हिन्दी" },
  { code: "hu", name: "Hungarian", native: "Magyar" },
  { code: "id", name: "Indonesian", native: "Bahasa Indonesia" },
  { code: "it", name: "Italian", native: "Italiano" },
  { code: "ja", name: "Japanese", native: "日本語" },
  { code: "ko", name: "Korean", native: "한국어" },
  { code: "ms", name: "Malay", native: "Bahasa Melayu" },
  { code: "no", name: "Norwegian", native: "Norsk" },
  { code: "pl", name: "Polish", native: "Polski" },
  { code: "pt-BR", name: "Portuguese (Brazil)", native: "Português (Brasil)" },
  {
    code: "pt-PT",
    name: "Portuguese (Portugal)",
    native: "Português (Portugal)",
  },
  { code: "ro", name: "Romanian", native: "Română" },
  { code: "ru", name: "Russian", native: "Русский" },
  { code: "sk", name: "Slovak", native: "Slovenčina" },
  { code: "es", name: "Spanish", native: "Español" },
  { code: "es-MX", name: "Spanish (Mexico)", native: "Español (México)" },
  { code: "sv", name: "Swedish", native: "Svenska" },
  { code: "th", name: "Thai", native: "ไทย" },
  { code: "tr", name: "Turkish", native: "Türkçe" },
  { code: "uk", name: "Ukrainian", native: "Українська" },
  { code: "vi", name: "Vietnamese", native: "Tiếng Việt" },
] as const;

// Note: Models are now fetched dynamically from the OpenAI API
// This default is used as a fallback for initial state
export const DEFAULT_MODEL = "gpt-4o-mini";
export const DEFAULT_SOURCE_LANGUAGE = "en";

// LocalStorage keys
export const STORAGE_KEYS = {
  API_KEY: "xcstrings_translator_api_key",
  MODEL: "xcstrings_translator_model",
  SAVE_API_KEY: "xcstrings_translator_save_key",
  APP_CONTEXT: "xcstrings_translator_app_context",
} as const;
