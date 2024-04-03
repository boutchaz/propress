import type { MutableRefObject } from "react";

export interface TreeItem {
  id: string;
  children: TreeItem[];
  collapsed?: boolean;
  uuid?: string;
  value?: string;
  color?: string;
}

export type TreeItems = TreeItem[];

export interface FlattenedItem extends TreeItem {
  parentId: null | string;
  depth: number;
  index: number;
}

export type SensorContext = MutableRefObject<{
  items: FlattenedItem[];
  offset: number;
}>;
