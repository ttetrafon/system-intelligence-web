import { commandNames } from "../data/enums.js";

export class Command {
  /**
   *
   * @param {String} category // the command's category; see commandNames
   * @param {String} type // the command's type; see commandNames
   * @param {Number} documentVersion // the current version of the document to be affected
   */
  constructor(category, type, documentVersion) {
    this.$id = crypto.randomUUID();
    this.$category = category;
    this.$type = type;
    this.$documentVersion = documentVersion;
  }
}

export class Command_AppMenu_AddItem extends Command {
  /**
   *
   * @param {Number} indentation // the menu item's indentation (spaces, multiple of 2)
   * @param {String} after // the previous sibling for the new menu item; null if first
   */
  constructor(documentVersion, indentation, after) {
    super(
      commandNames.CATEGORY_APP_MENUS.description,
      commandNames.COMMAND_APP_MENUS_ADD_ITEM.description,
      documentVersion);
    this.$identifier = crypto.randomUUID();
    this.$indentation = indentation;
    this.$after = after;
  }
}
