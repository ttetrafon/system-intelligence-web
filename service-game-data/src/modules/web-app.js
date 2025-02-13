import { FileDB } from '../services/FileDB.js';
import { Logger } from '../services/Logger.js';
import { fileDbNames } from '../data/enums.js';

export class WebApp {
  constructor() {
    if (WebApp._instance) {
      return WebApp._instance;
    }
    WebApp._instance = this;

    this.logger = new Logger();
    this.logger.info(`---> WebApp`);

    this.fileDB = new FileDB();
  }

  /**
   *
   * @param {Request} request
   */
  async menus(request) {
    this.logger.info(`---> WebApp.menus()`);

    await this.fileDB.getAppDataDb();

    let menus = await this.fileDB.retrieveDataFile(
      fileDbNames.COL_APP_STRUCTURE.description,
      fileDbNames.ID_APP_MENUS.description
    );
    return {
      'app-menus': menus
    };
  }

  async gameplayData(request) {
    this.logger.info(`---> WebApp.gameplayData()`);

    await this.fileDB.getGameplayDb();

    let gameplayData = await this.fileDB.retrieveDataFile(
      fileDbNames.COL_GENERAL_GAMEPLAY.description,
      fileDbNames.ID_GAMEPLAY.description
    );
    return {
      'gameplay-data': gameplayData
    };
  }
}
