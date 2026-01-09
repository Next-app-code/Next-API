export const config = {
  // Server
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  
  // Solana
  defaultRpcUrl: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
  
  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
  },
  
  // Request limits
  maxRequestSize: '10mb',
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
  
  // Validation
  maxWorkflowNodes: 100,
  maxWorkflowEdges: 200,
  maxWorkflowNameLength: 100,
  maxDescriptionLength: 500,
  
  // Cache
  cacheEnabled: process.env.CACHE_ENABLED === 'true',
  cacheTtl: parseInt(process.env.CACHE_TTL || '300', 10), // 5 minutes
};

export function validateConfig(): void {
  if (config.port < 1 || config.port > 65535) {
    throw new Error('Invalid port number');
  }
  
  if (!['development', 'production', 'test'].includes(config.nodeEnv)) {
    throw new Error('Invalid NODE_ENV');
  }
}

export default config;






