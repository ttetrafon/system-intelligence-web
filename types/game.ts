export interface GameSystemData {
  core: {
    checks: {
      document: BlockDocument
    };
    resources: {
      document: BlockDocument
    };
    skillChallenges: {
      document: BlockDocument
    };
    tasks: {
      document: BlockDocument
    };
    bonusesPenalties: {
      document: BlockDocument
    };
    advantageDisadvantage: {
      document: BlockDocument
    };
    tags: {
      document: BlockDocument
    };
  };
  characters: {
    aspects: {
      document: BlockDocument
    };
    morality: {
      document: BlockDocument,
      pairs: MoralityPairs;
    };
  };
  adventuring: object;
  equipment: object;
};

export interface UnorderedEntity {
  // this exists only to group similar entities to easily differentiate between ordered and unordered entities
}

export interface OrderedEntity {
  order: string[];
}

export interface MoralityPairs extends OrderedEntity {
  items: Record<string, MoralityPair>;
}

export interface MoralityPair {
  id: string;
  first: string;
  second: string;
}

export interface BlockDocument {
  order: string[],
  blocks: Record<string, Block>;
}

export interface ContentBlock {
  id: string;
  type: "paragraph"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "listItemOrdered"
  | "listItemUnordered"
  | "blockquote"
  | "moralityPairs";
  content: InlineNode[];
}

export interface TableCell {
  id: string;
  content: InlineNode[];
}

export interface TableRow {
  id: string;
  cells: TableCell[];
}

export interface TableBlock {
  id: string;
  type: "table";
  rows: TableRow[];
}

export type Block = ContentBlock | TableBlock;

export interface InlineNode {
  text: string;
  bold?: boolean;
  italic?: boolean;
  link?: string;
  colour?: string;
  dataLink?: DataLink;
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

export function defaultGameSystemData(): GameSystemData {
  return {
    core: {
      checks: {
        document: emptyDocument()
      },
      resources: {
        document: emptyDocument()
      },
      skillChallenges: {
        document: emptyDocument()
      },
      tasks: {
        document: emptyDocument()
      },
      bonusesPenalties: {
        document: emptyDocument()
      },
      advantageDisadvantage: {
        document: emptyDocument()
      },
      tags: {
        document: emptyDocument()
      },
    },
    characters: {
      aspects: {
        document: emptyDocument()
      },
      morality: {
        document: emptyDocument(),
        pairs: {
          order: [],
          items: {}
        }
      },
    },
    adventuring: {},
    equipment: {},
  };
}

export interface DataLinks {
  gameSystem: DataLink[];
};

export type DataLinkType = 'document' | 'section' | 'entity';

export interface DataLink {
  id: string;
  // document/page: dot.notation.path (without the .document)
  // section: title-uuid
  // entity: entity-uuid
  label: string;
  // document/page:
  // section: title's text
  // entity: depending on the entity
  // - MoralityPair: 'first-second'
  type: DataLinkType;
  address: string;
  // document/page: dot.notation.path
  // section: dot.notation.path#title-uuid
  // entity:
  // - ordered entities: dot.notation.path.items#entity-uuid
  // - unordered entities:dot.notation.path#entity-uuid
};
