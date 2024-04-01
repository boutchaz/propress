import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/kiosks")({
  component: Posts,
});

function Posts() {
  return <Outlet />;
}