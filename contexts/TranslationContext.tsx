'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  TranslationState,
  TranslationRequest,
} from '@/lib/types';
import {
  parseXCStrings,
  extractExistingLanguages,
  getTranslatableStrings,
  calculateProgress,
  addTranslation,
  removeLanguage,
  removeAllLanguagesExceptSource,
  getLanguageName,
  extractPlaceholders,
} from '@/lib/xcstrings-parser';
import { translateBatch } from '@/lib/openai-service';
import { storage } from '@/lib/storage';
import { DEFAULT_MODEL } from '@/lib/constants';

interface TranslationContextType extends TranslationState {
  // Navigation
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: number) => void;
  resetWizard: () => void;

  // Data management
  parseInput: (json: string) => { success: boolean; error?: string };
  toggleStringExclusion: (key: string) => void;
  addLanguageToTranslate: (languageCode: string) => void;
  removeLanguageFromTranslate: (languageCode: string) => void;
  removeAllLanguages: () => void;
  
  // Settings
  setApiKey: (key: string) => void;
  setSaveApiKey: (save: boolean) => void;
  setSelectedModel: (model: string) => void;
  setAppContext: (context: string) => void;

  // Translation
  translateLanguage: (languageCode: string, forceRefresh?: boolean) => Promise<void>;
  translateMultipleLanguages: (languageCodes: string[], forceRefresh?: boolean) => Promise<void>;

  // Output
  getOutputJson: () => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<TranslationState>({
    currentStep: 1,
    xcstringsData: null,
    originalJson: '',
    sourceLanguage: 'en',
    availableLanguages: [],
    selectedLanguages: [],
    excludedStrings: new Set(),
    apiKey: '',
    saveApiKey: false,
    selectedModel: DEFAULT_MODEL,
    appContext: '',
    translationProgress: {},
    isTranslating: false,
  });

  // Load saved preferences on mount
  useEffect(() => {
    const savedApiKey = storage.loadApiKey();
    const savedModel = storage.loadModel();
    const savePreference = storage.getSaveApiKeyPreference();
    const savedAppContext = storage.loadAppContext();

    setState((prev) => ({
      ...prev,
      apiKey: savedApiKey,
      saveApiKey: savePreference,
      selectedModel: savedModel || DEFAULT_MODEL,
      appContext: savedAppContext,
    }));
  }, []);

  // Navigation
  const nextStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, 5),
    }));
  }, []);

  const previousStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 1),
    }));
  }, []);

  const goToStep = useCallback((step: number) => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(1, Math.min(step, 5)),
    }));
  }, []);

  const resetWizard = useCallback(() => {
    setState((prev) => ({
      currentStep: 1,
      xcstringsData: null,
      originalJson: '',
      sourceLanguage: 'en',
      availableLanguages: [],
      selectedLanguages: [],
      excludedStrings: new Set(),
      apiKey: prev.apiKey, // Keep API key
      saveApiKey: prev.saveApiKey,
      selectedModel: prev.selectedModel,
      appContext: prev.appContext, // Keep app context
      translationProgress: {},
      isTranslating: false,
    }));
  }, []);

  // Data management
  const parseInput = useCallback((json: string) => {
    const result = parseXCStrings(json);
    
    if (!result.success || !result.data) {
      return { success: false, error: result.error };
    }

    const existingLanguages = extractExistingLanguages(result.data);
    const progress = calculateProgress(result.data, existingLanguages);

    setState((prev) => ({
      ...prev,
      xcstringsData: result.data!,
      originalJson: json,
      sourceLanguage: result.data!.sourceLanguage,
      availableLanguages: existingLanguages,
      selectedLanguages: existingLanguages,
      translationProgress: progress,
    }));

    return { success: true };
  }, []);

  const toggleStringExclusion = useCallback((key: string) => {
    setState((prev) => {
      const newExcluded = new Set(prev.excludedStrings);
      if (newExcluded.has(key)) {
        newExcluded.delete(key);
      } else {
        newExcluded.add(key);
      }

      // Recalculate progress
      const progress = prev.xcstringsData
        ? calculateProgress(prev.xcstringsData, prev.selectedLanguages, newExcluded)
        : prev.translationProgress;

      return {
        ...prev,
        excludedStrings: newExcluded,
        translationProgress: progress,
      };
    });
  }, []);

  const addLanguageToTranslate = useCallback((languageCode: string) => {
    setState((prev) => {
      if (prev.selectedLanguages.includes(languageCode)) {
        return prev;
      }

      const newLanguages = [...prev.selectedLanguages, languageCode];
      const progress = prev.xcstringsData
        ? calculateProgress(prev.xcstringsData, newLanguages, prev.excludedStrings)
        : prev.translationProgress;

      return {
        ...prev,
        selectedLanguages: newLanguages,
        availableLanguages: newLanguages,
        translationProgress: progress,
      };
    });
  }, []);

  const removeLanguageFromTranslate = useCallback((languageCode: string) => {
    setState((prev) => {
      const newLanguages = prev.selectedLanguages.filter((lang) => lang !== languageCode);
      const newData = prev.xcstringsData
        ? removeLanguage(prev.xcstringsData, languageCode)
        : prev.xcstringsData;
      
      const progress = newData
        ? calculateProgress(newData, newLanguages, prev.excludedStrings)
        : prev.translationProgress;

      return {
        ...prev,
        xcstringsData: newData,
        selectedLanguages: newLanguages,
        availableLanguages: newLanguages,
        translationProgress: progress,
      };
    });
  }, []);

  const removeAllLanguages = useCallback(() => {
    setState((prev) => {
      if (!prev.xcstringsData) return prev;

      const newData = removeAllLanguagesExceptSource(prev.xcstringsData);
      const newLanguages = [prev.sourceLanguage];
      const progress = calculateProgress(newData, newLanguages, prev.excludedStrings);

      return {
        ...prev,
        xcstringsData: newData,
        selectedLanguages: newLanguages,
        availableLanguages: newLanguages,
        translationProgress: progress,
      };
    });
  }, []);

  // Settings
  const setApiKey = useCallback((key: string) => {
    setState((prev) => ({ ...prev, apiKey: key }));
  }, []);

  const setSaveApiKey = useCallback((save: boolean) => {
    setState((prev) => ({ ...prev, saveApiKey: save }));
    storage.setSaveApiKeyPreference(save);
    
    if (save && state.apiKey) {
      storage.saveApiKey(state.apiKey);
    } else if (!save) {
      storage.removeApiKey();
    }
  }, [state.apiKey]);

  const setSelectedModel = useCallback((model: string) => {
    setState((prev) => ({ ...prev, selectedModel: model }));
    storage.saveModel(model);
  }, []);

  const setAppContext = useCallback((context: string) => {
    setState((prev) => ({ ...prev, appContext: context }));
    storage.saveAppContext(context);
  }, []);

  // Translation
  const translateLanguage = useCallback(
    async (languageCode: string, forceRefresh: boolean = false) => {
      // Capture current state values before starting async operations
      const currentState = {
        xcstringsData: state.xcstringsData,
        apiKey: state.apiKey,
        selectedModel: state.selectedModel,
        excludedStrings: state.excludedStrings,
        selectedLanguages: state.selectedLanguages,
      };

      if (!currentState.xcstringsData || !currentState.apiKey) return;

      // Update progress to show in progress
      setState((prev) => ({
        ...prev,
        isTranslating: true,
        translationProgress: {
          ...prev.translationProgress,
          [languageCode]: {
            ...prev.translationProgress[languageCode],
            inProgress: true,
            error: undefined,
          },
        },
      }));

      try {
        const translatableStrings = getTranslatableStrings(
          currentState.xcstringsData,
          currentState.excludedStrings
        );

        // Filter strings that need translation
        const stringsToTranslate = forceRefresh
          ? translatableStrings
          : translatableStrings.filter(
              (str) => !str.existingTranslations[languageCode]
            );

        if (stringsToTranslate.length === 0) {
          setState((prev) => ({
            ...prev,
            isTranslating: false,
            translationProgress: {
              ...prev.translationProgress,
              [languageCode]: {
                ...prev.translationProgress[languageCode],
                inProgress: false,
              },
            },
          }));
          return;
        }

        // Prepare translation requests
        const requests: TranslationRequest[] = stringsToTranslate.map((str) => ({
          stringKey: str.key,
          sourceText: str.value,
          targetLanguage: languageCode,
          targetLanguageName: getLanguageName(languageCode),
          comment: str.comment,
          placeholders: extractPlaceholders(str.value),
          appContext: currentState.appContext,
        }));

        // Translate batch with progress updates
        const results = await translateBatch(
          currentState.apiKey,
          currentState.selectedModel,
          requests,
          (completed, total) => {
            setState((prev) => {
              if (!prev.translationProgress[languageCode]) return prev;
              
              return {
                ...prev,
                translationProgress: {
                  ...prev.translationProgress,
                  [languageCode]: {
                    ...prev.translationProgress[languageCode],
                    translatedStrings: prev.translationProgress[languageCode].totalStrings - (total - completed),
                  },
                },
              };
            });
          }
        );

        // Apply translations to the LATEST state
        setState((prev) => {
          if (!prev.xcstringsData) return prev;

          let updatedData = prev.xcstringsData;
          let failedCount = 0;

          results.forEach((result) => {
            if (result.success) {
              updatedData = addTranslation(
                updatedData,
                result.stringKey,
                result.targetLanguage,
                result.translatedText
              );
            } else {
              failedCount++;
            }
          });

          // Calculate progress with updated data
          const progress = calculateProgress(
            updatedData,
            prev.selectedLanguages,
            prev.excludedStrings
          );

          return {
            ...prev,
            xcstringsData: updatedData,
            isTranslating: false,
            translationProgress: {
              ...progress,
              [languageCode]: {
                ...progress[languageCode],
                inProgress: false,
                failedStrings: failedCount,
              },
            },
          };
        });
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isTranslating: false,
          translationProgress: {
            ...prev.translationProgress,
            [languageCode]: {
              ...prev.translationProgress[languageCode],
              inProgress: false,
              error: error instanceof Error ? error.message : 'Translation failed',
            },
          },
        }));
      }
    },
    [state.xcstringsData, state.apiKey, state.selectedModel, state.excludedStrings, state.selectedLanguages]
  );

  const translateMultipleLanguages = useCallback(
    async (languageCodes: string[], forceRefresh: boolean = false) => {
      for (const languageCode of languageCodes) {
        if (languageCode !== state.sourceLanguage) {
          await translateLanguage(languageCode, forceRefresh);
        }
      }
    },
    [translateLanguage, state.sourceLanguage]
  );

  // Output
  const getOutputJson = useCallback(() => {
    if (!state.xcstringsData) return '';
    return JSON.stringify(state.xcstringsData, null, 2);
  }, [state.xcstringsData]);

  const value: TranslationContextType = {
    ...state,
    nextStep,
    previousStep,
    goToStep,
    resetWizard,
    parseInput,
    toggleStringExclusion,
    addLanguageToTranslate,
    removeLanguageFromTranslate,
    removeAllLanguages,
    setApiKey,
    setSaveApiKey,
    setSelectedModel,
    setAppContext,
    translateLanguage,
    translateMultipleLanguages,
    getOutputJson,
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}

