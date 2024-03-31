import { HydraResponse, SearchParamResponse } from "@/types/Hydra";

export const parseHydraResponse = <T>(response: any): HydraResponse<T> => {
    const pageInfo = {
      total: response['hydra:totalItems'],
    };
    // we know what we get here, so we can safely cast it
    const searchParams = {
      first: Object.fromEntries(
        new URLSearchParams(
          response['hydra:view']?.['hydra:first']?.split('?')[1]
        )
      ) as unknown as SearchParamResponse,
      last: Object.fromEntries(
        new URLSearchParams(response['hydra:view']?.['hydra:last']?.split('?')[1])
      ) as unknown as SearchParamResponse,
      prev: Object.fromEntries(
        new URLSearchParams(
          response['hydra:view']?.['hydra:previous']?.split('?')[1]
        )
      ) as unknown as SearchParamResponse,
      next: Object.fromEntries(
        new URLSearchParams(response['hydra:view']?.['hydra:next']?.split('?')[1])
      ) as unknown as SearchParamResponse,
    };
    const data = response['hydra:member'];
    return { data, pageInfo, searchParams };
  };
  