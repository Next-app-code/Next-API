import { Router } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

// In-memory storage for demo purposes
// In production, use a proper database
const workflows = new Map<string, Workflow>();

interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: unknown[];
  edges: unknown[];
  rpcEndpoint: string;
  owner?: string;
  createdAt: string;
  updatedAt: string;
}

const workflowSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  nodes: z.array(z.any()),
  edges: z.array(z.any()),
  rpcEndpoint: z.string().url().optional().default(''),
});

const updateWorkflowSchema = workflowSchema.partial();

// Get all workflows
router.get('/', (req, res) => {
  const owner = req.headers['x-wallet-address'] as string | undefined;
  
  let result = Array.from(workflows.values());
  
  if (owner) {
    result = result.filter(w => w.owner === owner);
  }
  
  res.json({
    workflows: result.map(w => ({
      id: w.id,
      name: w.name,
      description: w.description,
      nodeCount: w.nodes.length,
      edgeCount: w.edges.length,
      createdAt: w.createdAt,
      updatedAt: w.updatedAt,
    })),
    total: result.length,
  });
});

// Get workflow by ID
router.get('/:id', (req, res) => {
  const workflow = workflows.get(req.params.id);
  
  if (!workflow) {
    return res.status(404).json({ error: 'Workflow not found' });
  }
  
  res.json(workflow);
});

// Create workflow
router.post('/', validateRequest(workflowSchema), (req, res) => {
  const owner = req.headers['x-wallet-address'] as string | undefined;
  const data = req.body;
  
  const workflow: Workflow = {
    id: uuidv4(),
    name: data.name,
    description: data.description,
    nodes: data.nodes,
    edges: data.edges,
    rpcEndpoint: data.rpcEndpoint,
    owner,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  workflows.set(workflow.id, workflow);
  
  res.status(201).json(workflow);
});

// Update workflow
router.put('/:id', validateRequest(updateWorkflowSchema), (req, res) => {
  const workflow = workflows.get(req.params.id);
  
  if (!workflow) {
    return res.status(404).json({ error: 'Workflow not found' });
  }
  
  const owner = req.headers['x-wallet-address'] as string | undefined;
  if (workflow.owner && workflow.owner !== owner) {
    return res.status(403).json({ error: 'Not authorized to update this workflow' });
  }
  
  const data = req.body;
  const updated: Workflow = {
    ...workflow,
    ...data,
    id: workflow.id,
    owner: workflow.owner,
    createdAt: workflow.createdAt,
    updatedAt: new Date().toISOString(),
  };
  
  workflows.set(updated.id, updated);
  
  res.json(updated);
});

// Delete workflow
router.delete('/:id', (req, res) => {
  const workflow = workflows.get(req.params.id);
  
  if (!workflow) {
    return res.status(404).json({ error: 'Workflow not found' });
  }
  
  const owner = req.headers['x-wallet-address'] as string | undefined;
  if (workflow.owner && workflow.owner !== owner) {
    return res.status(403).json({ error: 'Not authorized to delete this workflow' });
  }
  
  workflows.delete(req.params.id);
  
  res.status(204).send();
});

// Validate workflow structure
router.post('/validate', (req, res) => {
  const { nodes, edges } = req.body;
  
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!Array.isArray(nodes)) {
    errors.push('nodes must be an array');
  }
  
  if (!Array.isArray(edges)) {
    errors.push('edges must be an array');
  }
  
  if (errors.length === 0) {
    const nodeIds = new Set(nodes.map((n: { id: string }) => n.id));
    
    for (const edge of edges) {
      if (!nodeIds.has(edge.source)) {
        errors.push(`Edge references non-existent source node: ${edge.source}`);
      }
      if (!nodeIds.has(edge.target)) {
        errors.push(`Edge references non-existent target node: ${edge.target}`);
      }
    }
    
    if (nodes.length === 0) {
      warnings.push('Workflow has no nodes');
    }
  }
  
  res.json({
    valid: errors.length === 0,
    errors,
    warnings,
  });
});

export { router as workflowRouter };

