export const commandNames = Object.freeze({
  CATEGORY_APP_MENUS: Symbol("command-app-menus"),
  COMMAND_APP_MENUS_ADD_ITEM: Symbol("app-menus-add-item"),
  COMMAND_APP_MENUS_INDENT_ITEM: Symbol("app-menus-indent-item"),
  COMMAND_APP_MENUS_MOVE_ITEM: Symbol("app-menus-move-item"),
  COMMAND_APP_MENUS_RENAME_ITEM: Symbol("app-menus-rename-item")
});

export const eventNames = Object.freeze({
  ADD_CONTENTS_ITEM: Symbol("add-contents-item"),
  DIALOG_OPEN: Symbol("open-dialog"),
  DIALOG_CANCEL: Symbol("cancel-dialog"),
  DIALOG_CONFIRM: Symbol("confirm-dialog"),
  INPUT_CONTROL: Symbol("input-control"),
  NAVIGATE: Symbol("navigate"),
  SUB_PAGE_CONTAINER: Symbol("sub-page-container"),
  TOGGLE_SPINNING_CIRCLE: Symbol("toggle-spinning-circle")
});

export const userRoles = Object.freeze({
  GM: Symbol("gm"),
  PLAYER: Symbol("player"),
  OBSERVER: Symbol("observer")
});
