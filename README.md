# XCStrings Translator

A powerful web application for translating iOS XCStrings files to multiple languages using OpenAI's API. Built with Next.js 16, React 19, and Shadcn UI.

## Features

- 🌍 **Multi-Language Support**: Translate to 35+ languages including major world languages and regional variants
- 🤖 **AI-Powered**: Uses OpenAI's latest models (GPT-4o, GPT-4o Mini, O1, etc.) for accurate translations
- 🔒 **Privacy-First**: All data stays local in your browser; API keys are stored securely
- ⚡ **Blazing Fast**: All strings batched in a single API call per language (not one-by-one!)
- 🎯 **Batch Translation**: Translate multiple languages at once or individually
- 🎯 **Selective Translation**: Choose which strings to translate and which to keep (e.g., brand names)
- 📊 **Progress Tracking**: Real-time progress bars for each language
- 🔄 **Refresh Translations**: Re-translate strings with updated content
- 💾 **Easy Export**: Copy to clipboard or download as .xcstrings file
- 🎨 **Modern UI**: Clean, responsive design built with Shadcn UI components

## How It Works

### Step 1: Input XCStrings
- Paste your existing .xcstrings file content
- The app validates and parses the JSON structure
- Automatically detects the source language

### Step 2: Configure Languages
- View all currently supported languages in your file
- Add new languages from 35+ supported options
- Remove unwanted languages
- Mark specific strings as "do not translate" (like brand names or technical terms)
- See translation progress for each language

### Step 3: Translation Settings
- Enter your OpenAI API key (with optional secure browser storage)
- Choose your preferred translation model:
  - **GPT-4o**: Most capable, best for complex translations
  - **GPT-4o Mini**: Balanced performance and cost (recommended)
  - **GPT-4 Turbo**: Previous generation flagship
  - **GPT-3.5 Turbo**: Fast and economical
  - **O1 Preview/Mini**: Advanced reasoning models
- Test your API key before proceeding

### Step 4: Translate
- Translate all languages at once or individually
- Select multiple languages for batch translation
- Refresh translations to overwrite existing ones
- Real-time progress tracking with string-by-string updates
- Error handling with retry options

### Step 5: Output
- View translation summary (languages, strings translated)
- Copy the translated XCStrings to clipboard
- Download as a .xcstrings file ready to use in Xcode
- Start over for a new translation project

## Technical Features

### XCStrings Format Handling
- Preserves the exact structure of your XCStrings file
- Handles placeholders (%@, %1$@, %lld, etc.) correctly
- Respects `shouldTranslate: false` flags
- Maintains comments and metadata
- Supports string variations (plurals, device-specific)

### Translation Quality & Performance
- **Batch Translation**: All strings for a language are translated in a single API call (much faster!)
- Includes string comments as context for better translations
- AI sees all strings together, providing better consistency
- Preserves all placeholders in the correct positions
- Uses low temperature for consistent results
- Optimized prompts for iOS localization

### Browser Storage
- Secure API key storage with obfuscation
- Saves model preferences
- Remembers "save API key" setting
- All storage is local (localStorage)

## Getting Started

### Prerequisites
- Node.js 18+ or later
- pnpm (or npm/yarn)
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Installation

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage Example

1. **Get your XCStrings file**: In Xcode, open your `.xcstrings` file and copy its content
2. **Paste into the app**: Go to the web app and paste the content in Step 1
3. **Configure**: Add or remove languages, exclude non-translatable strings
4. **Set up OpenAI**: Enter your API key and choose a model
5. **Translate**: Click translate and watch the progress
6. **Export**: Download or copy the translated file back to Xcode

## Supported Languages

Arabic, Chinese (Simplified/Traditional), Czech, Danish, Dutch, English (US/UK/AU), Finnish, French (France/Canada), German, Greek, Hebrew, Hindi, Hungarian, Indonesian, Italian, Japanese, Korean, Malay, Norwegian, Polish, Portuguese (Brazil/Portugal), Romanian, Russian, Slovak, Spanish (Spain/Mexico), Swedish, Thai, Turkish, Ukrainian, Vietnamese, and more.

## Technology Stack

- **Framework**: Next.js 16 with App Router
- **UI**: Shadcn UI components
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **API**: OpenAI SDK
- **TypeScript**: Full type safety

## Privacy & Security

- **No Server**: All processing happens in your browser
- **Local Storage**: API keys stored locally with obfuscation
- **Direct API Calls**: Your API key only communicates with OpenAI
- **No Tracking**: We don't collect or store any of your data

## API Costs

Translation costs depend on:
- Number of strings
- Target languages
- Selected model
- String length

**Batch Translation Optimization**: All strings for each language are sent in a single API call, making it very efficient!

Approximate costs with GPT-4o Mini (cheapest recommended):
- 100 strings to 5 languages: ~$0.05-0.25 (5 API calls total)
- 500 strings to 10 languages: ~$0.50-2 (10 API calls total)
- 1000 strings to 20 languages: ~$2-5 (20 API calls total)

See [OpenAI Pricing](https://openai.com/api/pricing/) for current rates.

## Tips for Best Results

1. **Use GPT-4o Mini** for the best balance of cost and quality
2. **Review translations** before deploying to production
3. **Exclude brand names** and technical terms from translation
4. **Keep comments** in your XCStrings for better context
5. **Batch translate** similar languages together for consistency

## Troubleshooting

### API Key Issues
- Make sure your key starts with `sk-`
- Check that your OpenAI account has credits
- Test the key using the "Test Key" button

### Translation Errors
- Check your internet connection
- Verify the API key has access to the selected model
- Try a different model if one fails
- Use "Refresh" to retry failed translations

### File Format Issues
- Ensure you're copying valid JSON from an .xcstrings file
- Check for trailing commas or syntax errors
- Use Xcode's "Show Raw File" if copying from the editor

## Contributing

This is an open-source project. Contributions are welcome!

## License

MIT License - feel free to use this in your projects!

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Shadcn UI](https://ui.shadcn.com/)
- Powered by [OpenAI](https://openai.com/)

---

**Made with ❤️ for iOS developers**
