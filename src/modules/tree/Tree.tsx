import {
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  arrayMove
} from "@dnd-kit/sortable";
import { Layout } from "@/components/layout";
import useKiosks from "@/hooks/useKiosks";
import { SortableTree } from "@/components/SortableTree";

const Tree = () => {
  // const { hasNextPage, fetchNextPage, data } = useKiosks();
  // console.log("result", data);
  // console.log("hasNextPage", hasNextPage);
  const treeData = [
    {
      id: "1",
      name: "Parent",
      children: [
        {
          id: "2",
          name: "Child",
          children: [],
        },
      ],
    },
  ];
  // const {
  //   data: treeData,
  //   error: treeError,
  //   isLoading,
  // } = useKioskItems({
  //   kiosks: slicedData,
  // });
  // console.log("treeData", treeData);
  // const [items, setItems] = useState<any>(null);

  // useEffect(() => {
  //   if (treeData && JSON.stringify(treeData) !== JSON.stringify(items)) {
  //     setItems(treeData);
  //   }
  // }, [treeData]);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      console.log("active", active);
      console.log("over", over);
      setItems((items: any) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        if (oldIndex !== -1 && newIndex !== -1) {
          // Move parent
          return arrayMove(items, oldIndex, newIndex);
        } else {
          // Move child
          console.log("items", items);
          for (const item of items) {
            const oldChildIndex = item.children.indexOf(active.id);
            const newChildIndex = item.children.indexOf(over.id);
            if (oldChildIndex !== -1 && newChildIndex !== -1) {
              item.children = arrayMove(
                item.children,
                oldChildIndex,
                newChildIndex
              );
              return [...items];
            }
          }
        }
        return items;
      });
    }
  };
  if (!treeData) return null;
  // if (isLoading) return <div>Loading...</div>;

  return (
    treeData.length > 0 && (
      <Layout>
        <SortableTree
          collapsible
          indicator
          removable
          // defaultItems={treeData}
        />
        {/* <ScrollArea className="h-full">
          <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={items.map((item) => item.id)}
                strategy={verticalListSortingStrategy}
              >
                {items.map((item, index) => (
                  <div key={item.id}>
                    <SortableSection id={item.id} name={item.name} />
                    <SortableContext
                      items={item.children}
                      strategy={verticalListSortingStrategy}
                    >
                      {item.children?.map((child: any) => (
                        <SortableItem
                          key={child.id}
                          id={child.id}
                          name={child.name}
                          style={{ marginLeft: "20px!important" }}
                          className="ml-4"
                        />
                      ))}
                    </SortableContext>
                  </div>
                ))}
              </SortableContext>
            </DndContext>
          </div>
        </ScrollArea> */}
      </Layout>
    )
  );
};

export default Tree;
