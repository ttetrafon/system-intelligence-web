export const commandNames = Object.freeze({
  CATEGORY_APP_MENUS: Symbol("command-app-menus"),
  COMMAND_APP_MENUS_ADD_ITEM: Symbol("app-menus-add-item"),
  COMMAND_APP_MENUS_MOVE_ITEM: Symbol("app-menus-move-item"),
  COMMAND_APP_MENUS_RENAME_ITEM: Symbol("app-menus-rename-item")
});

export const fileDbNames = Object.freeze({
  DB_CONFIG: Symbol("config"),
  COL_SETTINGS: Symbol("settings"),

  DB_APP_DATA: Symbol("app-data"),
  COL_APP_STRUCTURE: Symbol("app-structure"),
  ID_APP_MENUS: Symbol("menus"),

  DB_GAME_DATA: Symbol("gameplay-data"),
  COL_GENERAL_GAMEPLAY: Symbol("general-gameplay"),
  ID_ATTRIBUTES: Symbol("attributes"),
  ID_GAMEPLAY: Symbol("gameplay")
});

export const schemaUpdates = Object.freeze({
  ADD_PROPERTY: Symbol("add-property")
});
