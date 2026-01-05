import { Router } from 'express';
import { Connection, PublicKey } from '@solana/web3.js';
import { Metaplex } from '@metaplex-foundation/js';

const router = Router();

// Get NFTs by owner
router.post('/by-owner', async (req, res) => {
  const { endpoint, owner } = req.body;
  
  if (!endpoint || !owner) {
    return res.status(400).json({ error: 'Endpoint and owner are required' });
  }
  
  try {
    const connection = new Connection(endpoint, 'confirmed');
    const ownerPubkey = new PublicKey(owner);
    const metaplex = Metaplex.make(connection);
    
    const nfts = await metaplex.nfts().findAllByOwner({ owner: ownerPubkey });
    
    const formattedNfts = nfts.map(nft => ({
      mint: nft.address.toBase58(),
      name: nft.name,
      symbol: nft.symbol,
      uri: nft.uri,
      sellerFeeBasisPoints: nft.sellerFeeBasisPoints,
      updateAuthority: nft.updateAuthorityAddress?.toBase58(),
      collection: nft.collection?.address?.toBase58(),
    }));
    
    res.json({
      owner,
      nfts: formattedNfts,
      total: formattedNfts.length,
    });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to get NFTs',
    });
  }
});

// Get NFT metadata
router.post('/metadata', async (req, res) => {
  const { endpoint, mint } = req.body;
  
  if (!endpoint || !mint) {
    return res.status(400).json({ error: 'Endpoint and mint are required' });
  }
  
  try {
    const connection = new Connection(endpoint, 'confirmed');
    const mintPubkey = new PublicKey(mint);
    const metaplex = Metaplex.make(connection);
    
    const nft = await metaplex.nfts().findByMint({ mintAddress: mintPubkey });
    
    res.json({
      mint,
      name: nft.name,
      symbol: nft.symbol,
      uri: nft.uri,
      sellerFeeBasisPoints: nft.sellerFeeBasisPoints,
      creators: nft.creators,
      collection: nft.collection,
      updateAuthority: nft.updateAuthorityAddress?.toBase58(),
      isMutable: nft.isMutable,
    });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to get NFT metadata',
    });
  }
});

export { router as nftRouter };

