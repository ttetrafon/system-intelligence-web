import { commandNames } from "../data/enums.js";

export class Command {
  /**
   *
   * @param {String} id
   * @param {String} category // the command's category; see commandNames
   * @param {String} type // the command's type; see commandNames
   */
  constructor(id, category, type) {
    this.id = id;
    this.category = category;
    this.type = type;
  }
}

export class Command_AppMenu_AddItem extends Command {
  /**
   *
   * @param {UUID} commandId
   * @param {UUID} identifier // the menu item's uuid
   * @param {Number} indentation // the menu item's indentation
   * @param {UUID} after // the previous sibling for the new menu item; null if first
   */
  constructor(commandId, identifier, label, indentation, after) {
    super(commandId, commandNames.CATEGORY_APP_MENUS.description, commandNames.COMMAND_APP_MENUS_ADD_ITEM.description);
    this.label = label;
    this.identifier = identifier;
    this.indentation = indentation;
    this.after = after;
  }
}

export class Command_AppMenu_DeleteItem extends Command {
  /**
   *
   * @param {UUID} commandId
   * @param {UUID} identifier // the menu item's uuid
   */
  constructor(commandId, identifier) {
    super(
      commandId,
      commandNames.CATEGORY_APP_MENUS.description,
      commandNames.COMMAND_APP_MENUS_ADD_ITEM.description
    );
    this.identifier = identifier;
  }
}

export class Command_Editor_UpdateLines extends Command {
  /**
   *
   * @param {UUID} commandId
   * @param {Number} documentVersion
   * @param {JSON} dataCategory
   * @param {JSON} dataStructure
   */
  constructor(
    commandId,
    documentVersion,
    dataCategory,
    dataStructure
  ) {
    super(
      commandId,
      commandNames.CATEGORY_GAMEPLAY_DATA.description,
      commandNames.COMMAND_GAMEPLAY_DATA_UPDATE_DOCUMENT.description,
    );
    this.documentVersion = documentVersion;
    this.dataCategory = dataCategory;
    this.dataStructure = dataStructure;
  }

  updateDocumentVersion() {
    this.documentVersion++;
    this.dataStructure.version = this.documentVersion;
  }
}
