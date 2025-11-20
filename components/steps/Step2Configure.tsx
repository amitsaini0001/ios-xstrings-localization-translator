'use client';

import { useState } from 'react';
import { useTranslation } from '@/contexts/TranslationContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Languages, Trash2, Plus, Info, Lightbulb } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '@/lib/constants';
import { getTranslatableStrings } from '@/lib/xcstrings-parser';
import { LanguageSelector } from '@/components/ui/LanguageSelector';

export function Step2Configure() {
  const {
    xcstringsData,
    selectedLanguages,
    excludedStrings,
    translationProgress,
    sourceLanguage,
    appContext,
    toggleStringExclusion,
    addLanguageToTranslate,
    removeLanguageFromTranslate,
    removeAllLanguages,
    setAppContext,
    previousStep,
    nextStep,
  } = useTranslation();

  const [showAddLanguage, setShowAddLanguage] = useState(false);
  const [localAppContext, setLocalAppContext] = useState(appContext);

  if (!xcstringsData) return null;

  const translatableStrings = getTranslatableStrings(xcstringsData, excludedStrings);
  const nonTranslatableCount = Object.values(xcstringsData.strings).filter(
    (s) => s.shouldTranslate === false
  ).length;

  const handleAddLanguage = (languageCode: string) => {
    addLanguageToTranslate(languageCode);
    setShowAddLanguage(false);
  };

  const availableToAdd = SUPPORTED_LANGUAGES.filter(
    (lang) => !selectedLanguages.includes(lang.code)
  );

  const handleAppContextChange = (value: string) => {
    setLocalAppContext(value);
    setAppContext(value);
  };

  return (
    <div className="space-y-6">
      {/* App Context */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            App Context (Optional)
          </CardTitle>
          <CardDescription>
            Describe your app to help the AI make better, more contextual translations. This will be saved for future use.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="app-context">What is your app about?</Label>
            <Textarea
              id="app-context"
              placeholder="e.g., A fitness tracking app for runners, or A social media app for sharing recipes, or A productivity tool for managing tasks..."
              value={localAppContext}
              onChange={(e) => handleAppContextChange(e.target.value)}
              className="min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground">
              💡 Tip: Include the app&apos;s purpose, target audience, and tone (casual, professional, etc.)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Current Languages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            Current Languages
          </CardTitle>
          <CardDescription>
            Manage which languages are included in your XCStrings file
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {selectedLanguages.map((lang) => {
              const progress = translationProgress[lang];
              const percentage = progress
                ? (progress.translatedStrings / progress.totalStrings) * 100
                : 0;
              const isSource = lang === sourceLanguage;

              return (
                <div key={lang} className="flex items-center gap-2 border rounded-lg p-3 min-w-[200px]">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={isSource ? 'default' : 'secondary'}>
                        {lang}
                      </Badge>
                      {isSource && (
                        <span className="text-xs text-muted-foreground">(Source)</span>
                      )}
                    </div>
                    {progress && (
                      <div className="space-y-1">
                        <Progress value={percentage} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          {progress.translatedStrings} / {progress.totalStrings} strings
                        </p>
                      </div>
                    )}
                  </div>
                  {!isSource && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeLanguageFromTranslate(lang)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAddLanguage(true)}
              className="flex-1"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Language
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="flex-1">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove All Languages
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove All Languages?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove all translations and keep only the source language ({sourceLanguage}). 
                    This action can be useful if you want to start fresh with translations.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={removeAllLanguages}>
                    Remove All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {/* Translatable Strings */}
      <Card>
        <CardHeader>
          <CardTitle>Translatable Strings</CardTitle>
          <CardDescription>
            Review and manage which strings should be translated. Uncheck strings you don&apos;t want to translate (like brand names).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              {translatableStrings.length} strings will be translated
              {nonTranslatableCount > 0 && ` • ${nonTranslatableCount} marked as non-translatable`}
              {excludedStrings.size > 0 && ` • ${excludedStrings.size} manually excluded`}
            </AlertDescription>
          </Alert>

          <ScrollArea className="h-[400px] border rounded-lg p-4">
            <div className="space-y-3">
              {translatableStrings.map((str) => {
                const isExcluded = excludedStrings.has(str.key);
                
                return (
                  <div
                    key={str.key}
                    className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent"
                  >
                    <Checkbox
                      checked={!isExcluded}
                      onCheckedChange={() => toggleStringExclusion(str.key)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm break-words">{str.value}</p>
                      {str.comment && (
                        <p className="text-xs text-muted-foreground mt-1">{str.comment}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {str.key}
                        </code>
                        {str.hasPlaceholders && (
                          <Badge variant="outline" className="text-xs">
                            Has Placeholders
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Language Selector Dialog */}
      {showAddLanguage && (
        <LanguageSelector
          availableLanguages={availableToAdd}
          onSelect={handleAddLanguage}
          onClose={() => setShowAddLanguage(false)}
        />
      )}

      <div className="flex justify-between gap-2">
        <Button variant="outline" onClick={previousStep}>
          Back
        </Button>
        <Button onClick={nextStep}>
          Next
        </Button>
      </div>
    </div>
  );
}

