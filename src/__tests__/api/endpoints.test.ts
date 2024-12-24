import request from 'supertest';
import express from 'express';
import '../helpers/openai';  // Import OpenAI mock before importing chat handler
import { POST as chatHandler } from '../../service/chat';
import { prismaMock } from '../helpers/prisma';
import { v4 as uuidv4 } from 'uuid';

const app = express();
app.use(express.json());

// Set up the routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});
app.post('/api/chat', chatHandler);

describe('API Endpoints', () => {
  describe('GET /health', () => {
    it('should return 200 OK', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });

  describe('POST /api/chat', () => {
    const validChatRequest = {
      chatId: uuidv4(),
      messages: [
        { role: 'user' as const, content: 'Hello' }
      ]
    };

    beforeEach(() => {
      // Mock environment variables
      process.env.AZURE_OPENAI_API_KEY = 'test-key';
      process.env.AZURE_OPENAI_ENDPOINT = 'https://test.openai.azure.com';
      process.env.AZURE_OPENAI_DEPLOYMENT_NAME = 'test-deployment';

      // Mock the database calls
      prismaMock.chat.create.mockResolvedValue({
        id: '1',
        chatId: validChatRequest.chatId,
        content: validChatRequest.messages[0].content,
        role: validChatRequest.messages[0].role,
        metadata: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    afterEach(() => {
      // Clean up environment variables
      delete process.env.AZURE_OPENAI_API_KEY;
      delete process.env.AZURE_OPENAI_ENDPOINT;
      delete process.env.AZURE_OPENAI_DEPLOYMENT_NAME;
    });

    it('should return 200 and stream the chat response', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send(validChatRequest);
      
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/text\/event-stream/);
    });
  });
});
