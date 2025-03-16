import { fileDbNames } from "./enums.js";

export const templateFileDbData = {
  [fileDbNames.COL_APP_STRUCTURE]: {
    [fileDbNames.ID_APP_MENUS]: {
      schemaVersion: 1,
      version: 0,
      order: [],
      items: {}
    }
  }
};

export const fileDbSchemaOperations = {
  [fileDbNames.COL_APP_STRUCTURE]: {
    [fileDbNames.ID_APP_MENUS]: {
      "0::1": []
    }
  }
};
