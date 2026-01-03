import { IAgentRuntime, logger } from "@elizaos/core";
import type { WalletType, SignerConfig } from "./signer";
import { createSignerFromConfig, validateWalletConfig } from "./signer";

/* Retrieves a configuration setting from the runtime, falling back to environment variables or a default value if not found.
 *
 * @param key - The name of the setting to retrieve.
 * @param defaultValue - The value to return if the setting is not found in the runtime or environment.
 * @returns The resolved setting value, or {@link defaultValue} if not found.
 */
export function getSetting(
  runtime: IAgentRuntime,
  key: string,
  defaultValue?: string,
): string | undefined {
  const value = runtime.getSetting(key);
  // Convert to string if value is a number or boolean
  if (value !== undefined && value !== null) {
    return String(value);
  }
  return process.env[key] ?? defaultValue;
}

/* Retrieves the AiMo Network API base URL from runtime settings, environment variables, or defaults.
 *
 * @returns The resolved base URL for AiMo Network API requests.
 */
export function getBaseURL(runtime: IAgentRuntime): string {
  return (
    getSetting(
      runtime,
      "AIMO_BASE_URL",
      "https://beta.aimo.network",
    ) || "https://beta.aimo.network"
  );
}

/**
 * Helper function to get the wallet type (svm or evm)
 *
 * @param runtime The runtime context
 * @returns The configured wallet type
 */
export function getWalletType(runtime: IAgentRuntime): WalletType | undefined {
  const walletType = getSetting(runtime, "AIMO_WALLET_TYPE");
  if (!walletType || (walletType !== "svm" && walletType !== "evm")) {
    return undefined;
  }
  return walletType as WalletType;
}

/**
 * Helper function to get the private key for wallet signer
 *
 * @param runtime The runtime context
 * @returns The configured private key
 */
export function getPrivateKey(runtime: IAgentRuntime): string | undefined {
  return getSetting(runtime, "AIMO_PRIVATE_KEY");
}

/**
 * Helper function to get the chain ID for wallet signer
 *
 * @param runtime The runtime context
 * @returns The configured chain ID
 */
export function getChainId(runtime: IAgentRuntime): string | undefined {
  return getSetting(runtime, "AIMO_CHAIN_ID") || undefined;
}

/**
 * Helper function to get the small model name with fallbacks
 *
 * @param runtime The runtime context
 * @returns The configured small model name
 */
export function getSmallModel(runtime: IAgentRuntime): string {
  return (
    getSetting(runtime, "AIMO_SMALL_MODEL") ??
    getSetting(runtime, "SMALL_MODEL", "openai/gpt-4o-mini") ??
    "openai/gpt-4o-mini"
  );
}

/**
 * Helper function to get the large model name with fallbacks
 *
 * @param runtime The runtime context
 * @returns The configured large model name
 */
export function getLargeModel(runtime: IAgentRuntime): string {
  return (
    getSetting(runtime, "AIMO_LARGE_MODEL") ??
    getSetting(runtime, "LARGE_MODEL", "openai/gpt-4o") ??
    "openai/gpt-4o"
  );
}

/**
 * Validate the complete AiMo wallet configuration
 *
 * @param runtime The runtime context
 * @returns true if configuration is valid, false otherwise
 */
export function validateWalletConfiguration(runtime: IAgentRuntime): boolean {
  const walletType = getWalletType(runtime);
  const privateKey = getPrivateKey(runtime);
  
  if (!walletType) {
    logger.warn("AIMO_WALLET_TYPE is not set (should be 'svm' or 'evm')");
    return false;
  }
  
  if (!privateKey) {
    logger.warn("AIMO_PRIVATE_KEY is not set");
    return false;
  }
  
  if (!validateWalletConfig(walletType, privateKey)) {
    const expectedFormat = walletType === "svm"
      ? "base58 encoded (64 bytes when decoded)"
      : "hex string starting with 0x (64 hex characters)";
    logger.warn(
      `Invalid AIMO_PRIVATE_KEY format for ${walletType} wallet. Expected: ${expectedFormat}`
    );
    return false;
  }
  
  return true;
}

/**
 * Get signer configuration from runtime settings
 *
 * @param runtime The runtime context
 * @returns Signer configuration object or undefined if not fully configured
 */
export function getSignerConfig(runtime: IAgentRuntime): SignerConfig | undefined {
  const walletType = getWalletType(runtime);
  const privateKey = getPrivateKey(runtime);
  const chainId = getChainId(runtime);
  
  if (!walletType || !privateKey) {
    return undefined;
  }
  
  return {
    walletType,
    privateKey,
    chainId,
  };
}
