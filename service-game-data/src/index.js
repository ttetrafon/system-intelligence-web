import cors from 'cors';
import express from 'express';
import serverlessExpress from '@vendia/serverless-express';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

import dataRoutes from './routes/data.js';
import indexRoutes from './routes/root.js';
import { Logger } from './services/Logger.js';
import { SqlDB } from './services/SqlDB.js';

// Initial setup
const logger = new Logger();
const sql = new SqlDB();

// Create the Express app
const app = express();
const allowedOrigins = [
  'http://127.0.0.1:5500',
  'https://system-intelligence.com'];
app.use(cors({
  origin: function (origin, callback) {
    logger.debug(`request origin: ${origin}`);
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Global middleware
app.use((req, res, next) => {
  logger.debug(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Routes
app.use('/', indexRoutes);
app.use('/data', dataRoutes);

// Lambda handler for AWS
let serverlessExpressInstance;

export const handler = async (event, context) => {
  if (!serverlessExpressInstance) {
    serverlessExpressInstance = serverlessExpress({ app });
  }
  return serverlessExpressInstance(event, context);
};

// Utility to check if this module is the main entry point
const isMain = () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  return process.argv[1] === __filename;
};

// Run locally if this file is the main entry point
if (isMain()) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    logger.info(`Server running locally on http://localhost:${PORT}`);
  });
}
