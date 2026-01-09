import { Router } from 'express';

const router = Router();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Generate workflow from natural language prompt
 */
router.post('/generate-workflow', async (req, res) => {
  const { prompt, nodeTypes } = req.body;
  
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }
  
  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }
  
  try {
    const systemPrompt = `You are a Solana workflow builder AI. Given a user's request, generate a workflow using the available node types.

Available node types and their purposes:
- rpc-connection: Connect to Solana RPC
- get-balance: Get SOL balance of an account
- wallet-connect: Get connected wallet's public key
- get-token-accounts: Get token accounts for an owner
- get-token-balance: Get balance of specific token
- transfer-sol: Create SOL transfer instruction
- transfer-token: Create token transfer instruction
- create-transaction: Create new transaction
- send-transaction: Send transaction to blockchain
- math-add/subtract/multiply/divide: Math operations
- lamports-to-sol, sol-to-lamports: Conversions
- logic-compare, logic-and, logic-or: Logic operations
- input-string, input-number, input-publickey: Input values
- output-display: Display results
- loop-for-each, loop-repeat, loop-range: Loop operations
- bags-bonding-curve: Check Bags.fm bonding curve
- bags-migration-check: Check migration readiness
- bags-token-info: Get Bags token info

Respond ONLY with a JSON object in this exact format:
{
  "nodes": [
    {
      "type": "node-type",
      "label": "Node Label",
      "position": { "x": 100, "y": 100 },
      "values": { "inputKey": "value" }
    }
  ],
  "edges": [
    {
      "sourceIndex": 0,
      "targetIndex": 1,
      "sourceHandle": "outputId",
      "targetHandle": "inputId"
    }
  ]
}

Rules:
- Space nodes horizontally (x += 250) and vertically (y varies by flow)
- Connect nodes logically based on data flow
- Use appropriate node types for the task
- Include necessary input nodes for user-provided values`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenAI API request failed');
    }
    
    const data: any = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response from AI');
    }
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI response is not valid JSON');
    }
    
    const workflow = JSON.parse(jsonMatch[0]);
    
    res.json({
      workflow,
      prompt,
      model: 'gpt-4o',
    });
  } catch (error) {
    console.error('AI workflow generation error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to generate workflow',
    });
  }
});

/**
 * Suggest next node based on current workflow
 */
router.post('/suggest-next', async (req, res) => {
  const { currentNodes, selectedNode } = req.body;
  
  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }
  
  try {
    const prompt = `Current workflow has these nodes: ${currentNodes.map((n: any) => n.type).join(', ')}.
Last selected node: ${selectedNode?.type || 'none'}.

Suggest 3 most logical next nodes to add to this workflow. Respond with JSON array:
[
  { "type": "node-type", "reason": "why this node makes sense" }
]`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
        max_tokens: 300,
      }),
    });
    
    const data: any = await response.json();
    const content = data.choices[0]?.message?.content;
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    
    if (jsonMatch) {
      const suggestions = JSON.parse(jsonMatch[0]);
      res.json({ suggestions });
    } else {
      res.json({ suggestions: [] });
    }
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to generate suggestions',
    });
  }
});

export { router as aiRouter };

