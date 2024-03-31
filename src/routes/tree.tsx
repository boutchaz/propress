import Tree from "@/modules/tree/Tree";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/tree")({
  beforeLoad: async ({ context }) => {
    if (!context.authState.token) {
      throw redirect({
        to: "/auth/signin",
      });
    }
  },
  component: () => <Tree />,
});
