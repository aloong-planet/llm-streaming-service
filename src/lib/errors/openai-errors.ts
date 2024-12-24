export class OpenAIError extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number = 500) {
        super(message);
        this.name = 'OpenAIError';
        this.statusCode = statusCode;
    }
}
