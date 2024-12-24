import { openai } from '../lib/openai';
import { OpenAIStream } from '../lib/openai-stream';
import { createAPIHandler, validateBody } from '../lib/api/handler';
import { ConfigurationError } from '../lib/errors/api-errors';
import { OpenAIError } from '../lib/errors/openai-errors';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { config } from '../lib/config';

// Default system message
const DEFAULT_SYSTEM_MESSAGE = {
    role: 'system' as const,
    content: 'You are a helpful AI assistant. Provide clear, accurate, and relevant responses.'
};

// Define request schema
const chatRequestSchema = z.object({
    chatId: z.string().uuid(),
    messages: z.array(
        z.object({
            role: z.enum(['user', 'assistant', 'system']),
            content: z.string(),
        })
    ),
});

/**
 * Fetches chat history with pagination for a specific chat session
 * Returns messages in chronological order
 */
async function fetchChatHistory(chatId: string, maxConversationPairs: number) {
    // First, get the system message if it exists
    const systemMessage = await prisma.chat.findFirst({
        where: {
            chatId,
            role: 'system'
        }
    });

    // Then get the latest non-system messages
    const nonSystemMessages = await prisma.chat.findMany({
        where: {
            chatId,
            role: {
                not: 'system'
            }
        },
        orderBy: {
            createdAt: 'desc'
        },
        take: maxConversationPairs * 2 // Multiply by 2 because each pair has user + assistant message
    });

    // Reverse to get chronological order
    const orderedMessages = nonSystemMessages.reverse();

    // Combine system message (if exists) with other messages
    return systemMessage 
        ? [systemMessage, ...orderedMessages]
        : orderedMessages;
}

export const POST = createAPIHandler(async (req, res, context) => {
    console.log(`[${context.requestId}] Received chat request`);

    // Validate request body
    const body = await validateBody(req, chatRequestSchema);
    console.log(`[${context.requestId}] Request body validated:`, body);

    // Validate environment variables
    if (!process.env.AZURE_OPENAI_API_KEY ||
        !process.env.AZURE_OPENAI_ENDPOINT ||
        !process.env.AZURE_OPENAI_DEPLOYMENT_NAME) {
        throw new ConfigurationError('Azure OpenAI configuration is missing');
    }

    try {
        // Extract system message from the request if present
        const systemMessage = body.messages.find(msg => msg.role === 'system');
        const nonSystemMessages = body.messages.filter(msg => msg.role !== 'system');

        // If there's a system message in the request, store/update it
        if (systemMessage) {
            // Check if we already have a system message for this chat
            const existingSystemMessage = await prisma.chat.findFirst({
                where: {
                    chatId: body.chatId,
                    role: 'system'
                }
            });

            if (existingSystemMessage) {
                // Update existing system message if it's different
                if (existingSystemMessage.content !== systemMessage.content) {
                    await prisma.chat.update({
                        where: { id: existingSystemMessage.id },
                        data: { content: systemMessage.content }
                    });
                }
            } else {
                // Create new system message
                await prisma.chat.create({
                    data: {
                        chatId: body.chatId,
                        role: 'system',
                        content: systemMessage.content
                    }
                });
            }
        }

        // Fetch chat history with configured limit
        const previousMessages = await fetchChatHistory(body.chatId, config.chat.max_conversation_pairs);

        // Convert messages to OpenAI format
        const conversationHistory = previousMessages.map(msg => ({
            role: msg.role as 'user' | 'assistant' | 'system',
            content: msg.content
        }));

        // Get the current system message (from history or default)
        const currentSystemMessage = conversationHistory.find(msg => msg.role === 'system') || 
                                   (systemMessage || DEFAULT_SYSTEM_MESSAGE);

        // Build the context with system message first
        const contextualMessages = [
            currentSystemMessage,
            ...conversationHistory.filter(msg => msg.role !== 'system'),
            ...nonSystemMessages
        ];

        console.log(`[${context.requestId}] Full conversation context:`);
        console.dir({
            total_messages: contextualMessages.length,
            messages: contextualMessages.map((msg, index) => ({
                index: index + 1,
                role: msg.role,
                content: msg.content,
                length: msg.content.length
            }))
        }, { depth: null, colors: true });

        // Create chat completion
        const response = await openai.chat.completions.create({
            model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
            messages: contextualMessages,
            stream: true,
            temperature: config.openai.temperature,
        });

        // Set up SSE headers
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        });

        // Store the user messages (excluding system message)
        if (nonSystemMessages.length > 0) {
            await prisma.chat.create({
                data: {
                    chatId: body.chatId,
                    role: 'user',
                    content: nonSystemMessages[nonSystemMessages.length - 1].content
                }
            });
        }

        let fullCompletion = '';

        // Create stream and process messages
        const stream = OpenAIStream(response, {
            onToken: async (token: string) => {
                fullCompletion += token;
                // Send token to client
                res.write(`data: ${token}\n\n`);
            },
            onCompletion: async () => {
                // Store the assistant's response
                await prisma.chat.create({
                    data: {
                        chatId: body.chatId,
                        role: 'assistant',
                        content: fullCompletion
                    }
                });

                console.log(`[${context.requestId}] Assistant response:`);
                console.dir({
                    role: 'assistant',
                    content: fullCompletion,
                    length: fullCompletion.length
                }, { depth: null, colors: true });

                // End the response
                res.end();
            },
        });

        // Handle any stream errors
        await stream.pipeTo(new WritableStream()).catch((error) => {
            console.error(`[${context.requestId}] Stream error:`, error);
            if (error instanceof OpenAIError) {
                throw error;
            }
            throw new Error('Failed to process chat request');
        });
    } catch (error) {
        console.error(`[${context.requestId}] Error processing chat request:`, error);
        if (error instanceof OpenAIError) {
            throw error;
        }
        throw new Error('Failed to process chat request');
    }
});
