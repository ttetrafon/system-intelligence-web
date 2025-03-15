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

  async gameplayData(request) {
    this.logger.info(`---> WebApp.gameplayData()`);

    await this.fileDB.getGameplayDb();

    let gameplayData = await this.fileDB.retrieveDataFile(
      fileDbNames.COL_GENERAL_GAMEPLAY,
      fileDbNames.ID_GAMEPLAY
    );
    return {
      'gameplay-data': gameplayData
    };
  }

  /**
 *
 * @param {Request} request
 */
  async menus(request) {
    this.logger.info(`---> WebApp.menus()`);

    await this.fileDB.getAppDataDb();

    let menus = await this.fileDB.retrieveDataFile(
      fileDbNames.COL_APP_STRUCTURE,
      fileDbNames.ID_APP_MENUS
    );
    return {
      'app-menus': menus
    };
  }
}
