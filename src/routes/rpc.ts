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

// Get epoch info
router.post('/epoch', async (req, res) => {
  const { endpoint } = req.body;
  
  if (!endpoint) {
    return res.status(400).json({ error: 'Endpoint is required' });
  }
  
  try {
    const connection = new Connection(endpoint, 'confirmed');
    const epochInfo = await connection.getEpochInfo();
    
    res.json({
      epoch: epochInfo.epoch,
      slotIndex: epochInfo.slotIndex,
      slotsInEpoch: epochInfo.slotsInEpoch,
      absoluteSlot: epochInfo.absoluteSlot,
      blockHeight: epochInfo.blockHeight,
      transactionCount: epochInfo.transactionCount,
    });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to get epoch info',
    });
  }
});

// Get performance samples
router.post('/performance', async (req, res) => {
  const { endpoint, limit = 10 } = req.body;
  
  if (!endpoint) {
    return res.status(400).json({ error: 'Endpoint is required' });
  }
  
  try {
    const connection = new Connection(endpoint, 'confirmed');
    const samples = await connection.getRecentPerformanceSamples(limit);
    
    res.json({
      samples: samples.map(s => ({
        slot: s.slot,
        numTransactions: s.numTransactions,
        numSlots: s.numSlots,
        samplePeriodSecs: s.samplePeriodSecs,
      })),
      total: samples.length,
    });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to get performance samples',
    });
  }
});

// Get block
router.post('/block', async (req, res) => {
  const { endpoint, slot } = req.body;
  
  if (!endpoint || slot === undefined) {
    return res.status(400).json({ error: 'Endpoint and slot are required' });
  }
  
  try {
    const connection = new Connection(endpoint, 'confirmed');
    const block = await connection.getBlock(slot, {
      maxSupportedTransactionVersion: 0,
    });
    
    if (!block) {
      return res.status(404).json({ error: 'Block not found' });
    }
    
    res.json({
      slot,
      blockhash: block.blockhash,
      previousBlockhash: block.previousBlockhash,
      parentSlot: block.parentSlot,
      blockTime: block.blockTime,
      blockHeight: (block as any).blockHeight,
      transactions: block.transactions.length,
    });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to get block',
    });
  }
});

// Get validators
router.post('/validators', async (req, res) => {
  const { endpoint } = req.body;
  
  if (!endpoint) {
    return res.status(400).json({ error: 'Endpoint is required' });
  }
  
  try {
    const connection = new Connection(endpoint, 'confirmed');
    const voteAccounts = await connection.getVoteAccounts();
    
    res.json({
      current: voteAccounts.current.map(v => ({
        votePubkey: v.votePubkey,
        nodePubkey: v.nodePubkey,
        activatedStake: v.activatedStake,
        epochVoteAccount: v.epochVoteAccount,
        commission: v.commission,
      })),
      delinquent: voteAccounts.delinquent.length,
      total: voteAccounts.current.length + voteAccounts.delinquent.length,
    });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to get validators',
    });
  }
});

// Get cluster nodes
router.post('/cluster-nodes', async (req, res) => {
  const { endpoint } = req.body;
  
  if (!endpoint) {
    return res.status(400).json({ error: 'Endpoint is required' });
  }
  
  try {
    const connection = new Connection(endpoint, 'confirmed');
    const nodes = await connection.getClusterNodes();
    
    res.json({
      nodes: nodes.map(n => ({
        pubkey: n.pubkey,
        gossip: n.gossip,
        tpu: n.tpu,
        rpc: n.rpc,
        version: n.version,
      })),
      total: nodes.length,
    });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to get cluster nodes',
    });
  }
});

// Get supply info
router.post('/supply', async (req, res) => {
  const { endpoint } = req.body;
  
  if (!endpoint) {
    return res.status(400).json({ error: 'Endpoint is required' });
  }
  
  try {
    const connection = new Connection(endpoint, 'confirmed');
    const supply = await connection.getSupply();
    
    res.json({
      total: supply.value.total,
      circulating: supply.value.circulating,
      nonCirculating: supply.value.nonCirculating,
      nonCirculatingAccounts: supply.value.nonCirculatingAccounts.map(a => a.toBase58()),
    });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to get supply',
    });
  }
});

export { router as rpcRouter };



