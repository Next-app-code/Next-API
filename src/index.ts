import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { workflowRouter } from './routes/workflow';
import { rpcRouter } from './routes/rpc';
import { healthRouter } from './routes/health';
import { tokenRouter } from './routes/token';
import { transactionRouter } from './routes/transaction';
import { nftRouter } from './routes/nft';
import { programRouter } from './routes/program';
import { paymentRouter } from './routes/payment';
import { bagsRouter } from './routes/bags';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/health', healthRouter);
app.use('/api/workflows', workflowRouter);
app.use('/api/rpc', rpcRouter);
app.use('/api/tokens', tokenRouter);
app.use('/api/transactions', transactionRouter);
app.use('/api/nfts', nftRouter);
app.use('/api/programs', programRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/bags', bagsRouter);

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Next API server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;


