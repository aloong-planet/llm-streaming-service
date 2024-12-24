# LLM Streaming Service

[![CI](https://github.com/aloong-planet/llm-streaming-service/actions/workflows/ci.yml/badge.svg)](https://github.com/aloong-planet/llm-streaming-service/actions/workflows/ci.yml)

## Overview

This service provides a robust chat interface powered by Azure OpenAI's GPT models, featuring real-time streaming responses and persistent conversation management. It's designed for applications requiring interactive AI chat capabilities with context awareness.

### Key Capabilities

- **Real-time Response Streaming**: Responses are streamed in real-time using Server-Sent Events (SSE), providing immediate feedback to users
- **Conversation Context**: Maintains chat history and context across multiple messages, allowing for coherent conversations
- **Configurable System Messages**: Support for custom system prompts to guide AI behavior, with fallback to default prompts
- **Persistent Storage**: All messages are stored in a SQLite database, enabling conversation history retrieval and analysis
- **Context Length Management**: Automatically manages conversation length by limiting the number of previous messages included in context

## Detailed Setup Guide

### 1. Development Environment Setup

#### System Requirements
- Node.js (>= 18.0.0)
- npm (>= 9.0.0)
- Git
- SQLite 3
- A code editor (VS Code recommended)

#### VS Code Extensions (Recommended)
- Prisma (for database schema)
- ESLint
- Prettier
- Thunder Client (for API testing)

### 2. Project Setup

```bash
# Clone the repository
git clone <repository-url>
cd llm-streaming-service

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### 3. Environment Configuration

Edit `.env` file with your Azure OpenAI credentials:
```env
# Azure OpenAI Configuration
AZURE_OPENAI_API_KEY=your_api_key_here
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=your_deployment_name

# Optional: Override default config file location
CONFIG_PATH=/path/to/custom/config.toml
```

### 4. Database Setup

```bash
# Initialize the database with Prisma
npx prisma migrate dev --name init

# Verify database setup
make db-tables    # List all tables
make db-schema    # Show database schema
```

### 5. Configuration

The service uses TOML for configuration. Default settings in `config/default.toml`:
```toml
[chat]
# Number of conversation pairs to maintain in context
max_conversation_pairs = 50

[openai]
# Model parameters
temperature = 0.7
model = "gpt-4"  # Overridden by AZURE_OPENAI_DEPLOYMENT_NAME if set
```

## Development

### CI/CD Pipeline

This project uses GitHub Actions for continuous integration. The CI pipeline includes:

- **Type Checking**: Validates TypeScript types
- **Unit Tests**: Runs the test suite with Jest
- **Code Coverage**: Generates and uploads test coverage reports
- **Docker Build**: Verifies Docker image builds successfully

The CI workflow runs on:
- Every push to the `main` branch
- Every pull request targeting the `main` branch

You can view the CI status and test results in the [Actions tab](https://github.com/aloong-planet/llm-streaming-service/actions).

### Required Secrets

For the CI pipeline to work, you need to set up the following secrets in your GitHub repository:

- `AZURE_OPENAI_API_KEY`: Your Azure OpenAI API key
- `AZURE_OPENAI_ENDPOINT`: Your Azure OpenAI endpoint URL
- `AZURE_OPENAI_DEPLOYMENT_NAME`: Your Azure OpenAI deployment name

## Running the Service

### Development Mode

```bash
# Start the service in development mode with hot reload
npm run dev

# The service will be available at http://localhost:3000
```

### Production Mode

```bash
# Build the TypeScript code
npm run build

# Start the production server
npm start
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (useful during development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Manual Testing

You can test the API using curl or any HTTP client. Here's an example using curl:

```bash
# Start a new chat conversation
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "chatId": "123e4567-e89b-12d3-a456-426614174000",
    "messages": [
      {
        "role": "system",
        "content": "You are a helpful assistant."
      },
      {
        "role": "user",
        "content": "Hello, how are you?"
      }
    ]
  }'
```

### Using Thunder Client (VS Code Extension)

1. Install Thunder Client extension in VS Code
2. Import the provided collection from `thunder-collection.json`
3. Open Thunder Client and navigate to the "LLM Streaming Service" collection
4. Execute the "Chat" request

## Monitoring and Debugging

### Logging

The service provides detailed logging for debugging:
- Request/response details
- Conversation context
- Error messages

Example log output:
```
[requestId] Full conversation context: {
  "total_messages": 3,
  "messages": [
    {
      "index": 1,
      "role": "system",
      "content": "You are a helpful assistant",
      "length": 26
    },
    {
      "index": 2,
      "role": "user",
      "content": "Hello",
      "length": 5
    }
  ]
}
```

### Database Inspection

Use the provided Makefile commands for database inspection:
```bash
# Open SQLite shell
make db-shell

# Common queries:
# List all chats
SELECT DISTINCT chatId FROM Chat;

# View messages for a specific chat
SELECT role, content, createdAt 
FROM Chat 
WHERE chatId = 'your-chat-id' 
ORDER BY createdAt;
```

## Common Issues and Solutions

### 1. Database Migration Errors
```bash
# Reset the database
npx prisma migrate reset

# Generate a fresh migration
npx prisma migrate dev
```

### 2. Azure OpenAI Connection Issues
- Verify your Azure OpenAI credentials in `.env`
- Ensure your IP is whitelisted in Azure OpenAI settings
- Check if the deployment name matches your model deployment

### 3. TypeScript Build Errors
```bash
# Clean the build directory
rm -rf dist/

# Rebuild the project
npm run build
```

## Development Workflow

1. **Making Changes**
   ```bash
   # Create a new branch
   git checkout -b feature/your-feature

   # Start development server
   npm run dev

   # Write your code
   # Write tests for new features

   # Run tests
   npm test

   # Build to verify
   npm run build
   ```

2. **Testing Changes**
   - Write unit tests in `__tests__/`
   - Test API endpoints using Thunder Client or curl
   - Verify database changes using Makefile commands

3. **Committing Changes**
   ```bash
   git add .
   git commit -m "feat: your feature description"
   git push origin feature/your-feature
   ```

## Support and Resources

- Azure OpenAI Documentation: [Link]
- Prisma Documentation: [Link]
- Express.js Documentation: [Link]
- File Issues: [Link to Issues]
- Contributing Guide: [Link to CONTRIBUTING.md]

## License
[MIT License](LICENSE)

## Project Structure
```
.
├── config/
│   └── default.toml       # App configuration
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Database migrations
├── src/
│   ├── index.ts         # Application entry
│   ├── lib/            # Shared utilities
│   │   ├── config.ts   # Configuration loader
│   │   ├── openai.ts   # OpenAI client
│   │   └── prisma.ts   # Database client
│   ├── service/        # Business logic
│   │   └── chat.ts     # Chat service
│   └── __tests__/      # Test files
└── package.json
```

## Database Schema

```sql
model Chat {
    id        String   @id @default(uuid())
    chatId    String   
    role      String   // 'system', 'user', or 'assistant'
    content   String
    createdAt DateTime @default(now())
}
```

## API Endpoints

### POST /api/chat
Streams chat completions with conversation context.

Request:
```json
{
  "chatId": "uuid-v4",
  "messages": [
    {
      "role": "system",
      "content": "Optional system message"
    },
    {
      "role": "user",
      "content": "User message"
    }
  ]
}
```

Response: Server-Sent Events stream

## Error Handling
- Custom error classes for different types of errors
- Proper error propagation
- Detailed error messages in development
- Safe error responses in production

## Contributing
1. Fork the repository
2. Create your feature branch
3. Write tests for new features
4. Ensure all tests pass
5. Submit a pull request
