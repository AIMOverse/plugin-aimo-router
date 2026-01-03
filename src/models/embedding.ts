import type { IAgentRuntime, TextEmbeddingParams } from '@elizaos/core';
import { logger, ModelType, VECTOR_DIMS } from '@elizaos/core';
import { getSetting } from '../utils/config';

/**
 * TEXT_EMBEDDING model handler for AiMo Network
 * 
 * TODO: Implement when AiMo Network supports embeddings API
 * 
 * Implementation notes:
 * - Check if AiMo Network provides embeddings endpoint similar to OpenAI
 * - Consider using AI SDK's embed() function if available
 * - May need to implement custom fetch logic if SDK doesn't support embeddings
 * - Should follow same pattern as OpenRouter's embedding handler
 * 
 * For reference, see: src/models/embedding.ts in @elizaos/plugin-openrouter
 */
export async function handleTextEmbedding(
  runtime: IAgentRuntime,
  params: TextEmbeddingParams | string | null
): Promise<number[]> {
  const embeddingDimension = Number.parseInt(
    getSetting(runtime, 'AIMO_EMBEDDING_DIMENSIONS') ??
      getSetting(runtime, 'EMBEDDING_DIMENSIONS') ??
      '1536',
    10
  ) as (typeof VECTOR_DIMS)[keyof typeof VECTOR_DIMS];

  if (!Object.values(VECTOR_DIMS).includes(embeddingDimension)) {
    const errorMsg = `Invalid embedding dimension: ${embeddingDimension}. Must be one of: ${Object.values(VECTOR_DIMS).join(', ')}`;
    logger.error(errorMsg);
    throw new Error(errorMsg);
  }

  if (params === null) {
    logger.debug('Creating test embedding for initialization');
    const testVector = Array(embeddingDimension).fill(0);
    testVector[0] = 0.1;
    return testVector;
  }

  logger.warn('TEXT_EMBEDDING is not yet supported by AiMo Network. Returning placeholder embedding.');

  let text: string;
  if (typeof params === 'string') {
    text = params;
  } else if (typeof params === 'object' && params.text) {
    text = params.text;
  } else {
    const errorMsg = 'Invalid input format for embedding';
    logger.warn(errorMsg);
    const fallbackVector = Array(embeddingDimension).fill(0);
    fallbackVector[0] = 0.2;
    return fallbackVector;
  }

  if (!text.trim()) {
    const errorMsg = 'Empty text for embedding';
    logger.warn(errorMsg);
    const fallbackVector = Array(embeddingDimension).fill(0);
    fallbackVector[0] = 0.3;
    return fallbackVector;
  }

  // Return placeholder embedding until AiMo Network supports embeddings
  const placeholderVector = Array(embeddingDimension).fill(0);
  placeholderVector[0] = 0.4;

  logger.log(`Generated placeholder embedding for text (length: ${text.length})`);
  return placeholderVector;
}
