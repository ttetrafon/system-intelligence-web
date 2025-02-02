import express from 'express';
import { requestHandler } from '../helper/handler.js';
import { Gameplay } from '../modules/gameplay.js';
import { FileDB } from '../services/FileDB.js';

// services
const fileDb = new FileDB();
// modules
const gameplay = new Gameplay();

const router = express.Router();

// Middleware specific to this route
router.use((req, res, next) => {
  console.log(`Request received at /data:`, req.method);
  fileDb.connectToFileDb(); // always make sure we are connected to the FileDB
  next();
});

// POST /data
router.post('/', async (req, res) => {
  await requestHandler(req, res, gameplay.test, true);
});

export default router;