import { createFileRoute, redirect } from "@tanstack/react-router";
import SignIn from "@/modules/authentication/SignIn";
import localForage from "localforage";
import { AUTH_STATE_KEY } from "@/contexts/AuthContext";

export const Route = createFileRoute("/auth/signin")({
  beforeLoad: async ({ context }) => {
    const authState = await localForage.getItem(AUTH_STATE_KEY);
    if (context.authState?.token) {
      throw redirect({
        to: "/",
      });
    }
  },
  component: () => <SignIn />,
});
