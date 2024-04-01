import { useInfiniteQuery } from "@tanstack/react-query";
import kiosApi from "@/api/kioskApi";
import { Kiosk } from "@/types/Kiosk";
import { HydraResponse } from "@/types/Hydra";

type ApiResponse = {
  searchParams: {
    next?: {
      page?: string;
    };
  };
  data: any;
};

const useKiosks = ({
  composed = false,
}: {
  composed?: boolean;
} = {}) => {
  const {
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isFetchingNextPage,
    isFetchingPreviousPage,
    data,
    ...result
  } = useInfiniteQuery<HydraResponse<Kiosk>, Error>({
    queryKey: ["kiosks", composed],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await kiosApi.getKiosks(pageParam);

      // Fix: Properly wait for all the promises to resolve and update the kiosk data
      const updatedKiosks = await Promise.all(
        response.data.map(async (kiosk: any) => {
          const sections = await kiosApi.getKiosksSections(kiosk.id);
          return {
            ...kiosk,
            id: composed ? `${kiosk.id}_${kiosk.name}` : kiosk.id,
            children: sections.data
              ? (sections.data as any).map((section: any) => {
                  return {
                    ...section,
                    id: composed ? `${section.id}_${section.name}` : section.id,
                    children: [],
                  };
                })
              : [],
          };
        })
      );
      // Return the augmented response with the updated kiosks
      return {
        searchParams: response.searchParams,
        data: updatedKiosks, // Use the updatedKiosks with sections added
      };
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.searchParams.next?.page === undefined) {
        return undefined;
      }
      return parseInt(lastPage.searchParams.next.page, 10);
    },
  });

  // Return the necessary parts of the hook's result
  return {
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isFetchingNextPage,
    isFetchingPreviousPage,
    result: data,
  };
};

export default useKiosks;
