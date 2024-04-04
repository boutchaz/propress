import { API } from "@/api/instance";
import config from "@/config";
import { parseHydraResponse } from "@/hooks/parseHydraResponse";
import { Kiosk } from "@/types/Kiosk";
import { Section } from "@/types/Section";

export default {
  login: async (username: string, password: string) => {
    const response = await fetch(
      "https://staging01-app.lekiosquenumerique.fr/api/login",
      {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST",
        },
        body: JSON.stringify({ username, password })
      }
    );
  
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  
    return response.json();
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
  updateSectionItemPosition: async (
    itemID: string,
    sectionID: string,
    position: number
  ) => {
    const response = await API.patch(
      `/kiosk_section_items/${itemID}`,
      { position, section: sectionID },
      {
        headers: {
          "Content-Type": "application/merge-patch+json",
        },
      }
    );
    return response.data;
  },
  getSectionItem: async (itemID: string) => {
    const response = await API.get(`/kiosk_section_items/${itemID}`);
    return response.data;
  },
  getSection: async (sectionID: string) => {
    const response = await API.get(`/kiosk_sections/${sectionID}`);
    return response.data;
  },
  updateSection: async (sectionID: number, data: Section) => {
    const response = await API.patch(`/kiosk_sections/${sectionID}`, data, {
      headers: {
        "Content-Type": "application/merge-patch+json",
      },
    });
    return response.data;
  },
  createSection: async (data: Pick<Section, "icon" | "color" | "position">) => {
    const response = await API.post(`/kiosk_sections`, data);
    return response.data;
  },
  updateSectionItem: async (itemId: string, data: any) => {
    const response = await API.patch(`/kiosk_section_items/${itemId}`, data, {
      headers: {
        "Content-Type": "application/merge-patch+json",
      },
    });
    return response.data;
  },
  createItem: async (data: any) => {
    const response = await API.post(`/kiosk_section_items`, data);
    return response.data;
  },
  getPublications: async (search: string) => {
    const response = await API.get(`/publications`, {
      params: { name: search, page: 1, "order[publisher.name]": "asc" },
    });
    return response.data;
  },
};
