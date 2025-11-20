'use client';

import { useTranslation } from '@/contexts/TranslationContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Copy, RotateCcw, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export function Step5Output() {
  const {
    getOutputJson,
    selectedLanguages,
    sourceLanguage,
    translationProgress,
    previousStep,
    resetWizard,
  } = useTranslation();

  const outputJson = getOutputJson();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(outputJson);
      toast.success('Copied to clipboard!');
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([outputJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Localizable.xcstrings';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Downloaded XCStrings file!');
  };

  const targetLanguages = selectedLanguages.filter((lang) => lang !== sourceLanguage);
  const totalTranslated = targetLanguages.reduce((sum, lang) => {
    const progress = translationProgress[lang];
    return sum + (progress?.translatedStrings || 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Translation Complete!
          </CardTitle>
          <CardDescription>
            Your XCStrings file has been translated and is ready to use
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-3xl font-bold">{selectedLanguages.length}</p>
              <p className="text-sm text-muted-foreground">Languages</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-3xl font-bold">{targetLanguages.length}</p>
              <p className="text-sm text-muted-foreground">Translated</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-3xl font-bold">{totalTranslated}</p>
              <p className="text-sm text-muted-foreground">Total Strings</p>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Languages in file:</p>
            <div className="flex flex-wrap gap-2">
              {selectedLanguages.map((lang) => {
                const progress = translationProgress[lang];
                const isSource = lang === sourceLanguage;
                const isComplete = progress && progress.translatedStrings === progress.totalStrings;

                return (
                  <Badge
                    key={lang}
                    variant={isSource ? 'default' : isComplete ? 'secondary' : 'outline'}
                  >
                    {lang}
                    {isSource && ' (Source)'}
                  </Badge>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Output */}
      <Card>
        <CardHeader>
          <CardTitle>Translated XCStrings File</CardTitle>
          <CardDescription>
            Copy the content below or download as a .xcstrings file
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={outputJson}
            readOnly
            className="font-mono text-sm h-[500px] max-h-[70vh] resize-none overflow-y-auto"
          />

          <div className="flex gap-2">
            <Button onClick={handleCopy} className="flex-1">
              <Copy className="h-4 w-4 mr-2" />
              Copy to Clipboard
            </Button>
            <Button onClick={handleDownload} variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download File
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between gap-2">
        <Button variant="outline" onClick={previousStep}>
          Back
        </Button>
        <Button onClick={resetWizard} variant="outline">
          <RotateCcw className="h-4 w-4 mr-2" />
          Start Over
        </Button>
      </div>
    </div>
  );
}

