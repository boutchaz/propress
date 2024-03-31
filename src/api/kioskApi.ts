import { API } from "@/api/instance";
import { AuthState, AUTH_STATE_KEY } from "@/contexts/AuthContext";
import localForage from "localforage";
import config from "@/config";
import { parseHydraResponse } from "@/hooks/parseHydraResponse";
import { Kiosk } from "@/types/Kiosk";

export default {
  login: async (username: string, password: string) => {
    const response = await API.post("/login", { username, password });
    return response.data;
  },
  getKiosks: async (pageParam: number) => {
    const authState = await localForage.getItem<AuthState>(AUTH_STATE_KEY);
    const response = await API.get<Kiosk[]>(
      `${config.apiBaseUrl}/kiosks?page=${pageParam}`,
      {
        headers: {
          Authorization: `Bearer ${authState?.token}`,
        },
      }
    );
    return parseHydraResponse(response.data);
  },
  getKiosksSections: async (pageParam: number) => {
    const response = await fetch(
      `${config.apiBaseUrl}/kiosk/sections?pagination=true&page${pageParam}`
    );
    const data = await response.json();
    return parseHydraResponse(data);
  },
  getKioskItems: async (kioskId: string) => {
    const authState = await localForage.getItem<AuthState>(AUTH_STATE_KEY);
    const response = await API.get(`/kiosk_sections/${kioskId}/items`, {
      headers: {
        Authorization: `Bearer ${authState?.token}`,
      },
    });
    return response.data;
  },
};
