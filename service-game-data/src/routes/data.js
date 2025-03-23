import express from 'express';
import { commandNames } from '../data/enums.js';
import { requestHandler } from '../helper/handler.js';
import { Gameplay } from '../modules/gameplay.js';
import { WebApp } from '../modules/web-app.js';
import { CompletionServices } from '../services/Completion.js';
import { FileDB } from '../services/FileDB.js';

// services
const completion = new CompletionServices();
const fileDb = new FileDB();
// modules
const gameplay = new Gameplay();
const webApp = new WebApp();

// TODO: store data in cache, so we don't hit the DB all the time...

// TODO: when retrieving data, filter out what the request user should not see!

// Data updates are done with commands
// - when a command comes, it should have the document's current version and action data
// TODO - overlapping commands should fail and ask the writer for 'merge', while non-overlapping commands should
// TODO - successful commands should also be send back through the notification service to everyone connected

const router = express.Router();

// Middleware specific to this route
router.use((req, res, next) => {
  console.log(`Request received at /data:`, req.method, req.url);
  fileDb.connectToFileDb(); // always make sure we are connected to the FileDB
  next();
});

// POST /data//command
router.post('/command/', async (req, res) => {
  let data = req.body;
  let commandType = data.$type;
  // TODO: move the command category & type into the request url as params; i.e.: /command/{command-category}/{command-type}/

  switch (commandType) {
    case commandNames.COMMAND_APP_MENUS_ADD_ITEM.description:
      await requestHandler(req, res, gameplay.commandAppMenusAddItem.bind(gameplay, req, res));
      break;
    default:
      await completion.sendFailResponse(req, res, completion.completionCodes.COMMAND_NOT_FOUND, data);
      break;
  }
});

// GET /data/app-menus
router.get('/web-app-menus/', async (req, res) => {
  await requestHandler(req, res, gameplay.menus.bind(gameplay, req, res));
});

// GET /data/gameplay
router.get('/gameplay-data/gameplay', async (req, res) => {
  await requestHandler(req, res, gameplay.gameplayData.bind(gameplay, req, res));
});

export default router;