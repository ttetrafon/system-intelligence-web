export const commandNames = Object.freeze({
  CATEGORY_APP_MENUS: Symbol("command-app-menus"),
  COMMAND_APP_MENUS_ADD_ITEM: Symbol("app-menus-add-item"),
  COMMAND_APP_MENUS_DELETE_ITEM: Symbol("app-menus-add-item"),
  COMMAND_APP_MENUS_INDENT_ITEM: Symbol("app-menus-indent-item"),
  COMMAND_APP_MENUS_MOVE_ITEM: Symbol("app-menus-move-item"),
  COMMAND_APP_MENUS_RENAME_ITEM: Symbol("app-menus-rename-item")
});

export const eventNames = Object.freeze({
  CHAT_BUTTON: Symbol("chat-button"),
  CONTENTS_ITEM_ADD: Symbol("add-contents-item"),
  CONTENTS_ITEM_DELETE: Symbol("delete-contents-item"),
  CONTENTS_ITEM_DELETE_PLAIN: Symbol("delete-contents-item-trigger"),
  CONTENTS_ITEM_EDIT: Symbol("edit-contents-item"),
  CONTENTS_ITEM_EDIT_PLAIN: Symbol("edit-contents-item-trigger"),
  CONTENTS_ITEM_OPEN_PAGE: Symbol("add-contents-item"),
  DIALOG_OPEN: Symbol("open-dialog"),
  DIALOG_CANCEL: Symbol("cancel-dialog"),
  DIALOG_CONFIRM: Symbol("confirm-dialog"),
  DICE_ROLLER_BUTTON: Symbol("chat-button"),
  INPUT_CONTROL: Symbol("input-control"),
  MAIN_MENU_TOGGLE: Symbol("main-manu-toggle"),
  MAIN_MENU_CLOSE: Symbol("main-menu-close"),
  NAVIGATE: Symbol("navigate"),
  PAGE_OPEN_PLAIN: Symbol("open-page-trigger"),
  PAGE_EDIT: Symbol("edit-page"),
  PAGE_EDIT_PARAGRAPH: Symbol("create-paragraph"),
  SUB_PAGE_CONTAINER: Symbol("sub-page-container"),
  TOGGLE_SPINNING_CIRCLE: Symbol("toggle-spinning-circle")
});

export const generalNames = Object.freeze({
  OBSERVABLE_USER: Symbol("user"),
  PAGE_EDIT: Symbol("Edit Page"),
  PAGE_NEW: Symbol("New Page")
});

export const editablePageOperationNames = Object.freeze({
  LINE_ADDED: Symbol("new-line"),
  LINE_DELETED: Symbol("delete-line"),
  LINE_UPDATED: Symbol("update-line")
});
