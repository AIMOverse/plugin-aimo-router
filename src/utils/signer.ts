import { logger } from "@elizaos/core";
import { SvmClientSigner, SOLANA_MAINNET_CHAIN_ID, SOLANA_DEVNET_CHAIN_ID } from "@aimo.network/svm";
import { EvmClientSigner, EVM_MAINNET_CHAIN_ID } from "@aimo.network/evm";
import { createKeyPairSignerFromBytes } from "@solana/kit";
import { privateKeyToAccount } from "viem/accounts";
import bs58 from "bs58";

export type WalletType = "svm" | "evm";

export interface SignerConfig {
  walletType: WalletType;
  privateKey: string;
  chainId?: string;
}

/**
 * Validate SVM (Solana) private key format
 * SVM private keys should be base58 encoded and typically 64 characters (58 bytes decoded)
 *
 * @param privateKey - Private key to validate
 * @returns true if valid, false otherwise
 */
export function validateSvmPrivateKey(privateKey: string): boolean {
  try {
    const decoded = bs58.decode(privateKey);
    return decoded.length === 64;
  } catch {
    return false;
  }
}

/**
 * Validate EVM (Ethereum) private key format
 * EVM private keys should be hex string starting with 0x, 64 hex characters (32 bytes)
 *
 * @param privateKey - Private key to validate
 * @returns true if valid, false otherwise
 */
export function validateEvmPrivateKey(privateKey: string): boolean {
  return /^0x[0-9a-fA-F]{64}$/.test(privateKey);
}

/**
 * Validate that the wallet type matches the private key format
 *
 * @param walletType - Type of wallet (svm or evm)
 * @param privateKey - Private key to validate
 * @returns true if valid match, false otherwise
 */
export function validateWalletConfig(walletType: WalletType, privateKey: string): boolean {
  if (walletType === "svm") {
    return validateSvmPrivateKey(privateKey);
  } else if (walletType === "evm") {
    return validateEvmPrivateKey(privateKey);
  }
  return false;
}

/**
 * Get chain ID for wallet type from string
 *
 * @param walletType - Type of wallet
 * @param chainIdString - Chain ID string (e.g., "mainnet", "devnet", "sepolia", "11155111")
 * @returns Chain ID constant
 */
export function getChainIdForWallet(walletType: WalletType, chainIdString: string): `${string}:${string}` {
  const lowerChain = chainIdString.toLowerCase();
  
  if (walletType === "svm") {
    if (lowerChain.includes("devnet")) {
      return SOLANA_DEVNET_CHAIN_ID;
    }
    return SOLANA_MAINNET_CHAIN_ID;
  } else if (walletType === "evm") {
    if (lowerChain.includes("sepolia") || chainIdString === "11155111") {
      return "eip155:11155111" as `${string}:${string}`; // Sepolia testnet
    }
    return EVM_MAINNET_CHAIN_ID;
  }
  
  throw new Error(`Unknown wallet type: ${walletType}`);
}

/**
 * Create SVM signer from private key
 *
 * @param privateKey - Base58 encoded private key
 * @param chainId - Chain ID (defaults to mainnet)
 * @returns SvmClientSigner instance
 */
export async function createSvmSigner(
  privateKey: string,
  chainId: `${string}:${string}` = SOLANA_MAINNET_CHAIN_ID
): Promise<SvmClientSigner> {
  const privateKeyBytes = bs58.decode(privateKey);
  const keypairSigner = await createKeyPairSignerFromBytes(privateKeyBytes);
  
  return new SvmClientSigner({
    signer: keypairSigner,
    chainId,
  });
}

/**
 * Create EVM signer from private key
 *
 * @param privateKey - Hex encoded private key (with 0x prefix)
 * @param chainId - Chain ID (defaults to mainnet)
 * @returns EvmClientSigner instance
 */
export function createEvmSigner(
  privateKey: string,
  chainId: `${string}:${string}` = EVM_MAINNET_CHAIN_ID
): EvmClientSigner {
  const account = privateKeyToAccount(privateKey as `0x${string}`);
  
  return new EvmClientSigner({
    signer: account,
    chainId,
  });
}

/**
 * Create signer from configuration
 * Factory function that creates appropriate signer based on wallet type
 *
 * @param config - Signer configuration
 * @returns Signer instance (SvmClientSigner | EvmClientSigner)
 * @throws Error if configuration is invalid
 */
export async function createSignerFromConfig(config: SignerConfig): Promise<SvmClientSigner | EvmClientSigner> {
  if (!config.walletType) {
    throw new Error("Wallet type is required (svm or evm)");
  }
  
  if (!config.privateKey) {
    throw new Error("Private key is required");
  }
  
  if (!validateWalletConfig(config.walletType, config.privateKey)) {
    const expectedFormat = config.walletType === "svm" 
      ? "base58 encoded (64 bytes when decoded)" 
      : "hex string starting with 0x (64 hex characters)";
    throw new Error(
      `Invalid private key format for ${config.walletType} wallet. Expected: ${expectedFormat}`
    );
  }
  
  const chainId = config.chainId ? getChainIdForWallet(config.walletType, config.chainId) : undefined;
  
  logger.info(`Creating ${config.walletType.toUpperCase()} signer for chain: ${chainId || 'default'}`);
  
  if (config.walletType === "svm") {
    return createSvmSigner(config.privateKey, chainId);
  } else if (config.walletType === "evm") {
    return createEvmSigner(config.privateKey, chainId);
  }
  
  throw new Error(`Unknown wallet type: ${config.walletType}`);
}
