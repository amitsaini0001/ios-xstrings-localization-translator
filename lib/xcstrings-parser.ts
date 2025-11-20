import { XCStringsFile, TranslatableString, LanguageProgress } from './types';
import { SUPPORTED_LANGUAGES } from './constants';

/**
 * Parse and validate XCStrings JSON
 */
export function parseXCStrings(jsonString: string): {
  success: boolean;
  data?: XCStringsFile;
  error?: string;
} {
  try {
    const parsed = JSON.parse(jsonString);

    // Validate required fields
    if (!parsed.sourceLanguage || typeof parsed.sourceLanguage !== 'string') {
      return {
        success: false,
        error: 'Invalid XCStrings format: missing or invalid sourceLanguage',
      };
    }

    if (!parsed.strings || typeof parsed.strings !== 'object') {
      return {
        success: false,
        error: 'Invalid XCStrings format: missing or invalid strings object',
      };
    }

    if (!parsed.version) {
      return {
        success: false,
        error: 'Invalid XCStrings format: missing version',
      };
    }

    return {
      success: true,
      data: parsed as XCStringsFile,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse JSON',
    };
  }
}

/**
 * Extract all languages currently in the XCStrings file
 */
export function extractExistingLanguages(data: XCStringsFile): string[] {
  const languages = new Set<string>();
  languages.add(data.sourceLanguage);

  Object.values(data.strings).forEach((stringData) => {
    if (stringData.localizations) {
      Object.keys(stringData.localizations).forEach((lang) => {
        languages.add(lang);
      });
    }
  });

  return Array.from(languages).sort();
}

/**
 * Get translatable strings from XCStrings data
 */
export function getTranslatableStrings(
  data: XCStringsFile,
  excludedKeys: Set<string> = new Set()
): TranslatableString[] {
  const translatableStrings: TranslatableString[] = [];
  const sourceLanguage = data.sourceLanguage;

  Object.entries(data.strings).forEach(([key, stringData]) => {
    // Skip if explicitly marked as should not translate
    if (stringData.shouldTranslate === false) {
      return;
    }

    // Skip if user excluded this string
    if (excludedKeys.has(key)) {
      return;
    }

    // Get source text
    const sourceText = stringData.localizations?.[sourceLanguage]?.stringUnit?.value || key;

    // Skip empty strings
    if (!sourceText || sourceText.trim() === '') {
      return;
    }

    // Check for placeholders
    const hasPlaceholders = detectPlaceholders(sourceText);

    // Get existing translations
    const existingTranslations: Record<string, string> = {};
    if (stringData.localizations) {
      Object.entries(stringData.localizations).forEach(([lang, localization]) => {
        if (lang !== sourceLanguage && localization.stringUnit?.value) {
          existingTranslations[lang] = localization.stringUnit.value;
        }
      });
    }

    translatableStrings.push({
      key,
      value: sourceText,
      comment: stringData.comment,
      shouldTranslate: stringData.shouldTranslate === undefined || stringData.shouldTranslate === true,
      hasPlaceholders,
      existingTranslations,
    });
  });

  return translatableStrings;
}

/**
 * Detect placeholders in a string (%@, %1$@, %lld, etc.)
 */
export function detectPlaceholders(text: string): boolean {
  const placeholderPattern = /%(\d+\$)?[@dDuUxXoOfFeEgGcCsSpaA]|%l[ldufega]/g;
  return placeholderPattern.test(text);
}

/**
 * Extract placeholder patterns from a string
 */
export function extractPlaceholders(text: string): string[] {
  const placeholderPattern = /%(\d+\$)?[@dDuUxXoOfFeEgGcCsSpaA]|%l[ldufega]/g;
  const matches = text.match(placeholderPattern);
  return matches ? Array.from(new Set(matches)) : [];
}

/**
 * Calculate translation progress for each language
 */
export function calculateProgress(
  data: XCStringsFile,
  languages: string[],
  excludedKeys: Set<string> = new Set()
): Record<string, LanguageProgress> {
  const progress: Record<string, LanguageProgress> = {};
  const translatableStrings = getTranslatableStrings(data, excludedKeys);
  const totalStrings = translatableStrings.length;

  languages.forEach((langCode) => {
    if (langCode === data.sourceLanguage) {
      // Source language is 100% complete
      progress[langCode] = {
        languageCode: langCode,
        languageName: getLanguageName(langCode),
        totalStrings,
        translatedStrings: totalStrings,
        failedStrings: 0,
        inProgress: false,
      };
      return;
    }

    let translatedCount = 0;

    translatableStrings.forEach((str) => {
      if (str.existingTranslations[langCode]) {
        translatedCount++;
      }
    });

    progress[langCode] = {
      languageCode: langCode,
      languageName: getLanguageName(langCode),
      totalStrings,
      translatedStrings: translatedCount,
      failedStrings: 0,
      inProgress: false,
    };
  });

  return progress;
}

/**
 * Get language name from code
 */
export function getLanguageName(code: string): string {
  const language = SUPPORTED_LANGUAGES.find((lang) => lang.code === code);
  return language ? language.name : code;
}

/**
 * Add or update translation in XCStrings data
 */
export function addTranslation(
  data: XCStringsFile,
  stringKey: string,
  languageCode: string,
  translatedText: string
): XCStringsFile {
  const updatedData = JSON.parse(JSON.stringify(data)) as XCStringsFile;

  if (!updatedData.strings[stringKey]) {
    return updatedData;
  }

  if (!updatedData.strings[stringKey].localizations) {
    updatedData.strings[stringKey].localizations = {};
  }

  updatedData.strings[stringKey].localizations![languageCode] = {
    stringUnit: {
      state: 'translated',
      value: translatedText,
    },
  };

  return updatedData;
}

/**
 * Remove a language from XCStrings data
 */
export function removeLanguage(data: XCStringsFile, languageCode: string): XCStringsFile {
  const updatedData = JSON.parse(JSON.stringify(data)) as XCStringsFile;

  Object.keys(updatedData.strings).forEach((key) => {
    if (updatedData.strings[key].localizations) {
      delete updatedData.strings[key].localizations![languageCode];
    }
  });

  return updatedData;
}

/**
 * Remove all languages except source language
 */
export function removeAllLanguagesExceptSource(data: XCStringsFile): XCStringsFile {
  const updatedData = JSON.parse(JSON.stringify(data)) as XCStringsFile;
  const sourceLanguage = updatedData.sourceLanguage;

  Object.keys(updatedData.strings).forEach((key) => {
    if (updatedData.strings[key].localizations) {
      const localizations = updatedData.strings[key].localizations!;
      const sourceLocalization = localizations[sourceLanguage];
      
      updatedData.strings[key].localizations = sourceLocalization
        ? { [sourceLanguage]: sourceLocalization }
        : {};
    }
  });

  return updatedData;
}

/**
 * Add a new language to XCStrings data (creates empty localizations)
 */
export function addLanguage(data: XCStringsFile): XCStringsFile {
  // Just return the data; translations will be added when user translates
  return data;
}

