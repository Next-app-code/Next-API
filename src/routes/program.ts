import { Router } from 'express';
import { Connection, PublicKey } from '@solana/web3.js';

const router = Router();

// Get program accounts
router.post('/accounts', async (req, res) => {
  const { endpoint, programId } = req.body;
  
  if (!endpoint || !programId) {
    return res.status(400).json({ error: 'Endpoint and programId are required' });
  }
  
  try {
    const connection = new Connection(endpoint, 'confirmed');
    const programPubkey = new PublicKey(programId);
    
    const accounts = await connection.getProgramAccounts(programPubkey);
    
    res.json({
      programId,
      accounts: accounts.map(a => ({
        pubkey: a.pubkey.toBase58(),
        owner: a.account.owner.toBase58(),
        lamports: a.account.lamports,
        executable: a.account.executable,
        rentEpoch: a.account.rentEpoch,
        dataLength: a.account.data.length,
      })),
      total: accounts.length,
    });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to get program accounts',
    });
  }
});

// Get account data size
router.post('/account-size', async (req, res) => {
  const { endpoint, account } = req.body;
  
  if (!endpoint || !account) {
    return res.status(400).json({ error: 'Endpoint and account are required' });
  }
  
  try {
    const connection = new Connection(endpoint, 'confirmed');
    const pubkey = new PublicKey(account);
    const accountInfo = await connection.getAccountInfo(pubkey);
    
    if (!accountInfo) {
      return res.status(404).json({ error: 'Account not found' });
    }
    
    res.json({
      account,
      dataSize: accountInfo.data.length,
      owner: accountInfo.owner.toBase58(),
      executable: accountInfo.executable,
    });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to get account size',
    });
  }
});

export { router as programRouter };





