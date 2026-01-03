# Plugin AiMo Router

AiMo Network plugin for ElizaOS - decentralized AI inference marketplace using SVM/EVM wallet signing.

## Overview

This plugin provides ElizaOS agents with access to AiMo Network's decentralized AI inference marketplace. Unlike traditional API-based providers, AiMo Network uses blockchain wallet authentication (Solana SVM or Ethereum EVM) for payments and identity.

### Features

- ✅ **Text Generation** (small and large models)
- ✅ **Object Generation** (structured data)
- ✅ **Dual Wallet Support** (Solana SVM and Ethereum EVM)
- ✅ **Wallet-Based Authentication** (no API keys required)
- ✅ **Automatic Payment Handling** (via x402 protocol)
- 🚧 **Embeddings** (planned for future release)
- 🚧 **Image Generation/Description** (planned for future release)

### Browser Support

⚠️ **Currently Node.js Only**

This plugin does not support browser execution. Browser support is planned for future releases using:
- WalletConnect integration
- Proxy-based solutions

For web-based agents, use a server-side API endpoint that proxies requests to this plugin.

## Installation

```bash
bun install plugin-aimo-router
```

## Configuration

### Environment Variables

Set the following environment variables to configure the plugin:

| Variable | Required | Description | Default |
|----------|-----------|-------------|---------|
| `AIMO_WALLET_TYPE` | ✅ Yes | Wallet type: `svm` (Solana) or `evm` (Ethereum) | - |
| `AIMO_PRIVATE_KEY` | ✅ Yes | Wallet private key (base58 for SVM, hex with 0x for EVM) | - |
| `AIMO_CHAIN_ID` | ❌ No | Blockchain network ID | Mainnet |
| `AIMO_BASE_URL` | ❌ No | AiMo Network API URL | `https://beta.aimo.network` |
| `AIMO_SMALL_MODEL` | ❌ No | Small model for text/object generation | `openai/gpt-4o-mini` |
| `AIMO_LARGE_MODEL` | ❌ No | Large model for text/object generation | `openai/gpt-4o` |
| `SMALL_MODEL` | ❌ No | Fallback for small model name | `openai/gpt-4o-mini` |
| `LARGE_MODEL` | ❌ No | Fallback for large model name | `openai/gpt-4o` |

### Private Key Formats

**Solana (SVM):**
- Format: base58 encoded string
- Length: 58 characters (64 bytes when decoded)
- Example: `5K9x...jZ3n`

**Ethereum (EVM):**
- Format: hex string with `0x` prefix
- Length: 66 characters (32 bytes)
- Example: `0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef`

### Chain IDs

**Solana:**
- Mainnet: `solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp`
- Devnet: `solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1`
- Testnet: `solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z`

**Ethereum:**
- Mainnet: `eip155:1`
- Sepolia: `eip155:11155111`

## Usage

### 1. Configure Environment

Create a `.env` file:

```bash
# For Solana wallet
AIMO_WALLET_TYPE=svm
AIMO_PRIVATE_KEY=5yourBase58EncodedPrivateKey...
AIMO_CHAIN_ID=solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp

# OR for Ethereum wallet
AIMO_WALLET_TYPE=evm
AIMO_PRIVATE_KEY=0x1234567890abcdef...
AIMO_CHAIN_ID=eip155:1
```

### 2. Register Plugin

In your ElizaOS configuration:

```typescript
import { aimoRouterPlugin } from "plugin-aimo-router";

const config = {
  plugins: [aimoRouterPlugin],
  // ... other config
};
```

### 3. Use Models

The plugin automatically registers model handlers:

```typescript
// Text generation (small model)
const smallText = await runtime.useModel(ModelType.TEXT_SMALL, {
  prompt: "What is AiMo Network?"
});

// Text generation (large model)
const largeText = await runtime.useModel(ModelType.TEXT_LARGE, {
  prompt: "Explain decentralized AI in detail"
});

// Streaming text
const result = await runtime.useModel(ModelType.TEXT_SMALL, {
  prompt: "Count from 1 to 5",
  stream: true,
  onStreamChunk: (chunk) => console.log(chunk)
});

// Object generation
const data = await runtime.useModel(ModelType.OBJECT_SMALL, {
  prompt: "Create a user object",
  schema: {
    type: "object",
    properties: {
      name: { type: "string" },
      age: { type: "number" }
    }
  }
});
```

## Security Notes

⚠️ **Important Security Considerations:**

1. **Private Keys**: The plugin uses private keys for wallet signing. Never commit these to version control or share them.

2. **Environment Variables**: Store private keys in environment variables or secure secrets management (e.g., AWS Secrets Manager, HashiCorp Vault).

3. **Payment**: AiMo Network automatically handles payments via x402 protocol. Ensure your wallet has sufficient balance.

4. **Future Improvement**: This implementation uses environment variables for simplicity. Future versions should support:
   - Hardware wallet integration
   - Key management services (KMS)
   - Multi-signature wallets

## Architecture

### Components

- **Signer Factory** (`src/utils/signer.ts`): Creates SVM/EVM signers with validation
- **Provider** (`src/providers/aimo-router.ts`): AiMo Network integration with browser check
- **Model Handlers** (`src/models/`): Text and object generation
- **Config Utils** (`src/utils/config.ts`): Configuration management and validation
- **Initialization** (`src/init.ts`): Configuration validation on startup

### How It Works

1. **Initialization**: Plugin validates wallet configuration on startup
2. **Signer Creation**: Creates appropriate signer (SVM or EVM) from private key
3. **Provider Setup**: Uses `@aimo.network/provider` for API integration
4. **Request Processing**: Each request is signed by the wallet automatically
5. **Payment Handling**: x402 protocol handles micropayments automatically

## Testing

```bash
# Build the plugin
bun run build

# Run tests
bun test
```

## Troubleshooting

### Invalid Private Key Format

```
Error: Invalid private key format for svm wallet. Expected: base58 encoded (64 bytes when decoded)
```

**Solution**: Ensure private key format matches wallet type:
- SVM: base58 encoded (58 chars)
- EVM: hex with 0x prefix (66 chars)

### Insufficient Balance

```
Error: Payment required - insufficient balance
```

**Solution**: Ensure your wallet has sufficient USDC or compatible tokens on AiMo Network.

### Browser Error

```
Error: AiMo plugin does not support browser execution
```

**Solution**: This is expected. Use Node.js environment or wait for browser support release.

## Development

### Building

```bash
bun run build
```

### Development Mode

```bash
bun run dev
```

### Formatting

```bash
bun run format
```

## Contributing

Contributions are welcome! Areas for improvement:

1. **Browser Support**: Implement WalletConnect or proxy-based solutions
2. **Embeddings**: Add when AiMo Network supports embeddings API
3. **Image Generation**: Add when AiMo Network supports image models
4. **Security**: Implement hardware wallet integration
5. **Caching**: Add response caching for better performance

## License

See LICENSE file for details.

## Links

- [AiMo Network](https://aimo.network)
- [AiMo SDK Docs](https://docs.aimo.network)
- [ElizaOS](https://elizaos.ai)
