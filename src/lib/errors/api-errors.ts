export class ConfigurationError extends Error {
    statusCode: number = 500;

    constructor(message: string) {
        super(message);
        this.name = 'ConfigurationError';
    }
}
