export interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  rpcEndpoint: string;
  owner?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: NodeData;
}

export interface NodeData {
  label: string;
  category: string;
  type: string;
  inputs: NodePort[];
  outputs: NodePort[];
  values: Record<string, unknown>;
  color: string;
}

export interface NodePort {
  id: string;
  name: string;
  type: 'input' | 'output';
  dataType: string;
  required?: boolean;
  defaultValue?: unknown;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface RpcTestResult {
  connected: boolean;
  slot?: number;
  version?: { 'solana-core': string };
  endpoint: string;
  error?: string;
}

export interface BalanceResult {
  publicKey: string;
  lamports: number;
  sol: number;
}

export interface AccountInfoResult {
  exists: boolean;
  publicKey: string;
  lamports?: number;
  owner?: string;
  executable?: boolean;
  rentEpoch?: number;
  dataLength?: number;
}

export interface BlockhashResult {
  blockhash: string;
  lastValidBlockHeight: number;
}

export interface SlotResult {
  slot: number;
  blockHeight: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}


