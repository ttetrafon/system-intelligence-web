import { FileDB } from '../services/FileDB.js';
import { Logger } from '../services/Logger.js';
import { fileDbNames } from '../data/enums.js';
import { Command_AppMenu_AddItem } from '../model/command.js';
import { CompletionServices } from '../services/Completion.js';
import { ContentsMenuItem } from '../model/db-data.js';

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
    this.logger.info(`---> WebApp.command()`);
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

    // - items
    let newItem =  new ContentsMenuItem(
      command.identifier,
      command.label,
      command.indentation,
      [],
      [],
      []
    );

    // - version
    menus.version += 1;

    // store the document
    console.log("updated menus:", menus);
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
