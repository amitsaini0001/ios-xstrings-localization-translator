'use client';

import { useState } from 'react';
import { useTranslation } from '@/contexts/TranslationContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Spinner } from '@/components/ui/spinner';
import { Languages, Play, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export function Step4Translate() {
  const {
    selectedLanguages,
    sourceLanguage,
    translationProgress,
    isTranslating,
    translateLanguage,
    translateMultipleLanguages,
    previousStep,
    nextStep,
  } = useTranslation();

  const [selectedForBatch, setSelectedForBatch] = useState<Set<string>>(new Set());
  const [showReTranslateDialog, setShowReTranslateDialog] = useState(false);
  const [reTranslateMode, setReTranslateMode] = useState<'single' | 'batch' | null>(null);
  const [reTranslateLanguage, setReTranslateLanguage] = useState<string | null>(null);

  const targetLanguages = selectedLanguages.filter((lang) => lang !== sourceLanguage);

  const handleToggleBatchSelection = (languageCode: string) => {
    const newSelection = new Set(selectedForBatch);
    if (newSelection.has(languageCode)) {
      newSelection.delete(languageCode);
    } else {
      newSelection.add(languageCode);
    }
    setSelectedForBatch(newSelection);
  };

  const handleTranslateSelected = async (forceRefresh: boolean = false) => {
    const languagesToTranslate = Array.from(selectedForBatch);
    if (languagesToTranslate.length > 0) {
      await translateMultipleLanguages(languagesToTranslate, forceRefresh);
    }
  };

  const handleReTranslateClick = (mode: 'single' | 'batch', languageCode?: string) => {
    setReTranslateMode(mode);
    setReTranslateLanguage(languageCode || null);
    setShowReTranslateDialog(true);
  };

  const confirmReTranslate = async () => {
    if (reTranslateMode === 'batch') {
      await handleTranslateSelected(true);
    } else if (reTranslateMode === 'single' && reTranslateLanguage) {
      await translateLanguage(reTranslateLanguage, true);
    }
    setShowReTranslateDialog(false);
    setReTranslateMode(null);
    setReTranslateLanguage(null);
  };

  const allTranslated = targetLanguages.every((lang) => {
    const progress = translationProgress[lang];
    return progress && progress.translatedStrings === progress.totalStrings;
  });

  const hasTranslations = targetLanguages.some((lang) => {
    const progress = translationProgress[lang];
    return progress && progress.translatedStrings > 0;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            Translation Progress
          </CardTitle>
          <CardDescription>
            Translate your strings to the selected languages. You can translate languages individually or in batches.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {targetLanguages.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No target languages selected. Go back to add languages for translation.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="flex gap-2 mb-4">
                <Button
                  onClick={() => handleTranslateSelected(false)}
                  disabled={selectedForBatch.size === 0 || isTranslating}
                  className="flex-1"
                >
                  {isTranslating ? (
                    <>
                      <Spinner className="h-4 w-4 mr-2" />
                      Translating...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Translate Selected ({selectedForBatch.size})
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleReTranslateClick('batch')}
                  disabled={selectedForBatch.size === 0 || isTranslating}
                  className="flex-1"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Re Translate Selected
                </Button>
              </div>

              <div className="space-y-3">
                {targetLanguages.map((lang) => {
                  const progress = translationProgress[lang];
                  if (!progress) return null;

                  const percentage = (progress.translatedStrings / progress.totalStrings) * 100;
                  const isComplete = progress.translatedStrings === progress.totalStrings;
                  const hasError = progress.error;

                  return (
                    <div key={lang} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={selectedForBatch.has(lang)}
                            onCheckedChange={() => handleToggleBatchSelection(lang)}
                            disabled={isTranslating}
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge>{lang}</Badge>
                              <span className="font-medium">{progress.languageName}</span>
                              {isComplete && (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {progress.translatedStrings} / {progress.totalStrings} strings
                              {progress.failedStrings > 0 &&
                                ` • ${progress.failedStrings} failed`}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => translateLanguage(lang, false)}
                            disabled={isTranslating || isComplete}
                          >
                            {progress.inProgress ? (
                              <>
                                <Spinner className="h-3 w-3 mr-2" />
                                Translating...
                              </>
                            ) : (
                              <>
                                <Play className="h-3 w-3 mr-2" />
                                Translate
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReTranslateClick('single', lang)}
                            disabled={isTranslating}
                          >
                            <RefreshCw className="h-3 w-3 mr-2" />
                            Re Translate
                          </Button>
                        </div>
                      </div>

                      <Progress value={percentage} className="h-2" />

                      {hasError && (
                        <Alert variant="destructive" className="py-2">
                          <AlertCircle className="h-3 w-3" />
                          <AlertDescription className="text-xs">
                            {progress.error}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {hasTranslations && (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-900">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-700 dark:text-green-300">
            {allTranslated
              ? 'All languages have been translated! Click Next to view and download your translated XCStrings file.'
              : 'Some translations are complete. You can continue translating or proceed to the next step.'}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between gap-2">
        <Button variant="outline" onClick={previousStep} disabled={isTranslating}>
          Back
        </Button>
        <Button onClick={nextStep} disabled={!hasTranslations}>
          Next
        </Button>
      </div>

      <AlertDialog open={showReTranslateDialog} onOpenChange={setShowReTranslateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Re-Translate Confirmation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to re-translate? This will replace all existing translations for the selected language(s).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmReTranslate}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

