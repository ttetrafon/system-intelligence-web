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

  /**
   *
   * @param {Request} request
   * @param {Response} response
   * @returns
   */
  async commandAppMenusAddItem(request, response) {
    this.logger.info(`---> WebApp.command()`);
    let data = request.body;
    let documentVersion = data.$documentVersion;
    let command = new Command_AppMenu_AddItem(data.$id, data.$identifier, data.$indentation, data.$after);

    await this.fileDB.getAppDataDb();

    let menus = await this.fileDB.retrieveDataFile(
      fileDbNames.COL_APP_STRUCTURE,
      fileDbNames.ID_APP_MENUS
    );

    // check document version
    if (menus.version != documentVersion) {
      this.completion.sendFailResponse(request, response, this.completion.completionCodes.COMMAND_DOCUMENT_VERSION_MISMATCH);
      return;
    };

    // update the document
    // - order
    if (command.$after) { // TODO: move this to a helper function - it will be needed a lot!
      let afterIndex = menus.order.indexOf(command.$after);
      if (afterIndex >= 0) {
        if (menus.order.length > afterIndex) {
          menus.order.splice(afterIndex + 1, 0, command.$identifier);
        }
        else {
          menus.order.push(command.$identifier);
        }
      }
    }
    else {
      menus.order.unshift(command.$identifier);
    }

    // - items
    menus.items[command.$identifier] = new ContentsMenuItem(
      command.$identifier,
      command.$indentation,
      "",
      "",
      [],
      [],
      []
    );

    // - version
    menus.version += 1;

    // store the document
    // await this.fileDB.storeDataFile(fileDbNames.COL_APP_STRUCTURE, fileDbNames.ID_APP_MENUS, menus);

    return {
      'commands': [ // TODO: will send previous commands also if needed!
        command
      ],
      'info': {
        newVersion: menus.version
      },
      'menus': menus
    };
  }

  /**
   *
   * @param {Request} request
   * @param {Response} response
   * @returns
   */
  async gameplayData(request, response) {
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
  * @param {Response} response
  * @returns
  */
  async menus(request, response) {
    this.logger.info(`---> WebApp.menus()`);

    await this.fileDB.getAppDataDb();

    let menus = await this.fileDB.retrieveDataFile(
      fileDbNames.COL_APP_STRUCTURE,
      fileDbNames.ID_APP_MENUS
    );

    // TODO: update the schema if needed here before sending it back to the client!

    return {
      'app-menus': menus
    };
  }
}
