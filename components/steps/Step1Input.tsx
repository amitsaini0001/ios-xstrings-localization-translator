'use client';

import { useState } from 'react';
import { useTranslation } from '@/contexts/TranslationContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, AlertCircle, FileJson, FileText } from 'lucide-react';

export function Step1Input() {
  const { parseInput, nextStep, xcstringsData, sourceLanguage } = useTranslation();
  const [input, setInput] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);
  const [isParsed, setIsParsed] = useState(false);

  const handleParse = () => {
    setParseError(null);
    const result = parseInput(input);
    
    if (result.success) {
      setIsParsed(true);
      setParseError(null);
    } else {
      setIsParsed(false);
      setParseError(result.error || 'Failed to parse XCStrings file');
    }
  };

  const handleLoadSample = async () => {
    try {
      const response = await fetch('/sample.xcstrings');
      const text = await response.text();
      setInput(text);
      setIsParsed(false);
      setParseError(null);
    } catch {
      setParseError('Failed to load sample file');
    }
  };

  const handleNext = () => {
    if (isParsed && xcstringsData) {
      nextStep();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileJson className="h-5 w-5" />
            Paste Your XCStrings Content
          </CardTitle>
          <CardDescription>
            Copy the content of your .xcstrings file and paste it below. We&apos;ll validate and parse it for translation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder='{"sourceLanguage": "en", "strings": {...}, "version": "1.1"}'
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setIsParsed(false);
              setParseError(null);
            }}
            className="font-mono text-sm h-[500px] max-h-[70vh] resize-none overflow-y-auto"
          />
          
          <div className="flex gap-2">
            <Button onClick={handleParse} disabled={!input.trim()} className="flex-1">
              Parse XCStrings
            </Button>
            <Button onClick={handleLoadSample} variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Load Sample
            </Button>
          </div>
        </CardContent>
      </Card>

      {parseError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Parse Error</AlertTitle>
          <AlertDescription>{parseError}</AlertDescription>
        </Alert>
      )}

      {isParsed && xcstringsData && (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-900">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertTitle className="text-green-800 dark:text-green-200">Success!</AlertTitle>
          <AlertDescription className="text-green-700 dark:text-green-300">
            XCStrings file parsed successfully. Source language detected: <strong>{sourceLanguage}</strong>
            <br />
            Found {Object.keys(xcstringsData.strings).length} strings.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end gap-2">
        <Button onClick={handleNext} disabled={!isParsed || !xcstringsData}>
          Next
        </Button>
      </div>
    </div>
  );
}

