import { useQuery } from "@tanstack/react-query";
import kiosApi from "@/api/kioskApi";
import { HydraResponse } from "@/types/Hydra";

const useKioskSections = (kioskId: string) => {
  const { data, error, isLoading , refetch } = useQuery<HydraResponse<any>, Error>({
    queryKey: ["kiosk-sections", kioskId],
    queryFn: async () => {
      const response = await kiosApi.getKiosksSections(kioskId);
      const updatedSections = await Promise.all(
        response.data
          .map(async (section: any) => {
            const items = await kiosApi.getKioskItems(section.id);
            return {
              id: section.id,
              uuid: section.id,
              "@id": section["@id"],
              name: section.name,
              color: section.color,
              position: section.position,
              children: items["hydra:member"]
                ? (items["hydra:member"] as any)
                    .map((item: any) => {
                      return {
                        id: item.id,
                        uuid: item.id,
                        position: item.position,
                        name: item.publication.name,
                        "@id": item["@id"],
                        children: [],
                      };
                    })
                    .sort((a: any, b: any) => {
                      // Check if either position is null, and sort accordingly
                      if (a.position === null && b.position !== null) return 1; // a should come after b
                      if (a.position !== null && b.position === null) return -1; // a should come before b
                      if (a.position === null && b.position === null) return 0; // keep original order if both are null

                      // If neither position is null, sort by the position values
                      return a.position - b.position;
                    })
                : [],
            };
          })
          .sort((a: any, b: any) => {
            // Check if either position is null, and sort accordingly
            if (a.position === null && b.position !== null) return 1; // a should come after b
            if (a.position !== null && b.position === null) return -1; // a should come before b
            if (a.position === null && b.position === null) return 0; // keep original order if both are null

            // If neither position is null, sort by the position values
            return a.position - b.position;
          })
      );
      return {
        searchParams: response.searchParams,
        data: updatedSections,
      };
    },
    enabled: !!kioskId,
  });
  return {
    result: data,
    error,
    isLoading,
    refetch
  };
};

export default useKioskSections;
