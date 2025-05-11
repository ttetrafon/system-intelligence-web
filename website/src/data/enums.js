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
  EDITOR_FORMAT_H1: Symbol("editor-format-h1"),
  EDITOR_FORMAT_H2: Symbol("editor-format-h2"),
  EDITOR_FORMAT_H3: Symbol("editor-format-h3"),
  EDITOR_FORMAT_H4: Symbol("editor-format-h4"),
  EDITOR_FORMAT_H5: Symbol("editor-format-h5"),
  EDITOR_FORMAT_H6: Symbol("editor-format-h6"),
  EDITOR_FORMAT_P: Symbol("editor-format-p"),
  INPUT_CONTROL: Symbol("input-control"),
  MAIN_MENU_TOGGLE: Symbol("main-manu-toggle"),
  MAIN_MENU_CLOSE: Symbol("main-menu-close"),
  NAVIGATE: Symbol("navigate"),
  PAGE_OPEN_PLAIN: Symbol("open-page-trigger"),
  PAGE_EDIT: Symbol("edit-page"),
  SUB_PAGE_CONTAINER: Symbol("sub-page-container"),
  TOGGLE_SPINNING_CIRCLE: Symbol("toggle-spinning-circle")
});

export const generalNames = Object.freeze({
  OBSERVABLE_USER: Symbol("user"),

  GAME_CONNECTION_LIVE: Symbol("game-live"),
  GAME_CONNECTION_OFFLINE: Symbol("game-offline"),
  GAME_CONNECTION_SOLO: Symbol("game-solo")
});

export const editablePageOperationNames = Object.freeze({
  LINE_ADDED: Symbol("new-line"),
  LINE_DELETED: Symbol("delete-line"),
  LINE_UPDATED: Symbol("update-line")
});

export const messageTypes = Object.freeze({
  CHAT_MESSAGE: Symbol("chat-message"),
  COMMAND: Symbol("command")
});
