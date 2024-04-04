import { useQuery } from "@tanstack/react-query";
import kiosApi from "@/api/kioskApi";
import { Route } from "@/routes/kiosks.$kiosId";

export const useKiosk = () => {
  const { kiosId } = Route.useParams();
  return useQuery({
    queryKey: ["kiosk", kiosId],
    queryFn: async () => {
      try {
        const response = await kiosApi.getKiosk(kiosId);
        return response;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
  });
};