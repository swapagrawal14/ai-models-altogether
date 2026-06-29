# AI Model Selector

A web app that lets you chat with any AI model from any provider by selecting your preferred provider and model.

## Features

- **Multi-provider support**: OpenRouter, OpenAI, Anthropic (Claude), Google (Gemini), xAI (Grok)
- **Dynamic model listing**: Models are fetched automatically based on your API key
- **Clean chat interface**: Simple, dark-themed chat UI

## How to Use

1. Select a provider from the dropdown
2. Enter your API key for that provider
3. Choose a model from the populated list
4. Start chatting!

### Supported Providers & API Keys

| Provider | API Key Format |
|----------|---------------|
| OpenRouter | `sk-or-...` |
| OpenAI | `sk-...` |
| Anthropic | `sk-ant-...` |
| Google | AI API key from Google Cloud |
| xAI | `xai-...` |

## Local Development

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Deploy

Deployed on Vercel: https://ai-selector-web.vercel.app

To deploy your own copy:
```bash
vercel --prod
```