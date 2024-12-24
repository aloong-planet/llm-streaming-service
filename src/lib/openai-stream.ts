import {OpenAIError} from './errors/openai-errors';
import {createStreamErrorEvent} from './api/response';
import {Stream} from 'openai/streaming';
import {ChatCompletionChunk} from 'openai/resources/chat/completions';

export type OpenAIStreamType = Stream<ChatCompletionChunk>;

export type StreamControllers = {
    onStart?: () => Promise<void>;
    onToken?: (token: string) => Promise<void>;
    onCompletion?: (completion: string) => Promise<void>;
};

export function OpenAIStream(
    response: OpenAIStreamType,
    controllers: StreamControllers = {},
    onError?: (error: Error) => void
) {
    const encoder = new TextEncoder();
    let fullCompletion = '';

    return new ReadableStream({
        async start(controller) {
            try {
                // Call onStart if provided
                if (controllers.onStart) {
                    await controllers.onStart();
                }

                for await (const chunk of response) {
                    const content = chunk.choices[0]?.delta?.content || '';
                    if (content) {
                        controller.enqueue(encoder.encode(content));
                        fullCompletion += content;

                        // Call onToken if provided
                        if (controllers.onToken) {
                            await controllers.onToken(content);
                        }
                    }
                }

                // Call onCompletion if provided
                if (controllers.onCompletion) {
                    await controllers.onCompletion(fullCompletion);
                }

                controller.close();
            } catch (error) {
                // Ensure we have a proper Error object
                let errorMessage = 'Unknown error occurred';
                if (error instanceof Error) {
                    errorMessage = error.message;
                } else if (typeof error === 'object' && error !== null) {
                    errorMessage = String(error);
                } else if (typeof error === 'string') {
                    errorMessage = error;
                }

                const err = new Error(errorMessage);

                // Call error handler if provided
                if (onError) {
                    onError(err);
                }

                // Send error event to client
                const openAIError = new OpenAIError(err.message);
                controller.enqueue(encoder.encode(createStreamErrorEvent(openAIError)));
                controller.close();
            }
        },

        cancel() {
            // Optional: Handle stream cancellation
        }
    });
}
