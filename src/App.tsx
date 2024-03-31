import { RouterProvider } from "@tanstack/react-router";

import { router } from "./router";
import { useAuth } from "./contexts/AuthContext";

function InnerApp() {
  const { authState, isLoading } = useAuth();
  if (isLoading) {
    return <div>Loading...</div>;
  }
  return <RouterProvider router={router} context={{ authState }} />;
}

const App = () => {
  return <InnerApp />;
};
export default App;
