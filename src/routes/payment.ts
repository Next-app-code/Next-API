import { Router } from 'express';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';

const router = Router();

interface PaymentRecord {
  id: string;
  payer: string;
  recipient: string;
  mint: string;
  amount: number;
  status: 'pending' | 'completed' | 'refunded';
  timestamp: number;
  memo?: string;
}

// In-memory storage (replace with database in production)
const payments = new Map<string, PaymentRecord>();

/**
 * Create payment intent
 */
router.post('/create-intent', async (req, res) => {
  const { recipient, mint, amount, memo } = req.body;
  
  if (!recipient || !mint || !amount) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  try {
    const paymentId = `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const payment: PaymentRecord = {
      id: paymentId,
      payer: '', // Will be filled when paid
      recipient,
      mint,
      amount: Number(amount),
      status: 'pending',
      timestamp: Date.now(),
      memo,
    };
    
    payments.set(paymentId, payment);
    
    res.json({
      paymentId,
      recipient,
      mint,
      amount,
      status: 'pending',
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to create payment intent',
    });
  }
});

/**
 * Verify payment on-chain
 */
router.post('/verify', async (req, res) => {
  const { endpoint, signature, paymentId } = req.body;
  
  if (!endpoint || !signature) {
    return res.status(400).json({ error: 'Endpoint and signature are required' });
  }
  
  try {
    const connection = new Connection(endpoint, 'confirmed');
    
    // Get transaction
    const tx = await connection.getTransaction(signature, {
      maxSupportedTransactionVersion: 0,
    });
    
    if (!tx) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    if (tx.meta?.err) {
      return res.status(400).json({ 
        error: 'Transaction failed',
        details: tx.meta.err
      });
    }
    
    // Update payment if paymentId provided
    if (paymentId && payments.has(paymentId)) {
      const payment = payments.get(paymentId)!;
      payment.status = 'completed';
      payment.payer = tx.transaction.message.accountKeys[0]?.toBase58() || '';
      payments.set(paymentId, payment);
    }
    
    res.json({
      verified: true,
      signature,
      blockTime: tx.blockTime,
      slot: tx.slot,
      fee: tx.meta?.fee,
      paymentId,
      status: 'completed',
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to verify payment',
    });
  }
});

/**
 * Get payment status
 */
router.get('/status/:paymentId', (req, res) => {
  const { paymentId } = req.params;
  
  const payment = payments.get(paymentId);
  
  if (!payment) {
    return res.status(404).json({ error: 'Payment not found' });
  }
  
  res.json({
    id: payment.id,
    status: payment.status,
    recipient: payment.recipient,
    mint: payment.mint,
    amount: payment.amount,
    payer: payment.payer,
    timestamp: payment.timestamp,
    memo: payment.memo,
  });
});

/**
 * List all payments
 */
router.get('/list', (req, res) => {
  const { status, recipient, payer } = req.query;
  
  let filtered = Array.from(payments.values());
  
  if (status) {
    filtered = filtered.filter(p => p.status === status);
  }
  if (recipient) {
    filtered = filtered.filter(p => p.recipient === recipient);
  }
  if (payer) {
    filtered = filtered.filter(p => p.payer === payer);
  }
  
  res.json({
    payments: filtered,
    total: filtered.length,
  });
});

/**
 * Calculate payment with fee
 */
router.post('/calculate', (req, res) => {
  const { amount, feeBps = 100 } = req.body;
  
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }
  
  const fee = Math.floor((amount * feeBps) / 10000);
  const total = amount + fee;
  const netAmount = amount - fee;
  
  res.json({
    requestedAmount: amount,
    fee,
    feeBps,
    totalToPay: total,
    recipientReceives: netAmount,
  });
});

export { router as paymentRouter };

