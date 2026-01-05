import { Router } from 'express';
import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

const router = Router();

// Get SPL token balance
router.post('/balance', async (req, res) => {
  const { endpoint, owner, mint } = req.body;
  
  if (!endpoint || !owner) {
    return res.status(400).json({ error: 'Endpoint and owner are required' });
  }
  
  try {
    const connection = new Connection(endpoint, 'confirmed');
    const ownerPubkey = new PublicKey(owner);
    
    if (mint) {
      // Get specific token balance
      const mintPubkey = new PublicKey(mint);
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        ownerPubkey,
        { mint: mintPubkey }
      );
      
      const balance = tokenAccounts.value.reduce((sum, account) => {
        return sum + (account.account.data.parsed?.info?.tokenAmount?.uiAmount || 0);
      }, 0);
      
      res.json({
        owner,
        mint,
        balance,
        accounts: tokenAccounts.value.length,
      });
    } else {
      // Get all token balances
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        ownerPubkey,
        { programId: TOKEN_PROGRAM_ID }
      );
      
      const tokens = tokenAccounts.value.map(account => ({
        mint: account.account.data.parsed?.info?.mint,
        balance: account.account.data.parsed?.info?.tokenAmount?.uiAmount,
        decimals: account.account.data.parsed?.info?.tokenAmount?.decimals,
        address: account.pubkey.toBase58(),
      }));
      
      res.json({
        owner,
        tokens,
        total: tokens.length,
      });
    }
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to get token balance',
    });
  }
});

// Get token supply
router.post('/supply', async (req, res) => {
  const { endpoint, mint } = req.body;
  
  if (!endpoint || !mint) {
    return res.status(400).json({ error: 'Endpoint and mint are required' });
  }
  
  try {
    const connection = new Connection(endpoint, 'confirmed');
    const mintPubkey = new PublicKey(mint);
    const supply = await connection.getTokenSupply(mintPubkey);
    
    res.json({
      mint,
      amount: supply.value.amount,
      decimals: supply.value.decimals,
      uiAmount: supply.value.uiAmount,
    });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to get token supply',
    });
  }
});

// Get token accounts by owner
router.post('/accounts', async (req, res) => {
  const { endpoint, owner } = req.body;
  
  if (!endpoint || !owner) {
    return res.status(400).json({ error: 'Endpoint and owner are required' });
  }
  
  try {
    const connection = new Connection(endpoint, 'confirmed');
    const ownerPubkey = new PublicKey(owner);
    
    const accounts = await connection.getParsedTokenAccountsByOwner(
      ownerPubkey,
      { programId: TOKEN_PROGRAM_ID }
    );
    
    const formattedAccounts = accounts.value.map(account => ({
      address: account.pubkey.toBase58(),
      mint: account.account.data.parsed?.info?.mint,
      owner: account.account.data.parsed?.info?.owner,
      amount: account.account.data.parsed?.info?.tokenAmount?.amount,
      decimals: account.account.data.parsed?.info?.tokenAmount?.decimals,
      uiAmount: account.account.data.parsed?.info?.tokenAmount?.uiAmount,
    }));
    
    res.json({
      owner,
      accounts: formattedAccounts,
      total: formattedAccounts.length,
    });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to get token accounts',
    });
  }
});

export { router as tokenRouter };

