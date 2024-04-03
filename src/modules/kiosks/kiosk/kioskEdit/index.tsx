import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useDrawerStore } from "@/hooks/useDrawer";
import { useItemOrSectionData } from "@/hooks/useItemOrSectionData";
import { useMemo } from "react";
import { ItemEdit } from "./ItemEdit";
import { SectionEdit } from "./SectionEdit";

export const KioskEdit = () => {
  // Accessing store state in a unified manner for consistency
  const { isOpen, close, setItemId, itemId } = useDrawerStore();
  const handleClose = () => {
    setItemId(null);
    close();
  };
  const id = useMemo(() => itemId?.split("_")[1], [itemId]);
  const isSection = useMemo(
    () => itemId?.split("_")[0] === "section",
    [itemId]
  );
  const { data, isLoading } = useItemOrSectionData(itemId);
  console.log(data);
  if (isLoading) return <p>Loading...</p>;
  return (
    <Drawer open={isOpen} onClose={handleClose} direction="right" >
      <DrawerContent
        className="h-screen top-0 right-0 left-auto mt-0  rounded-none overflow-auto w-1/2"
        onInteractOutside={handleClose}
        data-vaul-no-drag
      >
        <div className="mx-auto p-5 w-full" data-vaul-no-drag>
          <DrawerHeader data-vaul-no-drag>
            <DrawerTitle>
              Updating {isSection ? `Section ${id} '${data?.name}'` : `Item ${id} '${data?.publication.name}'`}
            </DrawerTitle>
            <DrawerDescription data-vaul-no-drag>
              * This is a description of the item or section
            </DrawerDescription>
          </DrawerHeader>
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <>
              {data &&
                (isSection ? (
                  <SectionEdit section={data} data-vaul-no-drag />
                ) : (
                  <ItemEdit item={data} />
                ))}
            </>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};
