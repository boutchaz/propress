import { Layout } from "@/components/layout";
import { SortableTree } from "@/components/SortableTree";
import useKiosks from "@/hooks/useKiosks";
import useKioskSections from "@/hooks/useKioskSections";
import { useEffect, useState } from "react";

const KioskSections = ({ kioskId }: { kioskId: string }) => {
  const { result } = useKioskSections(kioskId);
  if (!result) return null;

  return data?.length > 0 ? (
    <SortableTree collapsible indicator removable defaultItems={result?.data} />
  ) : (
    <div> No sections for this kiosk</div>
  );
};

export default KioskSections;
