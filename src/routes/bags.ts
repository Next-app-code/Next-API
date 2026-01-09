import { Router } from 'express';
import fetch from 'node-fetch';

const router = Router();

const BAGS_API_BASE = 'https://public-api-v2.bags.fm/api/v1';

/**
 * Bags API headers helper
 */
function getBagsHeaders(apiKey?: string) {
  const headers: any = {
    'Content-Type': 'application/json',
  };
  
  if (apiKey) {
    headers['x-api-key'] = apiKey;
  }
  
  return headers;
}

/**
 * Check token bonding curve status
 */
router.post('/bonding-curve/status', async (req, res) => {
  const { tokenAddress, apiKey } = req.body;
  
  if (!tokenAddress) {
    return res.status(400).json({ error: 'Token address is required' });
  }
  
  try {
    // Get token info from Bags API
    const response = await fetch(`${BAGS_API_BASE}/tokens/${tokenAddress}`, {
      headers: getBagsHeaders(apiKey),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch token info from Bags');
    }
    
    const tokenData = await response.json();
    
    // Check bonding curve status
    const bondingCurveStatus = {
      tokenAddress,
      isMigrated: tokenData.migrated || false,
      marketCap: tokenData.marketCap || 0,
      bondingCurveProgress: tokenData.bondingCurveProgress || 0,
      liquidityPool: tokenData.liquidityPool || null,
      canMigrate: tokenData.bondingCurveProgress >= 100,
      holders: tokenData.holders || 0,
      volume24h: tokenData.volume24h || 0,
    };
    
    res.json(bondingCurveStatus);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to check bonding curve status',
    });
  }
});

/**
 * Get token launch info
 */
router.post('/token/info', async (req, res) => {
  const { tokenAddress, apiKey } = req.body;
  
  if (!tokenAddress) {
    return res.status(400).json({ error: 'Token address is required' });
  }
  
  try {
    const response = await fetch(`${BAGS_API_BASE}/tokens/${tokenAddress}`, {
      headers: getBagsHeaders(apiKey),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch token from Bags');
    }
    
    const data = await response.json();
    
    res.json({
      address: tokenAddress,
      name: data.name,
      symbol: data.symbol,
      description: data.description,
      image: data.image,
      creator: data.creator,
      marketCap: data.marketCap,
      price: data.price,
      volume24h: data.volume24h,
      bondingCurveProgress: data.bondingCurveProgress,
      migrated: data.migrated,
      createdAt: data.createdAt,
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to get token info',
    });
  }
});

/**
 * Check if token is ready for migration
 */
router.post('/migration/check', async (req, res) => {
  const { tokenAddress, apiKey } = req.body;
  
  if (!tokenAddress) {
    return res.status(400).json({ error: 'Token address is required' });
  }
  
  try {
    const response = await fetch(`${BAGS_API_BASE}/tokens/${tokenAddress}`, {
      headers: getBagsHeaders(apiKey),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch token from Bags');
    }
    
    const data = await response.json();
    
    const migrationStatus = {
      tokenAddress,
      ready: data.bondingCurveProgress >= 100 && !data.migrated,
      alreadyMigrated: data.migrated || false,
      progress: data.bondingCurveProgress || 0,
      remainingProgress: Math.max(0, 100 - (data.bondingCurveProgress || 0)),
      marketCap: data.marketCap,
      estimatedLiquidityPool: data.estimatedLiquidityPool || null,
      message: data.migrated 
        ? 'Token already migrated to liquidity pool'
        : data.bondingCurveProgress >= 100
          ? 'Token is ready for migration!'
          : `${(100 - data.bondingCurveProgress).toFixed(2)}% remaining to complete bonding curve`,
    };
    
    res.json(migrationStatus);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to check migration status',
    });
  }
});

/**
 * Get trending tokens from Bags
 */
router.post('/trending', async (req, res) => {
  const { limit = 10, apiKey } = req.body;
  
  try {
    const response = await fetch(
      `${BAGS_API_BASE}/tokens/trending?limit=${limit}`,
      { headers: getBagsHeaders(apiKey) }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch trending tokens');
    }
    
    const data = await response.json();
    
    res.json({
      tokens: data.tokens || [],
      total: data.total || 0,
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to get trending tokens',
    });
  }
});

/**
 * Calculate payment amount with bonding curve
 */
router.post('/calculate-price', async (req, res) => {
  const { tokenAddress, amount, apiKey } = req.body;
  
  if (!tokenAddress || !amount) {
    return res.status(400).json({ error: 'Token address and amount are required' });
  }
  
  try {
    const response = await fetch(
      `${BAGS_API_BASE}/tokens/${tokenAddress}/quote?amount=${amount}`,
      { headers: getBagsHeaders(apiKey) }
    );
    
    if (!response.ok) {
      throw new Error('Failed to get price quote');
    }
    
    const data = await response.json();
    
    res.json({
      tokenAddress,
      inputAmount: amount,
      outputAmount: data.outputAmount,
      pricePerToken: data.pricePerToken,
      priceImpact: data.priceImpact,
      fees: data.fees,
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to calculate price',
    });
  }
});

export { router as bagsRouter };

