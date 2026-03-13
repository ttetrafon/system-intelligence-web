export interface GameSystemData {
  core: {
    checks: BlockDocument;
    resources: BlockDocument;
    'skill-challenges': BlockDocument;
    tasks: BlockDocument;
    'bonuses-penalties': BlockDocument;
    'advantage-disadvantage': BlockDocument;
    tags: BlockDocument;
  };
  characters: {
    aspects: BlockDocument;
    morality: BlockDocument;
  };
  adventuring: object;
  equipment: object;
  last_updated: number;
};

export interface BlockDocument {
  order: string[],
  blocks: Record<string, Block>;
}

export interface Block {
  id: string;
  type: "paragraph" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "listItemOrdered" | "listItemUnordered" | "blockquote";
  content: InlineNode[];
}

export interface InlineNode {
  text: string;
  bold?: boolean;
  italic?: boolean;
  link?: string;
  colour?: string;
}

export function emptyDocument(): BlockDocument {
  const id: string = crypto.randomUUID();
  return {
    order: [id],
    blocks: {
      [id]: {
        id: id,
        type: "paragraph",
        content: [{ text: "..." }]
      }
    }
  }
};

export const defaultGameSystemDataObj: GameSystemData = {
  core: {
    checks: emptyDocument(),
    resources: emptyDocument(),
    "skill-challenges": emptyDocument(),
    tasks: emptyDocument(),
    "bonuses-penalties": emptyDocument(),
    "advantage-disadvantage": emptyDocument(),
    tags: emptyDocument(),
  },
  characters: {
    aspects: emptyDocument(),
    morality: emptyDocument(),
  },
  adventuring: {},
  equipment: {},
  last_updated: 0,
};

export interface DataLinks {
  gameSystem: string[];
};

export interface DataLink {
  id: string;
  label: string;
  type: "page" | "section" | "entity";
  address: string;
};
