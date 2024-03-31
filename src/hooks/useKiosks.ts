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
  data: Kiosk[];
};

const useKiosks = () => {
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
    queryKey: ["kiosks"],
    queryFn: async ({ pageParam = 1 }: { pageParam: unknown }) => {
      const response = await kiosApi.getKiosks(pageParam as number);
      return {
        searchParams: response.searchParams,
        data: response.data as Kiosk[],
      };
    },
    getNextPageParam: (lastPage: any) => {
      if (lastPage.searchParams.next?.page === undefined) {
        return undefined;
      }
      return parseInt(lastPage.searchParams.next?.page, 10);
    },
  });

  return {
    hasNextPage,
    fetchNextPage,
    result: data,
  };
};

export default useKiosks;
