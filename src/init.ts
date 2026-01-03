import { logger, type IAgentRuntime } from "@elizaos/core";
import { validateWalletConfiguration } from "./utils/config";

/**
 * Initialize and validate AiMo plugin configuration
 * 
 * This function validates wallet configuration (SVM or EVM) and logs the results.
 * It runs asynchronously in the background to avoid blocking plugin initialization.
 * 
 * @param config - Plugin configuration object
 * @param runtime - The agent runtime context
 * @returns void (returns immediately, validation runs in background)
 */
export function initializeAimoRouter(_config: any, runtime: IAgentRuntime) {
  // Run validation in background to avoid blocking initialization
  (async () => {
    try {
      logger.info("Initializing AiMo Router plugin...");
      
      // Validate wallet configuration
      if (!validateWalletConfiguration(runtime)) {
        logger.warn(
          "AiMo wallet configuration is incomplete or invalid. " +
          "Please set AIMO_WALLET_TYPE ('svm' or 'evm') and AIMO_PRIVATE_KEY environment variables. " +
          "AiMo functionality will be limited until proper configuration is provided.",
        );
        return;
      }
      
      // Configuration is valid
      logger.log("AiMo Router plugin initialized successfully");
      
      // Future enhancement: Check session balance
      // const balance = await client.sessionBalance();
      // logger.log(`AiMo session balance: ${balance.balance_usd} USD`);
      
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(
        `AiMo plugin configuration error: ${message}. ` +
        `Please verify AIMO_WALLET_TYPE and AIMO_PRIVATE_KEY environment variables.`,
      );
    }
  })();
  
  return;
}
