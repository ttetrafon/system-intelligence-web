export interface GameSystemData {
  core: {
    checks: string;
    resources: string;
    'skill-challenges': string;
    tasks: string;
    'bonuses-penalties': string;
    'advantage-disadvantage': string;
    tags: string;
  };
  characters: {
    aspects: {
      'aspect-categories': Record<string, {
        name: string;
        description: string;
        aspects: Record<string, {
          aspect: string;
        }>[];
      }>[];
      perks: Record<string, {
        perk: string;
      }>[];
      professions: string[];
    };
    morality: string;
  };
  adventuring: object;
  equipment: object;
  last_updated: number;
};

export const defaultGameSystemDataObj: GameSystemData = {
  core: {
    checks: "",
    resources: "",
    "skill-challenges": "",
    tasks: "",
    "bonuses-penalties": "",
    "advantage-disadvantage": "",
    tags: "",
  },
  characters: {
    aspects: {
      "aspect-categories": [],
      perks: [],
      professions: [],
    },
    morality: "",
  },
  adventuring: {},
  equipment: {},
  last_updated: 0,
};

export interface DataLinks {
  gameSystem: object;
};
