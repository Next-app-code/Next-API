import { Router } from 'express';
import { Connection, PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';

const router = Router();

// Get transaction details
router.post('/get', async (req, res) => {
  const { endpoint, signature } = req.body;
  
  if (!endpoint || !signature) {
    return res.status(400).json({ error: 'Endpoint and signature are required' });
  }
  
  try {
    const connection = new Connection(endpoint, 'confirmed');
    const tx = await connection.getTransaction(signature, {
      maxSupportedTransactionVersion: 0,
    });
    
    if (!tx) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.json({
      signature,
      slot: tx.slot,
      blockTime: tx.blockTime,
      meta: {
        err: tx.meta?.err,
        fee: tx.meta?.fee,
        preBalances: tx.meta?.preBalances,
        postBalances: tx.meta?.postBalances,
        logMessages: tx.meta?.logMessages,
      },
      transaction: tx.transaction,
    });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to get transaction',
    });
  }
});

// Get transaction status
router.post('/status', async (req, res) => {
  const { endpoint, signature } = req.body;
  
  if (!endpoint || !signature) {
    return res.status(400).json({ error: 'Endpoint and signature are required' });
  }
  
  try {
    const connection = new Connection(endpoint, 'confirmed');
    const status = await connection.getSignatureStatus(signature);
    
    res.json({
      signature,
      confirmationStatus: status.value?.confirmationStatus,
      confirmations: status.value?.confirmations,
      err: status.value?.err,
      slot: status.value?.slot,
    });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to get transaction status',
    });
  }
});

// Get recent transactions for address
router.post('/recent', async (req, res) => {
  const { endpoint, address, limit = 10 } = req.body;
  
  if (!endpoint || !address) {
    return res.status(400).json({ error: 'Endpoint and address are required' });
  }
  
  try {
    const connection = new Connection(endpoint, 'confirmed');
    const pubkey = new PublicKey(address);
    
    const signatures = await connection.getSignaturesForAddress(pubkey, {
      limit: Math.min(limit, 100),
    });
    
    res.json({
      address,
      signatures: signatures.map(sig => ({
        signature: sig.signature,
        slot: sig.slot,
        blockTime: sig.blockTime,
        err: sig.err,
        memo: sig.memo,
      })),
      total: signatures.length,
    });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to get recent transactions',
    });
  }
});

// Simulate transaction
router.post('/simulate', async (req, res) => {
  const { endpoint, transaction } = req.body;
  
  if (!endpoint || !transaction) {
    return res.status(400).json({ error: 'Endpoint and transaction are required' });
  }
  
  try {
    const connection = new Connection(endpoint, 'confirmed');
    
    // Deserialize transaction from base64
    const txBuffer = Buffer.from(transaction, 'base64');
    let tx: Transaction | VersionedTransaction;
    
    try {
      tx = Transaction.from(txBuffer);
    } catch {
      tx = VersionedTransaction.deserialize(txBuffer);
    }
    
    const simulation = await connection.simulateTransaction(tx as any);
    
    res.json({
      value: {
        err: simulation.value.err,
        logs: simulation.value.logs,
        unitsConsumed: simulation.value.unitsConsumed,
        accounts: simulation.value.accounts,
      },
    });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to simulate transaction',
    });
  }
});

export { router as transactionRouter };

