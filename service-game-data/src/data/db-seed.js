import { fileDbNames } from "./enums.js";

export const templateFileDbData = {
  [fileDbNames.COL_APP_STRUCTURE]: {
    [fileDbNames.ID_APP_MENUS]: {
      schemaVersion: 1,
      version: 0,
      order: []
    }
  },
  [fileDbNames.COL_GENERAL_GAMEPLAY]: {
    [fileDbNames.ID_INTRODUCTION]: {
      schemaVersion: 1,
      version: 0,
      order: []
    }
  }
};

export const fileDbSchemaOperations = {
  [fileDbNames.COL_APP_STRUCTURE]: {
    [fileDbNames.ID_APP_MENUS]: {
      "1::2": []
    }
  },
  [fileDbNames.COL_GENERAL_GAMEPLAY]: {
    [fileDbNames.ID_INTRODUCTION]: {
      "1::2": []
    }
  }
};
