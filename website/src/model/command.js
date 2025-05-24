export const commandNames = Object.freeze({
  CATEGORY_APP_MENUS: Symbol("command-app-menus"),
  COMMAND_APP_MENUS_ADD_ITEM: Symbol("app-menus-add-item"),
  COMMAND_APP_MENUS_DELETE_ITEM: Symbol("app-menus-add-item"),
  COMMAND_APP_MENUS_INDENT_ITEM: Symbol("app-menus-indent-item"),
  COMMAND_APP_MENUS_MOVE_ITEM: Symbol("app-menus-move-item"),
  COMMAND_APP_MENUS_RENAME_ITEM: Symbol("app-menus-rename-item"),

  CATEGORY_GAMEPLAY_DATA: Symbol("command-gameplay-data"),
  COMMAND_GAMEPLAY_DATA_UPDATE_DOCUMENT: Symbol("gameplay-data-update-document")
});

export class Command {
  /**
   *
   * @param {String} category // the command's category; see commandNames
   * @param {String} type // the command's type; see commandNames
   * @param {Number} documentVersion // the current version of the document to be affected
   */
  constructor(category, type, documentVersion) {
    this.id = crypto.randomUUID();
    this.category = category;
    this.type = type;
    this.documentVersion = documentVersion;
  }
}

export class Command_AppMenu_AddItem extends Command {
  /**
   *
   * @param {Number} indentation // the menu item's indentation (spaces, multiple of 2)
   * @param {String} after // the previous sibling for the new menu item; null if first
   */
  constructor(documentVersion, label, indentation, after) {
    super(
      commandNames.CATEGORY_APP_MENUS.description,
      commandNames.COMMAND_APP_MENUS_ADD_ITEM.description,
      documentVersion
    );
    this.identifier = crypto.randomUUID();
    this.label = label;
    this.indentation = indentation;
    this.after = after;
  }
}

export class Command_AppMenu_DeleteItem extends Command {
  /**
   *
   * @param {Number} documentVersion
   * @param {String} identifier: the item's uuid
   */
  constructor(documentVersion, identifier) {
    super(
      commandNames.CATEGORY_APP_MENUS.description,
      commandNames.COMMAND_APP_MENUS_DELETE_ITEM.description,
      documentVersion
    );
    this.identifier = identifier;
  }
}

export class Command_Editor_UpdateDocument extends Command {
  /**
   *
   * @param {Number} documentVersion
   * @param {JSON} dataCategory
   * @param {JSON} dataStructure
   */
  constructor(documentVersion, dataCategory, dataStructure) {
    super(
      commandNames.CATEGORY_GAMEPLAY_DATA.description,
      commandNames.COMMAND_GAMEPLAY_DATA_UPDATE_DOCUMENT.description,
      documentVersion
    );
    this.dataCategory = dataCategory;
    this.dataStructure = dataStructure;
  }
}
