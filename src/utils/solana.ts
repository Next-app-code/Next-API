import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

export function isValidPublicKey(value: string): boolean {
  try {
    new PublicKey(value);
    return true;
  } catch {
    return false;
  }
}

export function lamportsToSol(lamports: number): number {
  return lamports / LAMPORTS_PER_SOL;
}

export function solToLamports(sol: number): number {
  return Math.floor(sol * LAMPORTS_PER_SOL);
}

export async function testConnection(endpoint: string): Promise<{
  connected: boolean;
  slot?: number;
  error?: string;
}> {
  try {
    const connection = new Connection(endpoint, 'confirmed');
    const slot = await connection.getSlot();
    return { connected: true, slot };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Connection failed',
    };
  }
}

export async function getAccountBalance(
  connection: Connection,
  publicKey: string
): Promise<{ lamports: number; sol: number }> {
  const pubkey = new PublicKey(publicKey);
  const lamports = await connection.getBalance(pubkey);
  return {
    lamports,
    sol: lamportsToSol(lamports),
  };
}

export async function getClusterInfo(connection: Connection): Promise<{
  slot: number;
  blockHeight: number;
  epoch: number;
}> {
  const [slot, blockHeight, epochInfo] = await Promise.all([
    connection.getSlot(),
    connection.getBlockHeight(),
    connection.getEpochInfo(),
  ]);

  return {
    slot,
    blockHeight,
    epoch: epochInfo.epoch,
  };
}

