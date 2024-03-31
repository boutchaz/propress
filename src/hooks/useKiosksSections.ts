import { useQuery, useQueries, useInfiniteQuery } from "@tanstack/react-query";
import kiosApi from "@/api/kioskApi";

const useKiosksSections = () => {
  const {
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isFetchingNextPage,
    isFetchingPreviousPage,
    ...result
  } = useInfiniteQuery({
    queryKey: ['kiosks-sections'],
    queryFn: ({ pageParam = 1 }) => kiosApi.getKiosksSections(pageParam),
    getNextPageParam: (lastPage, allPages) => {
      console.log({ lastPage, allPages })
      return lastPage.nextPage;
    }, // assuming 'nextPage' is the correct field
    getPreviousPageParam: (firstPage, allPages) => firstPage.prevPage, // assuming 'prevPage' is the correct field
  });
  
  return {
    hasNextPage,
    fetchNextPage,
    result,
  };
};

export default useKiosksSections;
