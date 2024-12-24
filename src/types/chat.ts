import { Chat } from '@prisma/client'

export type { Chat }

export type ChatCreateInput = {
    chatId: string
    content: string
    role: string
    metadata?: string
}
