import OpenAI from 'openai';
import { TranslationRequest, TranslationResult } from './types';

export interface OpenAIModel {
  id: string;
  name: string;
  description?: string;
  created?: number;
}

/**
 * Fetch available models from OpenAI API
 */
export async function fetchAvailableModels(apiKey: string): Promise<{
  success: boolean;
  models?: OpenAIModel[];
  error?: string;
}> {
  try {
    const openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true,
    });

    const response = await openai.models.list();
    
    // Filter to only include GPT and O1 models, sorted by ID
    const filteredModels = response.data
      .filter(model => 
        model.id.startsWith('gpt-') || 
        model.id.startsWith('o1-') ||
        model.id.startsWith('o3-')
      )
      .sort((a, b) => {
        // Sort by name/id, with newer models first
        const order = ['gpt-5', 'gpt-4', 'gpt-3', 'o3', 'o1'];
        const aPrefix = order.find(prefix => a.id.startsWith(prefix)) || 'zzz';
        const bPrefix = order.find(prefix => b.id.startsWith(prefix)) || 'zzz';
        
        if (aPrefix !== bPrefix) {
          return order.indexOf(aPrefix) - order.indexOf(bPrefix);
        }
        
        return b.id.localeCompare(a.id);
      })
      .map(model => ({
        id: model.id,
        name: formatModelName(model.id),
        description: getModelDescription(model.id),
        created: model.created,
      }));

    return {
      success: true,
      models: filteredModels,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch models';
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Format model ID into a human-readable name
 */
function formatModelName(modelId: string): string {
  // Convert model ID to a more readable format
  return modelId
    .split('-')
    .map((part, index) => {
      // Capitalize first letter of each part
      if (index === 0 || part.length <= 2) {
        return part.toUpperCase();
      }
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(' ');
}

/**
 * Get a description for known models
 */
function getModelDescription(modelId: string): string {
  if (modelId.includes('gpt-5')) {
    if (modelId.includes('nano')) return 'Ultra-fast GPT-5 variant';
    if (modelId.includes('mini')) return 'Efficient GPT-5 model';
    if (modelId.includes('pro')) return 'Ultimate performance model';
    return 'Next generation flagship model';
  }
  
  if (modelId.includes('gpt-4o')) {
    if (modelId.includes('mini')) return 'Balanced performance and cost';
    return 'Most capable GPT-4 model';
  }
  
  if (modelId.includes('gpt-4-turbo')) {
    return 'Previous generation flagship model';
  }
  
  if (modelId.includes('gpt-3.5')) {
    return 'Fast and economical option';
  }
  
  if (modelId.includes('o1-preview') || modelId.includes('o1-mini')) {
    return 'Advanced reasoning model';
  }

  if (modelId.includes('o3')) {
    return 'Latest reasoning model';
  }
  
  return 'OpenAI language model';
}

/**
 * Test if an API key is valid
 */
export async function testApiKey(apiKey: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true, // We're in a browser environment
    });

    // Make a minimal API call to test the key
    await openai.models.list();

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to validate API key';
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Helper function to process promises with concurrency limit
 */
async function processBatchesWithConcurrency<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  concurrency: number
): Promise<R[]> {
  const results: Promise<R>[] = [];
  const executing: Promise<void>[] = [];

  for (const item of items) {
    const promise = processor(item).then((result) => {
      executing.splice(executing.indexOf(promise as unknown as Promise<void>), 1);
      return result;
    });
    
    results.push(promise);
    executing.push(promise as unknown as Promise<void>);

    if (executing.length >= concurrency) {
      await Promise.race(executing);
    }
  }

  return Promise.all(results);
}

/**
 * Translate all strings for a language in batches of 10 to avoid timeouts
 * Processes max 10 parallel requests at a time
 */
export async function translateLanguageBatch(
  apiKey: string,
  model: string,
  requests: TranslationRequest[],
  onProgress?: (current: number, total: number) => void
): Promise<TranslationResult[]> {
  if (requests.length === 0) {
    return [];
  }

  const targetLanguage = requests[0].targetLanguage;
  const targetLanguageName = requests[0].targetLanguageName;
  const BATCH_SIZE = 10;
  const MAX_CONCURRENT_REQUESTS = 10;

  try {
    const openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true,
    });

    // Split requests into batches of 10
    const batches: TranslationRequest[][] = [];
    for (let i = 0; i < requests.length; i += BATCH_SIZE) {
      batches.push(requests.slice(i, i + BATCH_SIZE));
    }

    let processedCount = 0;

    // Process batches with concurrency limit
    const processBatch = async (batch: TranslationRequest[]) => {
      try {
        // Build structured input for translations
        const stringsToTranslate = batch.map((req, index) => {
          const placeholderInfo = req.placeholders.length > 0
            ? ` [PLACEHOLDERS: ${req.placeholders.join(', ')}]`
            : '';
          const contextInfo = req.comment ? ` [CONTEXT: ${req.comment}]` : '';
          
          return {
            index: index + 1,
            text: req.sourceText,
            additionalInfo: `${contextInfo}${placeholderInfo}`.trim() || undefined,
          };
        });

        // Get app context from the first request (all requests in a batch have the same context)
        const appContext = batch[0]?.appContext;
        const appContextInfo = appContext 
          ? `\n\nAPP CONTEXT:\n${appContext}\n\nUse this context to make your translations more appropriate and natural for this specific app.`
          : '';

        const prompt = `Translate the following app interface strings from English to ${targetLanguageName} (language code: ${targetLanguage}).${appContextInfo}

TRANSLATION STYLE:
- Avoid overly formal but easy to understand language
- Use common words and phrases people actually say
- Match the natural speaking style of native speakers

CRITICAL TECHNICAL RULES:
1. Preserve ALL placeholders EXACTLY as they appear (e.g., %@, %1$@, %lld, etc.)
2. Keep placeholders in the SAME positions and order
3. Preserve ALL escape sequences (\\n, \\t, \\r) EXACTLY as they appear in the source text
4. Maintain the same number of translations as input strings in the same order

Strings to translate:
${JSON.stringify(stringsToTranslate, null, 2)}`;

        // Define the response schema for structured output
        const responseSchema = {
          type: "object",
          properties: {
            translations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  index: {
                    type: "number",
                    description: "The index of the string being translated (matches input index)"
                  },
                  translated: {
                    type: "string",
                    description: "The translated text with all placeholders and escape sequences preserved"
                  }
                },
                required: ["index", "translated"],
                additionalProperties: false
              }
            }
          },
          required: ["translations"],
          additionalProperties: false
        };

        // GPT-5 series models don't support temperature parameter
        const isGPT5Series = model.startsWith('gpt-5');
        
        const response = await openai.chat.completions.create({
          model,
          messages: [
            {
              role: 'system',
              content: 'You are a native-speaking translator specializing in mobile app localization. You translate using CASUAL, NATURAL everyday language - avoiding formal or overly professional phrasing. You MUST preserve ALL technical elements like placeholders (e.g., %@, %1$@, %lld) and escape sequences (e.g., \\n, \\t) EXACTLY as they appear in the source text.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "translation_batch",
              strict: true,
              schema: responseSchema,
            },
          },
          max_completion_tokens: 8000,
          ...(isGPT5Series ? {} : { temperature: 0.3 }),
        });

        const responseContent = response.choices[0]?.message?.content?.trim() || '';
        
        if (!responseContent) {
          // Mark all in this batch as failed
          const batchResults = batch.map((req) => ({
            stringKey: req.stringKey,
            targetLanguage: req.targetLanguage,
            translatedText: '',
            success: false,
            error: 'Empty translation received',
          }));
          
          processedCount += batch.length;
          if (onProgress) {
            onProgress(processedCount, requests.length);
          }
          
          return batchResults;
        }

        // Parse the structured JSON response
        let parsedResponse: { translations: Array<{ index: number; translated: string }> };
        try {
          parsedResponse = JSON.parse(responseContent);
        } catch {
          // JSON parsing failed
          const batchResults = batch.map((req) => ({
            stringKey: req.stringKey,
            targetLanguage: req.targetLanguage,
            translatedText: '',
            success: false,
            error: 'Failed to parse translation response',
          }));
          
          processedCount += batch.length;
          if (onProgress) {
            onProgress(processedCount, requests.length);
          }
          
          return batchResults;
        }

        // Validate response structure
        if (!parsedResponse.translations || !Array.isArray(parsedResponse.translations)) {
          const batchResults = batch.map((req) => ({
            stringKey: req.stringKey,
            targetLanguage: req.targetLanguage,
            translatedText: '',
            success: false,
            error: 'Invalid response structure',
          }));
          
          processedCount += batch.length;
          if (onProgress) {
            onProgress(processedCount, requests.length);
          }
          
          return batchResults;
        }

        // Process results for this batch
        const batchResults: TranslationResult[] = [];
        for (let i = 0; i < batch.length; i++) {
          const request = batch[i];
          const translationObj = parsedResponse.translations.find(t => t.index === i + 1);

          if (translationObj?.translated !== undefined) {
            batchResults.push({
              stringKey: request.stringKey,
              targetLanguage: request.targetLanguage,
              translatedText: translationObj.translated,
              success: true,
            });
          } else {
            batchResults.push({
              stringKey: request.stringKey,
              targetLanguage: request.targetLanguage,
              translatedText: '',
              success: false,
              error: 'Translation not found in response',
            });
          }

          processedCount++;
          if (onProgress) {
            onProgress(processedCount, requests.length);
          }
        }

        return batchResults;
      } catch (error) {
        // Handle batch-specific errors
        const message = error instanceof Error ? error.message : 'Batch translation failed';
        
        // Update processed count even on error
        processedCount += batch.length;
        if (onProgress) {
          onProgress(processedCount, requests.length);
        }
        
        return batch.map((req) => ({
          stringKey: req.stringKey,
          targetLanguage: req.targetLanguage,
          translatedText: '',
          success: false,
          error: message,
        }));
      }
    };

    // Process batches with max 10 concurrent requests
    const batchResultsArray = await processBatchesWithConcurrency(
      batches,
      processBatch,
      MAX_CONCURRENT_REQUESTS
    );
    
    // Flatten all batch results into a single array
    const allResults = batchResultsArray.flat();

    return allResults;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Batch translation failed';
    
    // Return all as failed with the same error
    return requests.map((req) => ({
      stringKey: req.stringKey,
      targetLanguage: req.targetLanguage,
      translatedText: '',
      success: false,
      error: message,
    }));
  }
}

/**
 * Translate a single string
 */
export async function translateString(
  apiKey: string,
  model: string,
  request: TranslationRequest
): Promise<TranslationResult> {
  try {
    const openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true,
    });

    // Build the translation prompt
    const placeholderInfo = request.placeholders.length > 0
      ? `\n\nIMPORTANT: This string contains placeholders (${request.placeholders.join(', ')}). You MUST preserve these EXACT placeholders in the translation in the SAME positions and order.`
      : '';

    const contextInfo = request.comment
      ? `\n\nContext: ${request.comment}`
      : '';

    const prompt = `Translate the following iOS app string from English to ${request.targetLanguageName} (language code: ${request.targetLanguage}).

Source text: "${request.sourceText}"${contextInfo}${placeholderInfo}

Provide ONLY the translated text without any explanation, quotes, or additional commentary. The translation should be natural and appropriate for a mobile app interface.`;

    // GPT-5 series models don't support temperature parameter
    const isGPT5Series = model.startsWith('gpt-5');
    
    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are a professional translator specializing in iOS app localization. You preserve technical elements like placeholders and formatting while providing natural, culturally appropriate translations.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_completion_tokens: 500,
      ...(isGPT5Series ? {} : { temperature: 0.3 }), // Lower temperature for more consistent translations (not available in GPT-5 series)
    });

    const translatedText = response.choices[0]?.message?.content?.trim() || '';

    if (!translatedText) {
      return {
        stringKey: request.stringKey,
        targetLanguage: request.targetLanguage,
        translatedText: '',
        success: false,
        error: 'Empty translation received',
      };
    }

    return {
      stringKey: request.stringKey,
      targetLanguage: request.targetLanguage,
      translatedText,
      success: true,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Translation failed';
    return {
      stringKey: request.stringKey,
      targetLanguage: request.targetLanguage,
      translatedText: '',
      success: false,
      error: message,
    };
  }
}

/**
 * Translate multiple strings with progress callback (legacy - kept for compatibility)
 * For better performance, use translateLanguageBatch instead
 */
export async function translateBatch(
  apiKey: string,
  model: string,
  requests: TranslationRequest[],
  onProgress?: (completed: number, total: number, currentKey: string) => void
): Promise<TranslationResult[]> {
  // Use the new batch method which is much more efficient
  return translateLanguageBatch(
    apiKey,
    model,
    requests,
    (current, total) => {
      if (onProgress) {
        const currentKey = current < requests.length ? requests[current].stringKey : '';
        onProgress(current, total, currentKey);
      }
    }
  );
}

