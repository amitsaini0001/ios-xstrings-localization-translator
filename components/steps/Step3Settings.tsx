'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/contexts/TranslationContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Key, Sparkles, CheckCircle2, AlertCircle, Info, RefreshCw } from 'lucide-react';
import { testApiKey, fetchAvailableModels, OpenAIModel } from '@/lib/openai-service';

export function Step3Settings() {
  const {
    apiKey,
    saveApiKey,
    selectedModel,
    setApiKey,
    setSaveApiKey,
    setSelectedModel,
    previousStep,
    nextStep,
  } = useTranslation();

  const [localApiKey, setLocalApiKey] = useState(apiKey);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [keyTestResult, setKeyTestResult] = useState<{
    tested: boolean;
    valid: boolean;
    error?: string;
  }>({ tested: false, valid: false });
  const [availableModels, setAvailableModels] = useState<OpenAIModel[]>([]);
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const [modelsError, setModelsError] = useState<string | undefined>();

  const handleAutoValidate = async () => {
    if (!apiKey) return;
    
    setIsTestingKey(true);
    const result = await testApiKey(apiKey);
    setIsTestingKey(false);

    setKeyTestResult({
      tested: true,
      valid: result.success,
      error: result.error,
    });
  };

  const fetchModels = async (key: string) => {
    setIsFetchingModels(true);
    setModelsError(undefined);

    const result = await fetchAvailableModels(key);

    setIsFetchingModels(false);

    if (result.success && result.models) {
      setAvailableModels(result.models);
      
      // If current selected model is not in the list, select the first available one
      if (result.models.length > 0) {
        const modelExists = result.models.some(m => m.id === selectedModel);
        if (!modelExists) {
          setSelectedModel(result.models[0].id);
        }
      }
    } else {
      setModelsError(result.error);
    }
  };

  // Auto-validate and fetch models if API key is already present (from storage)
  useEffect(() => {
    if (apiKey && !keyTestResult.tested) {
      handleAutoValidate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch models when API key is validated
  useEffect(() => {
    if (keyTestResult.valid && localApiKey) {
      fetchModels(localApiKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyTestResult.valid, localApiKey]);

  const handleValidateKey = async () => {
    if (!localApiKey.trim()) return;

    setIsTestingKey(true);
    setKeyTestResult({ tested: false, valid: false });
    setAvailableModels([]); // Clear previous models
    setModelsError(undefined);

    const result = await testApiKey(localApiKey);

    setIsTestingKey(false);
    setKeyTestResult({
      tested: true,
      valid: result.success,
      error: result.error,
    });

    if (result.success) {
      setApiKey(localApiKey);
      // Models will be fetched automatically by the useEffect
    }
  };

  const handleNext = () => {
    if (keyTestResult.valid && availableModels.length > 0 && selectedModel) {
      nextStep();
    }
  };

  const canProceed = keyTestResult.valid && 
                     availableModels.length > 0 && 
                     !isFetchingModels && 
                     selectedModel;

  const handleRefreshModels = () => {
    if (localApiKey) {
      fetchModels(localApiKey);
    }
  };

  const selectedModelInfo = availableModels.find((m) => m.id === selectedModel);

  return (
    <div className="space-y-6">
      {/* API Key Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            OpenAI API Key
          </CardTitle>
          <CardDescription>
            Enter your OpenAI API key to enable translations. Your key is stored securely in your browser.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="sk-..."
              value={localApiKey}
              onChange={(e) => {
                setLocalApiKey(e.target.value);
                setKeyTestResult({ tested: false, valid: false });
              }}
              className="w-full"
            />
          </div>

          {keyTestResult.tested && (
            <>
              {keyTestResult.valid ? (
                <Alert className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-900">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertDescription className="text-green-700 dark:text-green-300">
                    API key is valid and ready to use!
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {keyTestResult.error || 'Invalid API key'}
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox
              id="saveKey"
              checked={saveApiKey}
              onCheckedChange={(checked) => setSaveApiKey(checked === true)}
            />
            <Label
              htmlFor="saveKey"
              className="text-sm font-normal cursor-pointer"
            >
              Save API key securely in browser for future use
            </Label>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Your API key is never sent to our servers. It&apos;s stored locally in your browser and only used to communicate directly with OpenAI&apos;s API.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Model Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Translation Model
          </CardTitle>
          <CardDescription>
            Choose the OpenAI model to use for translations. Models are fetched from your OpenAI account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!keyTestResult.valid ? (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Please validate your API key first to see available models.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="model">Model</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRefreshModels}
                    disabled={isFetchingModels}
                  >
                    <RefreshCw className={`h-4 w-4 mr-1 ${isFetchingModels ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
                
                {isFetchingModels ? (
                  <div className="flex items-center justify-center py-8">
                    <Spinner className="h-6 w-6 mr-2" />
                    <span className="text-sm text-muted-foreground">Loading models...</span>
                  </div>
                ) : modelsError ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Failed to fetch models: {modelsError}
                    </AlertDescription>
                  </Alert>
                ) : availableModels.length > 0 ? (
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger id="model">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableModels.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          <div className="flex items-center gap-2">
                            <span>{model.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No compatible models found. Please check your API key permissions.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {selectedModelInfo && !isFetchingModels && (
                <div className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{selectedModelInfo.name}</h4>
                  </div>
                  {selectedModelInfo.description && (
                    <p className="text-sm text-muted-foreground">
                      {selectedModelInfo.description}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Badge variant="outline">
                      Model ID: {selectedModelInfo.id}
                    </Badge>
                  </div>
                </div>
              )}

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Models are loaded dynamically from OpenAI. Choose a model based on your needs - newer models typically offer better performance but may have different pricing.
                </AlertDescription>
              </Alert>
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between gap-2">
        <Button variant="outline" onClick={previousStep}>
          Back
        </Button>
        {!keyTestResult.valid ? (
          <Button 
            onClick={handleValidateKey} 
            disabled={!localApiKey.trim() || isTestingKey}
          >
            {isTestingKey ? (
              <>
                <Spinner className="h-4 w-4 mr-2" />
                Validating Key...
              </>
            ) : (
              <>
                <Key className="h-4 w-4 mr-2" />
                Validate Key
              </>
            )}
          </Button>
        ) : (
          <Button 
            onClick={handleNext}
            disabled={!canProceed}
          >
            {isFetchingModels ? (
              <>
                <Spinner className="h-4 w-4 mr-2" />
                Loading Models...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Next
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

