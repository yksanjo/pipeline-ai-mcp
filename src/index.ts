import OpenAI from 'openai';
import readline from 'readline';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key'
});

// Simple JSON-RPC based MCP implementation
interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: number;
  method: string;
  params?: any;
}

interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: number;
  result?: any;
  error?: any;
}

let requestId = 1;

function sendResponse(response: JsonRpcResponse) {
  console.log(JSON.stringify(response));
}

async function handleRequest(request: JsonRpcRequest): Promise<void> {
  const { method, params } = request;

  try {
    if (method === 'generate_pipeline') {
      const result = await generatePipeline(params);
      sendResponse({
        jsonrpc: '2.0',
        id: request.id,
        result
      });
    } else if (method === 'list_languages') {
      sendResponse({
        jsonrpc: '2.0',
        id: request.id,
        result: {
          languages: ['nodejs', 'python', 'go', 'ruby', 'java', 'rust', 'php']
        }
      });
    } else if (method === 'list_platforms') {
      sendResponse({
        jsonrpc: '2.0',
        id: request.id,
        result: {
          platforms: ['github-actions', 'gitlab-ci', 'circleci', 'jenkins', 'aws-codepipeline']
        }
      });
    } else if (method === 'tools/list') {
      sendResponse({
        jsonrpc: '2.0',
        id: request.id,
        result: {
          tools: [
            {
              name: 'generate_pipeline',
              description: 'Generate a CI/CD pipeline configuration from natural language',
              inputSchema: {
                type: 'object',
                properties: {
                  description: { type: 'string' },
                  language: { type: 'string', enum: ['nodejs', 'python', 'go', 'ruby', 'java', 'rust', 'php'] },
                  platform: { type: 'string', enum: ['github-actions', 'gitlab-ci', 'circleci', 'jenkins', 'aws-codepipeline'] },
                  deploymentTarget: { type: 'string' }
                },
                required: ['description']
              }
            },
            {
              name: 'list_languages',
              description: 'List supported programming languages'
            },
            {
              name: 'list_platforms',
              description: 'List supported CI/CD platforms'
            }
          ]
        }
      });
    } else {
      sendResponse({
        jsonrpc: '2.0',
        id: request.id,
        error: {
          code: -32601,
          message: `Method not found: ${method}`
        }
      });
    }
  } catch (error) {
    sendResponse({
      jsonrpc: '2.0',
      id: request.id,
      error: {
        code: -32603,
        message: error instanceof Error ? error.message : 'Internal error'
      }
    });
  }
}

async function generatePipeline(params: any): Promise<string> {
  const { description, language = 'nodejs', platform = 'github-actions', deploymentTarget } = params;
  
  const prompt = `Generate a CI/CD pipeline configuration for ${platform}.
Programming Language: ${language}
Description: ${description}
${deploymentTarget ? `Deployment Target: ${deploymentTarget}` : ''}

Requirements:
- Include build, test, and deploy stages
- Use best practices for the specific platform
- Include appropriate caching strategies
- Output ONLY valid YAML, no explanations`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a DevOps expert. Generate ONLY valid YAML.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 4000
    });

    return completion.choices[0]?.message?.content || 'Failed to generate pipeline';
  } catch (error) {
    return generateMockPipeline(language, platform);
  }
}

function generateMockPipeline(language: string, platform: string): string {
  if (platform === 'github-actions') {
    return `name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Setup ${language}
      uses: actions/setup-${language === 'nodejs' ? 'node@v4' : 'unknown@v1'}
    - name: Install dependencies
      run: ${language === 'nodejs' ? 'npm ci' : 'echo "Install"'}
    - name: Test
      run: ${language === 'nodejs' ? 'npm test' : 'echo "Test"'}`;
  }
  
  return `stages:
  - build
  - test

build:
  stage: build
  script:
    - echo "Building ${language}..."`;
}

// Read JSON-RPC requests from stdin
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

process.stdin.setEncoding('utf8');

let buffer = '';

process.stdin.on('data', (chunk) => {
  buffer += chunk;
  
  // Try to parse complete JSON objects
  let newlineIndex;
  while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
    const line = buffer.slice(0, newlineIndex);
    buffer = buffer.slice(newlineIndex + 1);
    
    if (line.trim()) {
      try {
        const request = JSON.parse(line) as JsonRpcRequest;
        handleRequest(request);
      } catch (e) {
        // Ignore incomplete JSON
      }
    }
  }
});

console.error('🤖 Pipeline AI MCP Server running...');
