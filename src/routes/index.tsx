import Home from "@/modules/home/Home";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: async ({ context }) => {
    if (!context.authState?.token) {
      throw redirect({
        to: "/auth/signin",
      });
    }
  },
  component: () => <Home />,
});
