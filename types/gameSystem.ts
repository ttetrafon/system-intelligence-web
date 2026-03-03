export interface GameSystemData {
  core: CoreData;
  characters: object;
  adventuring: object;
  equipment: object;
  last_updated: number;
};

export interface CoreData {
  checks: string;
  resources: string;
  'skill-challenges': string;
  tasks: string;
  'bonuses-penalties': string;
  'advantage-disadvantage': string;
  tags: string;
};

export const defaultGameSystemDataObj: GameSystemData = {
  core: {
    checks: "",
    resources: "",
    "skill-challenges": "",
    tasks: "",
    "bonuses-penalties": "",
    "advantage-disadvantage": "",
    tags: ""
  },
  characters: {},
  adventuring: {},
  equipment: {},
  last_updated: 0
};
