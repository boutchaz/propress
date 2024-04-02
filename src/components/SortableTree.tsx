import React, { useEffect, useMemo, useRef, useState } from "react";
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
} from "@/lib/tree";
import type { FlattenedItem, SensorContext, TreeItems } from "@/types/Tree";
import { sortableTreeKeyboardCoordinates } from "@/lib/keyboardcoordinates";
import { SortableTreeItem } from "@/components/TreeItem/SortableTreeItem";

const initialItems: TreeItems = [
  {
    id: "Course",
    children: [
      {
        id: "Module",
        children: [],
      },
    ],
  },
  {
    id: "Course 1",
    children: [
      {
        id: "Module 1",
        children: [],
      },
    ],
  },
  {
    id: "Course 2",
    children: [
      {
        id: "Module 2",
        children: [],
      },
    ],
  },
];

const measuring = {
  droppable: {
    strategy: MeasuringStrategy.Always,
  },
};

const dropAnimation: DropAnimation = {
  ...defaultDropAnimation,
  dragSourceOpacity: 0.5,
};

interface Props {
  collapsible?: boolean;
  defaultItems?: TreeItems;
  indentationWidth?: number;
  indicator?: boolean;
  removable?: boolean;
}
const ensureItemsCollapsed = (items) => {
  return items.map((item) => ({
    ...item,
    collapsed: item.collapsed ?? true, // Set collapsed to true if not explicitly defined
    children: item.children ? ensureItemsCollapsed(item.children) : [], // Recursively ensure children are also collapsed
  }));
};
export function SortableTree({
  collapsible,
  defaultItems = initialItems,
  indicator,
  indentationWidth = 20,
  removable,
}: Props) {
  const [items, setItems] = useState(() => ensureItemsCollapsed(defaultItems));
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [offsetLeft, setOffsetLeft] = useState(0);
  const [currentPosition, setCurrentPosition] = useState<{
    parentId: string | null;
    overId: string;
  } | null>(null);

  const flattenedItems = useMemo(() => {
    const flattenedTree = flattenTree(items);
    const collapsedItems = flattenedTree.reduce<string[]>(
      (acc, { children, collapsed, id }) =>
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

  return (
    <DndContext
      announcements={announcements}
      sensors={sensors}
      collisionDetection={closestCenter}
      measuring={measuring}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={sortedIds} strategy={verticalListSortingStrategy}>
        {flattenedItems.map(({ id, children, collapsed, depth, uuid }) => (
          <SortableTreeItem
            key={id}
            id={id}
            value={id}
            uuid={uuid}
            depth={id === activeId && projected ? projected.depth : depth}
            indentationWidth={indentationWidth}
            indicator={indicator}
            collapsed={Boolean(collapsed && children.length)}
            onCollapse={
              collapsible && children.length
                ? () => handleCollapse(id)
                : undefined
            }
            onRemove={removable ? () => handleRemove(id) : undefined}
          />
        ))}
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

      const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);
      const newItems = buildTree(sortedItems);
      if (
        (activeTreeItem.depth === projected.depth &&
          activeTreeItem.parentId === projected.parentId) ||
        // allow child to be dropped in adjacent parent
        (activeTreeItem.depth === 1 &&
          projected.parentId &&
          projected.depth === 1 &&
          overTreeItem.depth === 0)
      ) {
        setItems(newItems);
        const newParentChildren = newItems.find(item => item.id === parentId)?.children || [];
        const newPositionInParent = newParentChildren.findIndex(item => item.id === activeTreeItem.id);

        console.log(`New position of '${activeTreeItem.id}' within its parent: ${newPositionInParent}`);
      }
    }
  }
  // limit for adjecents only
  // function handleDragEnd({ active, over }: DragEndEvent) {
  //   resetState();

  //   if (!over || !projected) {
  //     // If there's no target position or projection data, exit early
  //     return;
  //   }

  //   const clonedItems: FlattenedItem[] = JSON.parse(
  //     JSON.stringify(flattenTree(items))
  //   );
  //   const overIndex = clonedItems.findIndex(({ id }) => id === over.id);
  //   const activeIndex = clonedItems.findIndex(({ id }) => id === active.id);

  //   if (overIndex === -1 || activeIndex === -1) {
  //     // If either the active or over items aren't found, exit early
  //     return;
  //   }

  //   const activeTreeItem = clonedItems[activeIndex];
  //   const overTreeItem = clonedItems[overIndex];

  //   // Ensure active and over items are at the same depth and have the same parentId
  //   console.log(activeTreeItem,projected)
  //   console.log((activeTreeItem.depth === overTreeItem.depth &&
  //     activeTreeItem.parentId === overTreeItem.parentId) ||
  //   // allow child to be dropped in adjacent parent
  //   (activeTreeItem.depth === 1 &&
  //     !!projected.parentId))
  //   if (
  //     (activeTreeItem.depth === overTreeItem.depth &&
  //       activeTreeItem.parentId === overTreeItem.parentId) ||
  //     // allow child to be dropped in adjacent parent
  //     (activeTreeItem.depth === 1 &&
  //       projected.parentId)
  //   ) {
  //     // Update the active item's position to the over item's position
  //     const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);
  //     // Rebuild the tree structure with the newly sorted items
  //     const newItems = buildTree(sortedItems);
  //     setItems(newItems);
  //     if (activeTreeItem.depth == 0) {
  //       const demo = newItems
  //         .map((item: any, index: number) => {
  //           return {
  //             position: index,
  //             id: item.uuid,
  //             name: item.id,
  //           };
  //         })
  //         .sort((a: any, b: any) => a.position - b.position);
  //       console.log(demo);
  //     }
  //     console.log(newItems);
  //     // Update the state with the new items array
  //     setItems(newItems);
  //   } else {
  //     // Log or handle the case where the drag-and-drop operation is not allowed
  //     console.log(
  //       "Drag and drop operation is not allowed. Items must be on the same level and under the same parent."
  //     );
  //   }
  // }

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
    setItems((items) =>
      setProperty(items, id, "collapsed", (value) => {
        return !value;
      })
    );
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
