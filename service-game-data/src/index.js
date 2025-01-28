import express from 'express';
import serverlessExpress from '@vendia/serverless-express';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

import dataRoutes from './routes/data.js';
import indexRoutes from './routes/root.js';
import { Logger } from './services/Logger.js';

// Initial setup
const logger = new Logger();

// Create the Express app
const app = express();
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
