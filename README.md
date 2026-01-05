<div align="center">

![NEXT](./navbeo.png)

[![Twitter](https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=x&logoColor=white)](https://x.com/NextWorkspace)
[![Website](https://img.shields.io/badge/Website-000000?style=for-the-badge&logo=About.me&logoColor=white)](https://app.nextlabs.work/)
[![GitHub stars](https://img.shields.io/github/stars/Next-app-code/Next-Web?style=for-the-badge&logo=github)](https://github.com/Next-app-code/Next-Web/stargazers)

Backend API service for Next workflow management.

**CA**: `HZ2vrUNo4xVfF85oVyodRLFG1WCnZCRGe3qBcAUZpump`  
[View on Pump.fun](https://pump.fun/coin/HZ2vrUNo4xVfF85oVyodRLFG1WCnZCRGe3qBcAUZpump)

</div>

## Overview

Next API provides REST endpoints for managing Solana visual workflows. It handles workflow storage, validation, and provides proxy endpoints for Solana RPC calls.

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

```bash
npm install
```

### Configuration

Create a `.env` file based on `.env.example`:

```
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

### Development

```bash
npm run dev
```

The server will start on `http://localhost:3001`.

### Production Build

```bash
npm run build
npm start
```

## API Endpoints

### Health

- `GET /api/health` - Server health check
- `GET /api/health/ready` - Readiness check

### Workflows

- `GET /api/workflows` - List all workflows
- `GET /api/workflows/:id` - Get workflow by ID
- `POST /api/workflows` - Create new workflow
- `PUT /api/workflows/:id` - Update workflow
- `DELETE /api/workflows/:id` - Delete workflow
- `POST /api/workflows/validate` - Validate workflow structure

### RPC Operations (11 endpoints)

- `POST /api/rpc/test` - Test RPC connection
- `POST /api/rpc/balance` - Get account balance (SOL)
- `POST /api/rpc/account` - Get account information
- `POST /api/rpc/blockhash` - Get recent blockhash
- `POST /api/rpc/slot` - Get current slot and block height
- `POST /api/rpc/epoch` - Get epoch information
- `POST /api/rpc/performance` - Get performance samples
- `POST /api/rpc/block` - Get block by slot
- `POST /api/rpc/validators` - Get validator information
- `POST /api/rpc/cluster-nodes` - Get cluster nodes
- `POST /api/rpc/supply` - Get SOL supply information

### Token Operations (3 endpoints)

- `POST /api/tokens/balance` - Get SPL token balance(s)
- `POST /api/tokens/supply` - Get token supply
- `POST /api/tokens/accounts` - Get token accounts by owner

### Transaction Operations (4 endpoints)

- `POST /api/transactions/get` - Get transaction details
- `POST /api/transactions/status` - Get transaction status
- `POST /api/transactions/recent` - Get recent transactions for address
- `POST /api/transactions/simulate` - Simulate transaction execution

### NFT Operations (2 endpoints)

- `POST /api/nfts/by-owner` - Get all NFTs owned by address
- `POST /api/nfts/metadata` - Get NFT metadata by mint

### Program Operations (2 endpoints)

- `POST /api/programs/accounts` - Get all accounts for a program
- `POST /api/programs/account-size` - Get account data size

## Authentication

The API supports optional wallet-based authentication via the `X-Wallet-Address` header. When provided, workflows are associated with the wallet address and access is restricted accordingly.

## Request Examples

### Create Workflow

```bash
curl -X POST http://localhost:3001/api/workflows \
  -H "Content-Type: application/json" \
  -H "X-Wallet-Address: YOUR_WALLET_ADDRESS" \
  -d '{
    "name": "My Workflow",
    "nodes": [],
    "edges": [],
    "rpcEndpoint": "https://api.mainnet-beta.solana.com"
  }'
```

### Test RPC Connection

```bash
curl -X POST http://localhost:3001/api/rpc/test \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint": "https://api.mainnet-beta.solana.com"
  }'
```

### Get Balance

```bash
curl -X POST http://localhost:3001/api/rpc/balance \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint": "https://api.mainnet-beta.solana.com",
    "publicKey": "YOUR_PUBLIC_KEY"
  }'
```

## Error Handling

All errors are returned in a consistent format:

```json
{
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

Validation errors include additional details:

```json
{
  "error": "Validation failed",
  "details": [
    {
      "path": "field.path",
      "message": "Validation message"
    }
  ]
}
```

## Project Structure

```
src/
  index.ts           - Application entry point
  routes/
    health.ts        - Health check endpoints
    workflow.ts      - Workflow CRUD endpoints
    rpc.ts           - RPC proxy endpoints
  middleware/
    errorHandler.ts  - Global error handler
    validateRequest.ts - Request validation
```

## License

MIT

