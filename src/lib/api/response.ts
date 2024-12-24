import { OpenAIError } from '../errors/openai-errors';

export function createStreamResponse(stream: ReadableStream) {
    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}

export function createStreamErrorEvent(error: OpenAIError) {
    return JSON.stringify({
        error: {
            message: error.message,
            type: error.name,
            statusCode: error.statusCode,
        },
    });
}
