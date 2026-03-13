export type ElementChangedCommand = {
  type: 'element-changed';
  id: string;
  before: string;
  after: string;
};

export type ElementCreatedCommand = {
  type: 'element-created';
  id: string;
  tag: string;
  afterId: string | null;
  content: string;
};

export type ElementDeletedCommand = {
  type: 'element-deleted';
  id: string;
  tag: string;
  afterId: string | null;
  content: string;
};

export type OrderChangedCommand = {
  type: 'order-changed';
  before: string[];
  after: string[];
};

export type EditorCommand =
  | ElementChangedCommand
  | ElementCreatedCommand
  | ElementDeletedCommand
  | OrderChangedCommand;
