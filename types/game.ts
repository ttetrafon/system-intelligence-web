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
      pairs: {
        id: string;
        first: string;
        second: string;
      }[];
    };
  };
  adventuring: object;
  equipment: object;
};

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
      pairs: []
    },
  },
  adventuring: {},
  equipment: {},
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
