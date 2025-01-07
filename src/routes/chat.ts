import express from 'express';
import { POST as chatHandler } from '../service/chat';

export const chatRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: Chat completion endpoints
 */

/**
 * @swagger
 * /api/chat:
 *   post:
 *     summary: Create a chat completion
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - chatId
 *               - messages
 *             properties:
 *               chatId:
 *                 type: string
 *                 format: uuid
 *                 description: A unique identifier for the chat session
 *               messages:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - role
 *                     - content
 *                   properties:
 *                     role:
 *                       type: string
 *                       enum: [system, user, assistant]
 *                       description: The role of the message sender
 *                     content:
 *                       type: string
 *                       description: The content of the message
 *     responses:
 *       200:
 *         description: Chat completion response
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 *               description: A stream of tokens from the chat completion
 *       400:
 *         description: Bad request (invalid chatId or message format)
 *       500:
 *         description: Server error
 */
chatRouter.post('/', chatHandler);
