import OpenAI from 'openai';

if (!process.env.AZURE_OPENAI_API_KEY) {
    throw new Error('AZURE_OPENAI_API_KEY environment variable is missing');
}

export const openai = new OpenAI({
    apiKey: process.env.AZURE_OPENAI_API_KEY,
    baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT_NAME}`,
    defaultHeaders: {
        'api-key': process.env.AZURE_OPENAI_API_KEY,
    },
    defaultQuery: {
        'api-version': process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview'
    }
});
