import { Request, Response as ExpressResponse } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { ConfigurationError } from '../errors/api-errors';

export type APIContext = {
    requestId: string;
};

export type APIHandler = (
    req: Request,
    res: ExpressResponse,
    context: APIContext
) => Promise<void>;

export function createAPIHandler(handler: APIHandler) {
    return async (req: Request, res: ExpressResponse) => {
        const context: APIContext = {
            requestId: uuidv4(),
        };

        try {
            await handler(req, res, context);
        } catch (error) {
            console.error(`[${context.requestId}] Request error:`, error);
            
            // Handle Zod validation errors
            if (error instanceof z.ZodError) {
                res.status(400).json({
                    error: 'Validation Error',
                    details: error.errors,
                });
                return;
            }

            // Handle Configuration errors
            if (error instanceof ConfigurationError) {
                res.status(500).json({
                    error: error.message,
                });
                return;
            }

            // Handle other errors
            res.status(500).json({
                error: 'Internal Server Error',
            });
        }
    };
}

export async function validateBody<T extends z.ZodType>(
    req: Request,
    schema: T
): Promise<z.infer<T>> {
    return await schema.parseAsync(req.body);
}
