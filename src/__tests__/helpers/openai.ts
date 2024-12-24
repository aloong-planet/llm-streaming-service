import { jest } from '@jest/globals';
import OpenAI from 'openai';

// Mock the OpenAI client
const mockOpenAI = {
    chat: {
        completions: {
            create: jest.fn().mockImplementation(() => {
                const stream = {
                    [Symbol.asyncIterator]: async function* () {
                        yield {
                            id: 'test-id',
                            object: 'chat.completion.chunk',
                            created: Date.now(),
                            model: 'test-model',
                            choices: [{ 
                                index: 0,
                                delta: { content: 'Test' },
                                finish_reason: null
                            }]
                        };
                        yield {
                            id: 'test-id',
                            object: 'chat.completion.chunk',
                            created: Date.now(),
                            model: 'test-model',
                            choices: [{ 
                                index: 0,
                                delta: { content: ' response' },
                                finish_reason: 'stop'
                            }]
                        };
                    }
                };
                return Promise.resolve(stream);
            })
        }
    }
} as unknown as OpenAI;

jest.mock('../../lib/openai', () => ({
    openai: mockOpenAI
}));

export { mockOpenAI };
