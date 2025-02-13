import express from 'express';
import { requestHandler } from '../helper/handler.js';
import { Gameplay } from '../modules/gameplay.js';
import { WebApp } from '../modules/web-app.js';
import { FileDB } from '../services/FileDB.js';

// services
const fileDb = new FileDB();
// modules
const gameplay = new Gameplay();
const webApp = new WebApp();

// TODO: store data in cache, so we don't hit the DB all the time...

const router = express.Router();

// Middleware specific to this route
router.use((req, res, next) => {
  console.log(`Request received at /data:`, req.method, req.url);
  fileDb.connectToFileDb(); // always make sure we are connected to the FileDB
  next();
});

// POST /data
router.post('/', async (req, res) => {
  await requestHandler(req, res, gameplay.test, true);
});

// GET /data/app-menus
router.get('/web-app-menus/', async (req, res) => {
  await requestHandler(req, res, webApp.menus.bind(webApp));
});

// GET /data/gameplay
router.get('/gameplay-data/gameplay', async (req, res) => {
  await requestHandler(req, res, webApp.gameplayData.bind(webApp));
});

export default router;