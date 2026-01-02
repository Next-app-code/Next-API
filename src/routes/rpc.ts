import { Router } from 'express';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

const router = Router();

// Test RPC connection
router.post('/test', async (req, res) => {
  const { endpoint } = req.body;
  
  if (!endpoint) {
    return res.status(400).json({ error: 'RPC endpoint is required' });
  }
  
  try {
    const connection = new Connection(endpoint, 'confirmed');
    const slot = await connection.getSlot();
    const version = await connection.getVersion();
    
    res.json({
      connected: true,
      slot,
      version,
      endpoint,
    });
  } catch (error) {
    res.status(400).json({
      connected: false,
      error: error instanceof Error ? error.message : 'Failed to connect to RPC',
      endpoint,
    });
  }
});

// Get balance
router.post('/balance', async (req, res) => {
  const { endpoint, publicKey } = req.body;
  
  if (!endpoint || !publicKey) {
    return res.status(400).json({ error: 'Endpoint and publicKey are required' });
  }
  
  try {
    const connection = new Connection(endpoint, 'confirmed');
    const pubkey = new PublicKey(publicKey);
    const lamports = await connection.getBalance(pubkey);
    
    res.json({
      publicKey,
      lamports,
      sol: lamports / LAMPORTS_PER_SOL,
    });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to get balance',
    });
  }
});

// Get account info
router.post('/account', async (req, res) => {
  const { endpoint, publicKey } = req.body;
  
  if (!endpoint || !publicKey) {
    return res.status(400).json({ error: 'Endpoint and publicKey are required' });
  }
  
  try {
    const connection = new Connection(endpoint, 'confirmed');
    const pubkey = new PublicKey(publicKey);
    const accountInfo = await connection.getAccountInfo(pubkey);
    
    if (!accountInfo) {
      return res.json({
        exists: false,
        publicKey,
      });
    }
    
    res.json({
      exists: true,
      publicKey,
      lamports: accountInfo.lamports,
      owner: accountInfo.owner.toBase58(),
      executable: accountInfo.executable,
      rentEpoch: accountInfo.rentEpoch,
      dataLength: accountInfo.data.length,
    });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to get account info',
    });
  }
});

// Get recent blockhash
router.post('/blockhash', async (req, res) => {
  const { endpoint } = req.body;
  
  if (!endpoint) {
    return res.status(400).json({ error: 'Endpoint is required' });
  }
  
  try {
    const connection = new Connection(endpoint, 'confirmed');
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    
    res.json({
      blockhash,
      lastValidBlockHeight,
    });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to get blockhash',
    });
  }
});

// Get slot
router.post('/slot', async (req, res) => {
  const { endpoint } = req.body;
  
  if (!endpoint) {
    return res.status(400).json({ error: 'Endpoint is required' });
  }
  
  try {
    const connection = new Connection(endpoint, 'confirmed');
    const slot = await connection.getSlot();
    const blockHeight = await connection.getBlockHeight();
    
    res.json({
      slot,
      blockHeight,
    });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to get slot',
    });
  }
});

export { router as rpcRouter };

