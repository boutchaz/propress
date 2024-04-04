import { Layout } from "@/components/layout";
import useKioskSections from "@/hooks/useKioskSections";
import { SortableTree } from "@/components/SortableTree";
import { Route } from "@/routes/kiosks.$kiosId";
import { Link } from "@tanstack/react-router";
import { KioskEdit } from "./kioskEdit";
import { useState, useEffect } from "react";
import { useKiosk } from "@/hooks/useKiosk";

const Kiosk = () => {
  const { kiosId } = Route.useParams();
  const { result, error, isLoading, refetch } = useKioskSections(kiosId);
  const { data: kiosk } = useKiosk();
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
          <Link
            to="/"
            className="text-black dark:text-white bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-150 ease-in-out border border-black dark:border-white rounded px-4 py-2"
          >
            Go back
          </Link>
          <div className="flow-root m-8">
            <dl className="-my-3 divide-y divide-gray-100 text-sm">
              <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
                <dt className="font-medium text-gray-900">Kiosk</dt>
                <dd className="text-gray-700 sm:col-span-2">{kiosk.name}</dd>
              </div>

              <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
                <dt className="font-medium text-gray-900">Domain</dt>
                <dd className="text-gray-700 sm:col-span-2">
                  <a href={kiosk.url} target="_blank" rel="noopener noreferrer">
                    {kiosk.url}
                  </a>
                </dd>
              </div>
            </dl>
          </div>
          <KioskEdit refetch={refetch} />
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
