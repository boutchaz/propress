import { API } from "@/api/instance";
import config from "@/config";
import { parseHydraResponse } from "@/hooks/parseHydraResponse";
import { Kiosk } from "@/types/Kiosk";

export default {
  login: async (username: string, password: string) => {
    const response = await API.post("/login", { username, password });
    return response.data;
  },
  getKiosks: async (pageParam: number) => {
    const response = await API.get<Kiosk[]>(
      `${config.apiBaseUrl}/kiosks?page=${pageParam}`
    );
    return parseHydraResponse(response.data);
  },
  getKiosksSections: async (kioskId: string) => {
    const response = await API.get(
      `${config.apiBaseUrl}/kiosks/${kioskId}/sections`
    );
    return parseHydraResponse(response.data);
  },
  getKioskItems: async (kioskId: string) => {
    const response = await API.get(`/kiosk_sections/${kioskId}/items`);
    return response.data;
  },
};
