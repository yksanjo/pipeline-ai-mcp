# 🤖 Pipeline AI MCP Server

MCP (Model Context Protocol) Server for Pipeline AI - Integrate with AI assistants like Claude, Cursor, and others.

## Features

- 🔌 **MCP Protocol** - Standardized integration with AI assistants
- 🛠️ **Tool-based** - Exposes pipeline generation as callable tools
- 🤖 **AI-Powered** - Uses GPT-4 for intelligent generation
- 📦 **Lightweight** - Minimal dependencies

## Installation

```bash
npm install
npm run build
```

## Configuration

Add to your AI assistant's MCP configuration:

```json
{
  "mcpServers": {
    "pipeline-ai": {
      "command": "node",
      "args": ["/path/to/pipeline-ai-mcp/dist/index.js"],
      "env": {
        "OPENAI_API_KEY": "your-api-key"
      }
    }
  }
}
```

## Available Tools

### generate_pipeline
Generate a CI/CD pipeline from natural language.

```typescript
{
  description: "build and test a Node.js app",  // required
  language: "nodejs",                           // default: nodejs
  platform: "github-actions",                    // default: github-actions
  deploymentTarget: "aws-s3"                     // optional
}
```

### list_languages
List all supported programming languages.

### list_platforms
List all supported CI/CD platforms.

## Environment Variables

```bash
OPENAI_API_KEY=your_api_key_here
```

## Example Usage

In Claude or other AI assistants:
```
Use the generate_pipeline tool to create a GitHub Actions workflow for a Python app that deploys to AWS Lambda.
```

## Tech Stack

- TypeScript
- @modelcontextprotocol/server
- OpenAI SDK

## License

MIT
