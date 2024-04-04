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
import { SectionEdit } from "./SectionEdit";
import { SectionNew } from "../kioskInsert/sectionNew";
import { ItemNew } from "../kioskInsert/itemNew";
import { ItemEdit } from "./ItemEdit";

export const KioskEdit = ({ refetch }: { refetch: any }) => {
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
  const isNew = useMemo(() => itemId?.split("_")[1] === "new", [itemId]);

  const { data, isLoading, invalidateSection } = useItemOrSectionData(
    isNew ? null : itemId
  );
  return (
    <Drawer open={isOpen} onClose={handleClose} direction="right">
      <DrawerContent
        className="h-screen top-0 right-0 left-auto mt-0  rounded-none overflow-auto w-1/2"
        onInteractOutside={handleClose}
        data-vaul-no-drag
      >
        <div className="mx-auto p-5 w-full" data-vaul-no-drag>
          <DrawerHeader data-vaul-no-drag>
            <DrawerTitle>
              {isNew ? (
                "Create New "
              ) : (
                <>
                  (
                  {isSection
                    ? `Section ${id} '${data?.name}'`
                    : `Item ${id} '${data?.publication.name}'`}
                  )
                </>
              )}
            </DrawerTitle>
            <DrawerDescription data-vaul-no-drag>
              {isSection &&
                (isNew
                  ? "Create a new section for this kiosk"
                  : "Edit this section's details")}
            </DrawerDescription>
          </DrawerHeader>
          {data &&
            (isSection ? (
              <SectionEdit
                section={data}
                refetch={refetch}
                data-vaul-no-drag
              />
            ) : (
              <ItemEdit
                item={data}
                refetch={refetch}
                data-vaul-no-drag
              />
            ))}
          {isNew &&
            (isSection ? (
              <SectionNew refetch={refetch} />
            ) : (
              <ItemNew refetch={refetch} />
            ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
};
