import { aimoNetwork } from "@aimo.network/provider";
import { logger, type IAgentRuntime } from "@elizaos/core";
import { getSignerConfig, getBaseURL } from "../utils/config";
import { createSignerFromConfig } from "../utils/signer";
import type { LanguageModelV3 } from "@ai-sdk/provider";

/**
 * Create an AimoRouter provider instance with proper configuration
 *
 * @param runtime The runtime context
 * @returns Configured AimoRouter provider instance
 * @throws Error if running in browser (not supported yet)
 * @throws Error if wallet configuration is invalid
 */
export async function createAimoRouterProvider(runtime: IAgentRuntime): Promise<{
  chat: (modelId: string) => LanguageModelV3;
}> {
  const isBrowser =
    typeof globalThis !== "undefined" && (globalThis as any).document;
  
  // Browser support not implemented yet
  // Future implementations could use:
  // - WalletConnect for browser-based wallet signing
  // - Proxy server that holds wallet credentials
  // - SIWx (Sign-In-With-X) integration with wallet apps
  if (isBrowser) {
    throw new Error(
      "AiMo plugin does not support browser execution. Please use Node.js environment. " +
      "Browser support is planned for future releases using WalletConnect or proxy-based solutions."
    );
  }
  
  const signerConfig = getSignerConfig(runtime);
  const baseURL = getBaseURL(runtime);
  
  if (!signerConfig) {
    throw new Error(
      "AiMo wallet configuration is incomplete. Please set AIMO_WALLET_TYPE and AIMO_PRIVATE_KEY environment variables."
    );
  }
  
  // Create signer from configuration (SVM or EVM)
  const signer = await createSignerFromConfig(signerConfig);
  
  logger.info(`Creating AiMo Network provider with ${signerConfig.walletType.toUpperCase()} wallet`);
  
  return aimoNetwork({
    signer,
    baseURL,
  });
}
