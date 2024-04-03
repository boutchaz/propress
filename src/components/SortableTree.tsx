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
} from "@/lib/tree";
import type {
  FlattenedItem,
  SensorContext,
  TreeItem,
  TreeItems,
} from "@/types/Tree";
import { SortableTreeItem } from "@/components/TreeItem/SortableTreeItem";
import kioskApi from "@/api/kioskApi";

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
        <div style={{ padding: "10px", textAlign: "center" }}>
          <button onClick={() => console.log("Post-pended button")}>
            add section input name +
          </button>
        </div>
        {flattenedItems.map(
          ({ id, children, collapsed, depth, uuid, color }, index) => {
            const displayFirst =
              items.filter((item) => item.children.length > 0).length === 1;
            const lastAtDepth = isLastItemAtDepth(
              flattenedItems,
              index,
              depth,
              id
            );
            return (
              <>
                <SortableTreeItem
                  key={id}
                  id={id}
                  value={id}
                  uuid={uuid}
                  color={color}
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
                {/* {depth === 1 && lastAtDepth && (
                  <div style={{ padding: "10px", textAlign: "center" }}>
                    <button onClick={() => console.log(depth, id)}>add item input name +</button>
                  </div>
                )} */}
              </>
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
  async function handleDragEnd({ active, over, ...rest }: DragEndEvent) {
    resetState();
    if (!projected || !over) return;

    const clonedItems: FlattenedItem[] = JSON.parse(
      JSON.stringify(flattenTree(items))
    );
    const activeIndex = clonedItems.findIndex(({ id }) => id === active.id);
    const overIndex = clonedItems.findIndex(({ id }) => id === over.id);

    if (activeIndex === -1 || overIndex === -1) return;

    const activeTreeItem = clonedItems[activeIndex];
    const overTreeItem = clonedItems[overIndex];
    const parentMap = createParentMap(items); // Ideally, this map is kept updated and not recreated on each drag end
    const overParentId = parentMap.get(over.id);

    // Ensure root items remain at the root
    let newParentId;
    if (activeTreeItem.depth === 0) {
      // If the dragged item is at the root, it either stays at the root,
      // or if attempting to be a child, it should instead move next to the 'over' item at root level.
      newParentId = null; // Root items stay at root
    } else {
      // For non-root items, determine the new parent based on the 'over' item.
      newParentId = overTreeItem.depth === 0 ? null : overTreeItem.parentId;
    }

    // Update the dragged item's properties
    activeTreeItem.parentId = newParentId;
    // Optionally adjust depth if necessary
    activeTreeItem.depth =
      newParentId == null ? 0 : overTreeItem.parentId ? overTreeItem.depth : 1;

    // Perform the array move operation
    const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);
    // Rebuild the tree structure
    const newItems = buildTree(sortedItems);
    const isChildTargetRoot =
      overTreeItem.depth === 0 && activeTreeItem.children.length === 0;
    if (!isChildTargetRoot) {
      setItems(newItems);
    }

    if (activeTreeItem.depth == 0) {
      const demo = newItems
        .map((item: any, index: number) => {
          return {
            position: index,
            id: item.uuid,
            name: item.id,
          };
        })
        .sort((a: any, b: any) => a.position - b.position);
    } else {
      const sectionID = newItems.find(
        (item: any) => item.id === overTreeItem.parentId
      )?.["@id"];
      const demo1 = newItems.find((item: any) => item.id === overParentId);
      const positoin =
        demo1?.children.findIndex(
          (item: any) => item.uuid === activeTreeItem.uuid
        ) ?? 0;
      try {
        console.log(demo1);
        const res = await kioskApi.updateSectionItemPosition(
          activeTreeItem!.uuid,
          sectionID,
          positoin
        );
        console.log(res);
      } catch (error) {
        console.log;
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
