import { Layout } from "@/components/layout";
import { SortableTree } from "@/components/SortableTree";
import useKiosks from "@/hooks/useKiosks";
import { useEffect, useState } from "react";

const Tree = () => {
  const { result } = useKiosks({
    composed: true,
  });
  // const { error, isLoading, data } = useKioskSections();
  const [data, _setData] = useState(() => []);
  useEffect(() => {
    if (result) {
      const flattenedData = (result as any).pages.flatMap(
        (page: any) => page.data
      );
      _setData((result as any).pages[0].data);
    }
  }, [result]);

  return (
    data.length > 0 && (
      <Layout>
        <SortableTree collapsible indicator removable defaultItems={data} />
      </Layout>
    )
  );
};

export default Tree;
