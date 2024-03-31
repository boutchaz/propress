import { useQueries } from "@tanstack/react-query";
import kiosApi from "@/api/kioskApi";

const useKioskItems = ({ kiosks }: { kiosks: any[] }) => {
  const queriesInfo =
    kiosks && kiosks.length > 0
      ? kiosks.map((kiosk) => ({
          queryKey: ["kioskItems", kiosk.id],
          queryFn: () => kiosApi.getKioskItems(kiosk.id),
          enabled: true,
        }))
      : [];

  const queryResults = useQueries({
    queries: queriesInfo,
  });
  const error = queryResults.find((result) => result.error)?.error;
  const isLoading = queryResults.some((result) => result.isLoading);
  return {
    data: kiosks?.map((kiosk, index) => {
      const data = queryResults[index].data?.["hydra:member"].map((item: any) => {
        return {
          id: item["@id"],
          name: item.publication.name,
          children: []
        };
      }) || [];
      return {
        id: kiosk["@id"],
        ...kiosk,
        children: data || [],
      };
    }), // This will be an array of each query's data
    error, // The first encountered error (if any)
    isLoading
  };
};

export default useKioskItems;
