import { useQuery } from "@tanstack/react-query";
import kiosApi from "@/api/kioskApi";
type ItemId = string | null;

export const useItemOrSectionData = (itemId: ItemId) => {
  // Split the itemId and check if the prefix is "section"
  const isSection = itemId?.split("_")[0] === "section";
  const queryKey: String[] = isSection ? ["section", itemId] : ["item", itemId];

  const fetchData = async () => {
    if (isSection) {
      // If it's a section, call the section API
      return await kiosApi.getSection(itemId.split("_")[1]);
    } else {
      // Otherwise, call the item API
      return await kiosApi.getSectionItem(itemId.split("_")[1]);
    }
  };

  // Use the useQuery hook from React Query to fetch data
  return useQuery({
    queryKey,
    queryFn: fetchData,
    enabled: !!itemId,
  });
};
