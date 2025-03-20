import { commandNames } from "../data/enums.js";

export class Command {
  /**
   *
   * @param {String} uuid
   * @param {String} category // the command's category; see commandNames
   * @param {String} type // the command's type; see commandNames
   */
  constructor(id, category, type) {
    this.$id = id;
    this.$category = category;
    this.$type = type;
  }
}

export class Command_AppMenu_AddItem extends Command {
  /**
   *
   * @param {String} identifier // the menu item's uuid
   * @param {Number} indentation // the menu item's indentation
   * @param {String} after // the previous sibling for the new menu item; null if first
   */
  constructor(commandId, identifier, indentation, after) {
    super(commandId, commandNames.CATEGORY_APP_MENUS.description, commandNames.COMMAND_APP_MENUS_ADD_ITEM.description);
    this.$identifier = identifier;
    this.$indentation = indentation;
    this.$after = after;
  }
}
