import { Layout } from "@/components/layout";
import { SortableTree } from "@/components/SortableTree";
import useKiosks from "@/hooks/useKiosks";
import useKioskSections from "@/hooks/useKioskSections";
import { useEffect, useState } from "react";

const KioskSections = ({ kioskId }: { kioskId: string }) => {
  const { result } = useKioskSections(kioskId);
  console.log(result);
  // const { error, isLoading, data } = useKioskSections();
  const [data, _setData] = useState(() => []);
  console.log(result);
  useEffect(() => {
    if (result) {
      _setData((result as any).data);
    }
  }, [result]);

  return (
    data.length > 0 ? (
      <SortableTree collapsible indicator removable defaultItems={data} />
    ) : <div> No sections for this kiosk</div>
  );
};

export default KioskSections;
