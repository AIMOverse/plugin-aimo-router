import {
  ModelType,
  logger,
  type Plugin,
  type IAgentRuntime,
  type GenerateTextParams,
  type ObjectGenerationParams,
  type ImageDescriptionParams,
  type ImageGenerationParams,
  type TextEmbeddingParams,
} from '@elizaos/core';
import { initializeAimoRouter } from './init';
import { handleTextSmall, handleTextLarge } from './models/text';
import { handleObjectSmall, handleObjectLarge } from './models/object';
import { handleImageDescription, handleImageGeneration } from './models/image';
import { handleTextEmbedding } from './models/embedding';

/**
 * Defines the AiMo Router plugin with its name, description, and configuration options.
 * 
 * AiMo Router plugin provides access to AiMo Network's decentralized AI inference marketplace.
 * 
 * Supported models:
 * - TEXT_SMALL: Text generation with smaller models
 * - TEXT_LARGE: Text generation with larger models
 * - OBJECT_SMALL: Structured object generation with smaller models
 * - OBJECT_LARGE: Structured object generation with larger models
 * 
 * Not yet supported (planned for future releases):
 * - TEXT_EMBEDDING: Text embeddings (when AiMo Network supports them)
 * - IMAGE_DESCRIPTION: Image analysis (when AiMo Network supports vision models)
 * - IMAGE: Image generation (when AiMo Network supports image models)
 * 
 * @type {Plugin}
 */
export const aimoRouterPlugin: Plugin = {
  name: 'aimo-router',
  description: 'AiMo Network plugin - decentralized AI inference marketplace using SVM/EVM wallet signing',
  config: {
    AIMO_WALLET_TYPE: process.env.AIMO_WALLET_TYPE,
    AIMO_PRIVATE_KEY: process.env.AIMO_PRIVATE_KEY,
    AIMO_CHAIN_ID: process.env.AIMO_CHAIN_ID,
    AIMO_BASE_URL: process.env.AIMO_BASE_URL,
    AIMO_SMALL_MODEL: process.env.AIMO_SMALL_MODEL,
    AIMO_LARGE_MODEL: process.env.AIMO_LARGE_MODEL,
    SMALL_MODEL: process.env.SMALL_MODEL,
    LARGE_MODEL: process.env.LARGE_MODEL,
  },
  async init(config, runtime) {
    // Initialize AiMo Router configuration (validation runs in background)
    initializeAimoRouter(config, runtime);
  },
  models: {
    [ModelType.TEXT_SMALL]: async (
      runtime: IAgentRuntime,
      params: GenerateTextParams
    ) => {
      return handleTextSmall(runtime, params);
    },
    [ModelType.TEXT_LARGE]: async (
      runtime: IAgentRuntime,
      params: GenerateTextParams
    ) => {
      return handleTextLarge(runtime, params);
    },
    [ModelType.OBJECT_SMALL]: async (runtime: IAgentRuntime, params: ObjectGenerationParams) => {
      return handleObjectSmall(runtime, params);
    },
    [ModelType.OBJECT_LARGE]: async (runtime: IAgentRuntime, params: ObjectGenerationParams) => {
      return handleObjectLarge(runtime, params);
    },
    [ModelType.IMAGE_DESCRIPTION]: async (
      runtime: IAgentRuntime,
      params: ImageDescriptionParams | string
    ) => {
      return handleImageDescription(runtime, params);
    },
    [ModelType.IMAGE]: async (runtime: IAgentRuntime, params: ImageGenerationParams) => {
      return handleImageGeneration(runtime, params);
    },
    [ModelType.TEXT_EMBEDDING]: async (
      runtime: IAgentRuntime,
      params: TextEmbeddingParams | string | null
    ) => {
      return handleTextEmbedding(runtime, params);
    },
  },
  tests: [
    {
      name: 'aimo_router_plugin_tests',
      tests: [
        {
          name: 'aimo_test_text_small',
          fn: async (runtime: IAgentRuntime) => {
            try {
              const text = await runtime.useModel(ModelType.TEXT_SMALL, {
                prompt: 'What is AiMo Network?',
              });
              if (!text || text.length === 0) {
                throw new Error('Failed to generate text');
              }
              logger.log({ text }, 'generated with test_text_small');
            } catch (error: unknown) {
              const message = error instanceof Error ? error.message : String(error);
              logger.error(`Error in test_text_small: ${message}`);
              throw error;
            }
          },
        },
        {
          name: 'aimo_test_text_large',
          fn: async (runtime: IAgentRuntime) => {
            try {
              const text = await runtime.useModel(ModelType.TEXT_LARGE, {
                prompt: 'Explain decentralized AI inference in 3 sentences.',
              });
              if (!text || text.length === 0) {
                throw new Error('Failed to generate text');
              }
              logger.log({ text }, 'generated with test_text_large');
            } catch (error: unknown) {
              const message = error instanceof Error ? error.message : String(error);
              logger.error(`Error in test_text_large: ${message}`);
              throw error;
            }
          },
        },
        {
          name: 'aimo_test_streaming',
          fn: async (runtime: IAgentRuntime) => {
            try {
              const chunks: string[] = [];
              const result = await runtime.useModel(ModelType.TEXT_SMALL, {
                prompt: 'Count from 1 to 5.',
                onStreamChunk: (chunk: string) => {
                  chunks.push(chunk);
                },
              });
              if (!result || result.length === 0) {
                throw new Error('Streaming returned empty result');
              }
              if (chunks.length === 0) {
                throw new Error('No streaming chunks received');
              }
              logger.log({ chunks: chunks.length, result: result.substring(0, 50) }, 'Streaming test completed');
            } catch (error: unknown) {
              const message = error instanceof Error ? error.message : String(error);
              logger.error(`Error in aimo_test_streaming: ${message}`);
              throw error;
            }
          },
        },
        {
          name: 'aimo_test_object_small',
          fn: async (runtime: IAgentRuntime) => {
            try {
              const result = await runtime.useModel(ModelType.OBJECT_SMALL, {
                prompt: 'Create a JSON object with a message field saying hello',
                schema: { type: 'object' },
              });
              logger.log({ result }, 'Generated object with test_object_small');
              if (!result || (typeof result === 'object' && 'error' in result)) {
                throw new Error('Failed to generate object');
              }
            } catch (error: unknown) {
              const message = error instanceof Error ? error.message : String(error);
              logger.error(`Error in test_object_small: ${message}`);
              throw error;
            }
          },
        },
      ],
    },
  ],
};

export default aimoRouterPlugin;
