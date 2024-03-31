export interface SearchParamResponse {
  pagination: boolean;
  page: number;
}
export interface HydraResponse<T> {
  data: T;
  pageInfo: {
    total: number;
  };
  searchParams: {
    first: SearchParamResponse;
    last: SearchParamResponse;
    prev?: SearchParamResponse;
    next?: SearchParamResponse;
  };
}
