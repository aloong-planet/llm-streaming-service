import { parse } from '@iarna/toml';
import fs from 'fs';
import path from 'path';

interface ChatConfig {
    max_conversation_pairs: number;
}

interface OpenAIConfig {
    temperature: number;
    model: string;
}

interface LoggingConfig {
    level: string;
}

export interface Config {
    chat: ChatConfig;
    openai: OpenAIConfig;
    logging: LoggingConfig;
}

// Default configuration
const defaultConfig: Config = {
    chat: {
        max_conversation_pairs: 50
    },
    openai: {
        temperature: 0.7,
        model: 'gpt-4'
    },
    logging: {
        level: 'info'
    }
};

function mergeConfigs(base: Config, override: Partial<Config>): Config {
    return {
        chat: {
            ...base.chat,
            ...override.chat
        },
        openai: {
            ...base.openai,
            ...override.openai
        },
        logging: {
            ...base.logging,
            ...override.logging
        }
    };
}

function loadConfig(): Config {
    try {
        const configPath = process.env.CONFIG_PATH || path.join(process.cwd(), 'config', 'default.toml');
        const configFile = fs.readFileSync(configPath, 'utf-8');
        const parsedConfig = parse(configFile) as unknown as Partial<Config>;
        return mergeConfigs(defaultConfig, parsedConfig);
    } catch (error) {
        console.warn('Failed to load config file, using default configuration:', error);
        return defaultConfig;
    }
}

export const config = loadConfig();
