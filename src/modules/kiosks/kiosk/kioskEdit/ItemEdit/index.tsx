import { SectionItem } from "@/types/Section";

export const ItemEdit = ({ item }: { item: SectionItem }) => {
  return <div>{item.publication.name}</div>;
};
