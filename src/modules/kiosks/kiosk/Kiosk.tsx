import { Layout } from "@/components/layout";
import useKioskSections from "@/hooks/useKioskSections";
import { SortableTree } from "@/components/SortableTree";
import { Route } from "@/routes/kiosks.$kiosId";
import { Link } from "@tanstack/react-router";
import { KioskEdit } from "./kioskEdit";
import { useState, useEffect } from "react";

const Kiosk = () => {
  const { kiosId } = Route.useParams();
  const { result, error, isLoading, refetch } = useKioskSections(kiosId);
  const [items, setItems] = useState<any>(null);
  useEffect(() => {
    if (result) {
      setItems((result as any).data);
    }
  }, [result]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  return (
    <Layout>
      <div className="container">
        <div>
          Hello /kiosks/$kiosId! kiosk name kiosk logo
          <Link to="/">Go back</Link>
          <KioskEdit />
          {items && (
            <SortableTree
              collapsible
              indicator
              removable
              defaultItems={items}
            />
          )}
        </div>
      </div>
    </Layout>
  );
};
export default Kiosk;
