# Quick Start Guide

## Installation & Running

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Open in browser
# Visit http://localhost:3000
```

## Usage

### 1. **Step 1: Input XCStrings**
   - Click "Load Sample" to see an example, or
   - Copy your .xcstrings file content from Xcode
   - Paste it into the text area
   - Click "Parse XCStrings"

### 2. **Step 2: Configure Languages**
   - View existing languages with translation progress
   - **Add Languages**: Click "Add Language" to select from 35+ options
   - **Remove Languages**: Click the trash icon next to any language (except source)
   - **Remove All**: Reset to just the source language
   - **Exclude Strings**: Uncheck strings you don't want translated (like brand names)

### 3. **Step 3: Translation Settings**
   - Enter your OpenAI API key (get one at https://platform.openai.com/api-keys)
   - Click "Test Key" to verify it works
   - Check "Save API key" to store it securely in your browser
   - Select a model (GPT-4o Mini recommended for best balance)

### 4. **Step 4: Translate**
   - **Individual**: Click "Translate" on any language
   - **Batch**: Check multiple languages and click "Translate Selected"
   - **Refresh**: Re-translate all strings for a language
   - Watch real-time progress bars
   - Translations happen directly with OpenAI (no intermediary)

### 5. **Step 5: Output**
   - See summary of translated languages and strings
   - **Copy**: Copy the JSON to clipboard
   - **Download**: Save as Localizable.xcstrings
   - Paste back into Xcode

## Features

✅ **35+ Languages**: Major world languages and regional variants  
✅ **Smart Translations**: Preserves placeholders (%@, %lld, etc.)  
✅ **Super Fast**: All strings sent in ONE API call per language (not one-by-one!)  
✅ **Batch Processing**: Translate multiple languages at once  
✅ **Selective Translation**: Choose which strings to translate  
✅ **Progress Tracking**: Real-time updates per language  
✅ **Privacy First**: All data stays in your browser  
✅ **API Key Storage**: Secure browser storage with obfuscation  
✅ **Multiple Models**: Choose from GPT-4o, GPT-4o Mini, O1, and more  

## Tips

💡 **Save Money**: Use GPT-4o Mini for best cost/quality balance  
💡 **Brand Names**: Uncheck brand names and product names before translating  
💡 **Test First**: Try with a small file before translating large projects  
💡 **Context Matters**: Keep your string comments for better translations  
💡 **Review**: Always review translations before shipping to production  

## Troubleshooting

**"Invalid API key"**  
→ Make sure your key starts with `sk-` and has credits

**"Translation failed"**  
→ Check internet connection and API key permissions

**"Parse error"**  
→ Ensure you copied valid JSON from an .xcstrings file

**Rate limiting**  
→ The app adds small delays between requests automatically

## Sample XCStrings

A sample file is included at `/public/sample.xcstrings` - click "Load Sample" in Step 1 to try it!

## Cost Estimation

Using GPT-4o Mini (cheapest recommended):
- 100 strings → 5 languages ≈ $0.05-0.25 (5 API calls)
- 500 strings → 10 languages ≈ $0.50-2 (10 API calls)
- 1000 strings → 20 languages ≈ $2-5 (20 API calls)

**Note**: Batch optimization means only ONE API call per language, making it very cost-effective!

Actual costs vary based on string length and complexity.

## Need Help?

1. Check the main README.md for detailed documentation
2. Make sure you have Node.js 18+ installed
3. Verify your OpenAI API key has credits
4. Try the sample file first to test everything works

---

**Ready to translate your iOS app? Let's go! 🚀**

