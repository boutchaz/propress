import { Layout } from "@/components/layout";
import useKioskSections from "@/hooks/useKioskSections";
import { SortableTree } from "@/components/SortableTree";
import { Route } from "@/routes/kiosks.$kiosId";
import { Link } from "@tanstack/react-router";
import { KioskEdit } from "./kioskEdit";

const Kiosk = () => {
  const { kiosId } = Route.useParams();
  const { result, error, isLoading } = useKioskSections(kiosId);
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  return (
    <Layout>
      <div className="container">
        <div>
          Hello /kiosks/$kiosId! kiosk name kiosk logo
          <Link to="/">Go back</Link>
          <KioskEdit />
          {result && (
            <SortableTree
              collapsible
              indicator
              removable
              defaultItems={(result as any).data}
            />
          )}
        </div>
      </div>
    </Layout>
  );
};
export default Kiosk;
