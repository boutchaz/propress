import axios, { AxiosRequestConfig, AxiosError } from "axios";
import localForage from "localforage";
import config from "@/config";
import { AUTH_STATE_KEY, AuthState } from "@/contexts/AuthContext";

declare module "axios" {
  export interface AxiosRequestConfig {
    _retry?: boolean;
  }
}

export const DEFAULT_BASE_URL = config.apiBaseUrl;

export const refreshAuth = async (refreshToken: string) =>
  axios.post(
    `${DEFAULT_BASE_URL}/token/refresh`,
    {
      refresh_token: refreshToken,
    },
    {
      skipAuthRefresh: true,
    } as any
  );

export const API = axios.create();

const onRequest = async (config: AxiosRequestConfig) => {
  const authState = await localForage.getItem<AuthState>(AUTH_STATE_KEY);
  config.baseURL = DEFAULT_BASE_URL;
  if (authState?.token) {
    config.headers!.Authorization = `Bearer ${authState?.token}`;
  }
  return config;
};

const onErrorRequest = (error: AxiosError) => Promise.reject(error);

const onErrorResponse = async (error: AxiosError) => {
  const originalRequest = error.config;
  let refreshTokenError;
  let res;
  // handle unauthenticated requests by trying a refresh
  if (
    error.response &&
    error.response.status === 401 &&
    !originalRequest!._retry
  ) {
    originalRequest!._retry = true;
    const authState = await localForage.getItem<AuthState>(AUTH_STATE_KEY);

    // we need to see how we send the refresh token to the backend
    // if we can't find a refresh token we error early;
    if (!authState?.refreshToken) {
      window.location.href = "/auth/signin";
      return Promise.reject(error);
    }

    // exchange the refresh token for a new jwt and refresh token
    [refreshTokenError, res] = await refreshAuth(authState?.refreshToken)
      .then(async (response) => {
        const { token, refresh_token } = response.data.token;
        // since we are not using the same instance to avoid infinite loop
        // response is not camel-cased
        // const refresh = response.data.refresh_token;
        try {
          // in a success case we store the new tokens received and return the original request for retry
          await localForage.setItem(AUTH_STATE_KEY, {
            token: token,
            refreshToken: refresh_token,
          });

          return [null, await API.request(originalRequest!)];
        } catch (err) {
          // something happened with saving the tokens
          console.error("Could not set the authentication tokens!");
          return [err, originalRequest];
        }
      })
      .catch(async (error) => {
        // if we couldn't refresh we clear the storage and ask user to login again
        try {
          await localForage.removeItem(AUTH_STATE_KEY); // Clear authState from localForage on logout

        } catch (err) {
          console.warn("Tokens could not be deleted!");
        } finally {
          // redirect to auth login
          console.error(error);
          window.location.href = "/auth/signin";
          return [error, originalRequest];
        }
      });

    if (refreshTokenError) {
      return Promise.reject(refreshTokenError);
    }

    // resolve the initial request
    return Promise.resolve(res);
  }

  // other error cases that we do not handle here (404, 403, etc)
  return Promise.reject(error);
};

API.interceptors.request.use(onRequest, onErrorRequest);
API.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    onErrorResponse(error);
  }
);
