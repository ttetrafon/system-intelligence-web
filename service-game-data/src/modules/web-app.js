import { FileDB } from '../services/FileDB.js';
import { Logger } from '../services/Logger.js';
import { fileDbNames } from '../data/enums.js';
import { Command_AppMenu_AddItem } from '../model/command.js';
import { CompletionServices } from '../services/Completion.js';
import { ContentsMenuItem } from '../model/db-data.js';

export class WebApp {
  constructor() {
    if (WebApp._instance) {
      return WebApp._instance;
    }
    WebApp._instance = this;

    this.logger = new Logger();
    this.logger.info(`---> WebApp`);

    this.completion = new CompletionServices();
    this.fileDB = new FileDB();
  }



}
