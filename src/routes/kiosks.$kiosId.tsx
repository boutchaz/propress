import Kiosk from "@/modules/kiosks/kiosk/Kiosk";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/kiosks/$kiosId")({
  component: () => <Kiosk />,
});
