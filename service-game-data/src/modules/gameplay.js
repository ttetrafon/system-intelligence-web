import { Command_AppMenu_AddItem, Command_Editor_UpdateLines } from '../model/command.js';
import { ContentsMenuItem } from '../model/db-data.js';
import { fileDbNames, fileDbNamesByDescription } from '../data/enums.js';
import { CompletionServices } from '../services/Completion.js';
import { FileDB } from '../services/FileDB.js';
import { Logger } from '../services/Logger.js';

export class Gameplay {
  constructor() {
    if (Gameplay._instance) {
      return Gameplay._instance;
    }
    Gameplay._instance = this;

    this.logger = new Logger();
    this.logger.info(`---> Gameplay`);

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
    this.logger.info(`---> Gameplay.command()`);
    let data = request.body;
    let documentVersion = data.documentVersion;
    let command = new Command_AppMenu_AddItem(data.id, data.identifier, data.label, data.indentation, data.after);

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
    if (command.after) { // TODO: move this to a helper function - it will be needed a lot!
      let afterIndex = menus.order.indexOf(command.after);
      if (afterIndex >= 0) {
        if (menus.order.length > afterIndex) {
          menus.order.splice(afterIndex + 1, 0, command.identifier);
        }
        else {
          menus.order.push(command.identifier);
        }
      }
    }
    else {
      menus.order.unshift(command.identifier);
    }
    console.log("new order:", menus.order);

    // - items
    let newItem = new ContentsMenuItem(command.identifier, command.label, command.indentation, [], [], []);
    console.log("new item:", newItem);

    // - version
    menus.version += 1;

    // store the document
    let res = await this.fileDB.updateDataFile(fileDbNames.COL_APP_STRUCTURE, fileDbNames.ID_APP_MENUS,
      { _id: "menus" },
      {
        $set: {
          'version': menus.version,
          'order': menus.order,
          ['items.' + newItem.id]: newItem
        }
      }
    );
    console.log("... fileDb result", res); // TODO: return a failure if the update fails!

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
   */
  async commandAppMenuDeleteItem(request, response) {
    this.logger.info(`---> Gameplay.command()`);
    let data = request.body;
    let documentVersion = data.documentVersion;
    let command = new Command_AppMenu_AddItem(data.id, data.identifier);


    let menus = await this.fileDB.retrieveDataFile(
      fileDbNames.COL_APP_STRUCTURE,
      fileDbNames.ID_APP_MENUS
    );

    // check document version
    if (menus.version != documentVersion) {
      this.completion.sendFailResponse(request, response, this.completion.completionCodes.COMMAND_DOCUMENT_VERSION_MISMATCH);
      return;
    };

    // - version
    menus.version += 1;

    // - order


    // - items


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

  async gameplayData(request, response, section) {
    this.logger.info(`---> Gameplay.gameplayData(${ section })`);

    await this.fileDB.getGameplayDb();

    let sectionData = await this.fileDB.retrieveDataFile(fileDbNames.COL_GENERAL_GAMEPLAY, fileDbNamesByDescription[section]);

    // TODO: update schema if needed

    return sectionData;
  }

  async commandEditorUpdateLine(request, response) {
    this.logger.info(`---> Gameplay.commandEditorUpdateLine()`);
    let data = request.body;
    let command = new Command_Editor_UpdateLines(data.id, data.documentVersion, data.dataCategory, data.dataStructure);
    console.log("command:", command);

    await this.fileDB.getGameplayDb();

    let currentDocumentVersion = await this.fileDB.retrieveDataFileLine(fileDbNames.COL_GENERAL_GAMEPLAY, command.dataCategory, "version");
    command.documentVersion = currentDocumentVersion.version;

    command.updateDocumentVersion();
    let res = await this.fileDB.updateDataFile(fileDbNames.COL_GENERAL_GAMEPLAY, command.dataCategory, command.dataStructure);

    console.log("... fileDb result", res); // TODO: return a failure if the update fails!

    return {
      'commands': [ // TODO: stored commands here...
        command
      ],
      'info': {
      }
    };
  }

  /**
  *
  * @param {Request} request
  * @param {Response} response
  * @returns
  */
  async menus(request, response) {
    this.logger.info(`---> Gameplay.menus()`);

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
