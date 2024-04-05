import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Announcements,
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverlay,
  DragMoveEvent,
  DragEndEvent,
  DragOverEvent,
  MeasuringStrategy,
  DropAnimation,
  defaultDropAnimation,
  Modifier,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import {
  buildTree,
  flattenTree,
  getProjection,
  getChildCount,
  removeItem,
  removeChildrenOf,
  setProperty,
  createParentMap,
  ensureItemsCollapsed,
  isLastItemAtDepth,
  findSectionId,
} from "@/lib/tree";
import type {
  FlattenedItem,
  SensorContext,
  TreeItem,
  TreeItems,
} from "@/types/Tree";
import { SortableTreeItem } from "@/components/TreeItem/SortableTreeItem";
import kioskApi from "@/api/kioskApi";
import { useDrawerStore } from "@/hooks/useDrawer";
import { Button } from "./ui/button";

// example
// const initialItems: TreeItems = [
//   {
//     id: "Course",
//     children: [
//       {
//         id: "Module",
//         children: [],
//       },
//     ],
//   },
//   {
//     id: "Course 1",
//     children: [
//       {
//         id: "Module 1",
//         children: [],
//       },
//     ],
//   },
//   {
//     id: "Course 2",
//     children: [
//       {
//         id: "Module 2",
//         children: [],
//       },
//     ],
//   },
// ];

const measuring = {
  droppable: {
    strategy: MeasuringStrategy.Always,
  },
};

const dropAnimation: DropAnimation = {
  ...defaultDropAnimation,
};

interface Props {
  collapsible?: boolean;
  defaultItems?: TreeItems;
  indentationWidth?: number;
  indicator?: boolean;
  removable?: boolean;
}

export function SortableTree({
  collapsible,
  defaultItems = [],
  indicator,
  indentationWidth = 20,
  removable,
}: Props) {
  const [items, setItems] = useState<TreeItems>(defaultItems);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [offsetLeft, setOffsetLeft] = useState(0);
  console.log(items);
  const [currentPosition, setCurrentPosition] = useState<{
    parentId: string | null;
    overId: string;
  } | null>(null);

  const flattenedItems = useMemo(() => {
    const flattenedTree: FlattenedItem[] = flattenTree(items);
    const collapsedItems: string[] = flattenedTree.reduce<string[]>(
      (acc: string[], { children, collapsed, id }: FlattenedItem) =>
        collapsed && children.length ? [...acc, id] : acc,
      []
    );

    return removeChildrenOf(
      flattenedTree,
      activeId ? [activeId, ...collapsedItems] : collapsedItems
    );
  }, [activeId, items]);
  const projected =
    activeId && overId
      ? getProjection(
          flattenedItems,
          activeId,
          overId,
          offsetLeft,
          indentationWidth
        )
      : null;
  const sensorContext: SensorContext = useRef({
    items: flattenedItems,
    offset: offsetLeft,
  });
  const sensors = useSensors(
    useSensor(PointerSensor)
    // useSensor(KeyboardSensor, {
    //   coordinateGetter,
    // })
  );

  const sortedIds = useMemo(
    () => flattenedItems.map(({ id }) => id),
    [flattenedItems]
  );
  const activeItem = activeId
    ? flattenedItems.find(({ id }) => id === activeId)
    : null;

  useEffect(() => {
    sensorContext.current = {
      items: flattenedItems,
      offset: offsetLeft,
    };
  }, [flattenedItems, offsetLeft]);

  const announcements: Announcements = {
    onDragStart(id) {
      return `Picked up ${id}.`;
    },
    onDragMove(id, overId) {
      return getMovementAnnouncement("onDragMove", id, overId);
    },
    onDragOver(id, overId) {
      return getMovementAnnouncement("onDragOver", id, overId);
    },
    onDragEnd(id, overId) {
      return getMovementAnnouncement("onDragEnd", id, overId);
    },
    onDragCancel(id) {
      return `Moving was cancelled. ${id} was dropped in its original position.`;
    },
  };
  const { toggle, setItemId } = useDrawerStore();

  const handleInsert = () => {
    setItemId("section_new");
    toggle(); // This assumes toggle is the correct method to use
  };
  return (
    <DndContext
      announcements={announcements}
      sensors={sensors}
      collisionDetection={closestCenter}
      measuring={measuring}
      // onDragStart={handleDragStart}
      // onDragMove={handleDragMove}
      // onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      // onDragCancel={handleDragCancel}
    >
      <SortableContext items={sortedIds} strategy={verticalListSortingStrategy}>
        <div
          className="flex items-center justify-center p-[var(--vertical-padding)] px-2.5  text-gray-80 border-dashed border-2 border-gray-200 rounded-md cursor-pointer hover:border-gray-300"
          style={{ padding: "10px", textAlign: "center" }}
        >
          <Button variant="outline" onClick={() => handleInsert()}>
            add section input name +
          </Button>
        </div>
        {flattenedItems.map(
          ({ id, children, collapsed, depth, uuid, color, name }, index) => {
            const sectionID = findSectionId(flattenedItems, id);

            return (
              <SortableTreeItem
                key={uuid}
                id={id}
                value={id}
                uuid={uuid}
                color={color}
                name={name}
                depth={id === activeId && projected ? projected.depth : depth}
                indentationWidth={indentationWidth}
                indicator={indicator}
                collapsed={Boolean(collapsed && children.length)}
                onCollapse={
                  collapsible && children.length
                    ? () => handleCollapse(id)
                    : undefined
                }
                sectionID={sectionID}
                onRemove={removable ? () => handleRemove(id) : undefined}
              />
            );
          }
        )}

        {createPortal(
          <DragOverlay
            dropAnimation={dropAnimation}
            modifiers={indicator ? [adjustTranslate] : undefined}
          >
            {activeId && activeItem ? (
              <SortableTreeItem
                id={activeId}
                uuid={activeItem.uuid}
                depth={activeItem.depth}
                clone
                childCount={getChildCount(items, activeId) + 1}
                value={activeId}
                indentationWidth={indentationWidth}
              />
            ) : null}
          </DragOverlay>,
          document.body
        )}
      </SortableContext>
    </DndContext>
  );

  function handleDragStart({ active: { id: activeId } }: DragStartEvent) {
    setActiveId(activeId);
    setOverId(activeId);

    const activeItem = flattenedItems.find(({ id }) => id === activeId);

    if (activeItem) {
      setCurrentPosition({
        parentId: activeItem.parentId,
        overId: activeId,
      });
    }

    document.body.style.setProperty("cursor", "grabbing");
  }

  function handleDragMove({ delta }: DragMoveEvent) {
    setOffsetLeft(delta.x);
  }

  function handleDragOver({ over }: DragOverEvent) {
    setOverId(over?.id ?? null);
    if (over) {
      const clonedItems: FlattenedItem[] = JSON.parse(
        JSON.stringify(flattenTree(items))
      );
      const overItemIndex = clonedItems.findIndex(({ id }) => id === over.id);

      // Check if the over item is collapsed, and if so, expand it
      if (overItemIndex !== -1 && clonedItems[overItemIndex].collapsed) {
        // Set the collapsed state of the over item to false
        clonedItems[overItemIndex].collapsed = false;

        // Rebuild the tree with the updated item
        const newItems = buildTree(clonedItems);

        // Update the items state with the expanded item
        setItems(newItems);
      }
    }
  }
  // free logic for drag end
  function handleDragEnd({ active, over }: DragEndEvent) {
    resetState();
    let sortedItems;
    if (projected && over) {
      const { depth, parentId } = projected;
      const clonedItems: FlattenedItem[] = JSON.parse(
        JSON.stringify(flattenTree(items))
      );
      const overIndex = clonedItems.findIndex(({ id }) => id === over.id);
      const activeIndex = clonedItems.findIndex(({ id }) => id === active.id);
      const activeTreeItem = clonedItems[activeIndex];
      const overTreeItem = clonedItems[overIndex];

      clonedItems[activeIndex] = { ...activeTreeItem, depth, parentId };
      sortedItems = arrayMove(clonedItems, activeIndex, overIndex);
      const newItems = buildTree(sortedItems);
      const isSectionDragging = activeTreeItem["@id"].includes("sections");
      const isItemDragging = activeTreeItem["@id"].includes(
        "kiosk_section_items"
      );
      const isOverSection = overTreeItem["@id"].includes("sections");
      const isOverItem = overTreeItem["@id"].includes("kiosk_section_items");
      if (isSectionDragging && isOverSection) {
        //  section dragging should stay at the root level
        console.log("section dragging should stay at the root level");
        clonedItems[activeIndex] = {
          ...activeTreeItem,
          depth: 0,
          parentId: null,
        };

        const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);
        const newItems = buildTree(sortedItems);
        setItems(newItems);
      } else if (isSectionDragging && isOverItem) {
        const overItemParentId = clonedItems[overIndex].parentId;
        const parentIndex = clonedItems.findIndex(
          (item) => item.id === overItemParentId && item.depth === 0
        );
        if (parentIndex != -1) {
          console.log(clonedItems);
          clonedItems[parentIndex] = {
            ...activeTreeItem,
            depth: 0,
            parentId: null,
          };

          // Ensure the section is moved next to the parent section of the item it was dragged over
          if (parentIndex !== -1) {
            sortedItems = arrayMove(clonedItems, activeIndex, parentIndex);
          } else {
            // If no parent found, it implies an error in logic or data
            console.error(
              "Parent section for the item not found at root level."
            );
            return;
          }
          sortedItems = arrayMove(clonedItems, parentIndex + 1, overIndex);
          const newItems = buildTree(sortedItems);
          setItems(newItems);
        }
        console.log("s1");
        return;
      } else if (isItemDragging && isOverSection) {
        //  item dragging should stay at the root level
        console.log("item dragging should stay at the root level");
        clonedItems[activeIndex] = {
          ...activeTreeItem,
          depth: 0,
          parentId: null,
        };

        const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);
        const newItems = buildTree(sortedItems);
        setItems(newItems);
      } else if (isItemDragging && isOverItem) {
        const overItemParentId = clonedItems[overIndex].parentId;
        const parentIndex = clonedItems.findIndex(
          (item) => item.id === overItemParentId && item.depth === 0
        );
        if (parentIndex != -1) {
          console.log(clonedItems);
          clonedItems[parentIndex] = {
            ...activeTreeItem,
            depth: 0,
            parentId: null,
          };

          // Ensure the section is moved next to the parent section of the item it was dragged over
          if (parentIndex !== -1) {
            sortedItems = arrayMove(clonedItems, activeIndex, parentIndex);
          } else {
            // If no parent found, it implies an error in logic or data
            console.error(
              "Parent section for the item not found at root level."
            );
            return;
          }
          sortedItems = arrayMove(clonedItems, parentIndex + 1, overIndex);
          const newItems = buildTree(sortedItems);
          setItems(newItems);
        }
        console.log("s2");
        return;
      }
    }
  }

  function handleDragCancel() {
    resetState();
  }

  function resetState() {
    setOverId(null);
    setActiveId(null);
    setOffsetLeft(0);
    setCurrentPosition(null);

    document.body.style.setProperty("cursor", "");
  }

  function handleRemove(id: string) {
    setItems((items) => removeItem(items, id));
  }

  function handleCollapse(id: string) {
    const collapse = items.map((item) => {
      if (item.id === id) {
        return { ...item, collapsed: !item.collapsed };
      }
      return item;
    });
    console.log(collapse[5].children);
    setItems([...collapse]);
  }

  function getMovementAnnouncement(
    eventName: string,
    activeId: string,
    overId?: string
  ) {
    if (overId && projected) {
      if (eventName !== "onDragEnd") {
        if (
          currentPosition &&
          projected.parentId === currentPosition.parentId &&
          overId === currentPosition.overId
        ) {
          return;
        } else {
          setCurrentPosition({
            parentId: projected.parentId,
            overId,
          });
        }
      }

      const clonedItems: FlattenedItem[] = JSON.parse(
        JSON.stringify(flattenTree(items))
      );
      const overIndex = clonedItems.findIndex(({ id }) => id === overId);
      const activeIndex = clonedItems.findIndex(({ id }) => id === activeId);
      const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);

      const previousItem = sortedItems[overIndex - 1];

      let announcement;
      const movedVerb = eventName === "onDragEnd" ? "dropped" : "moved";
      const nestedVerb = eventName === "onDragEnd" ? "dropped" : "nested";

      if (!previousItem) {
        const nextItem = sortedItems[overIndex + 1];
        announcement = `${activeId} was ${movedVerb} before ${nextItem.id}.`;
      } else {
        if (projected.depth > previousItem.depth) {
          announcement = `${activeId} was ${nestedVerb} under ${previousItem.id}.`;
        } else {
          let previousSibling: FlattenedItem | undefined = previousItem;
          while (previousSibling && projected.depth < previousSibling.depth) {
            const parentId: string | null = previousSibling.parentId;
            previousSibling = sortedItems.find(({ id }) => id === parentId);
          }

          if (previousSibling) {
            announcement = `${activeId} was ${movedVerb} after ${previousSibling.id}.`;
          }
        }
      }

      return announcement;
    }

    return;
  }
}

const adjustTranslate: Modifier = ({ transform }) => {
  return {
    ...transform,
    y: transform.y - 25,
  };
};
