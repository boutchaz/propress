import { Layout } from "@/components/layout";
import useKiosks from "@/hooks/useKiosks";
import { Kiosk } from "@/types/Kiosk";
import { FilePenLine, Trash2 } from "lucide-react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useReducer, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "@tanstack/react-router";

type KioskRow = Pick<Kiosk, "id" | "name" | "color" | "lastUpdate">;
const columnHelper = createColumnHelper<KioskRow>();

const columns = [
  columnHelper.accessor("id", {
    cell: (info) => info.getValue(),
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor("name", {
    cell: (info) => info.getValue(),
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor("color", {
    header: () => "Color ",
    cell: (info) => info.renderValue(),
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor((row) => row.lastUpdate, {
    id: "Last Updat",
    cell: (info) => <i>{info.getValue()}</i>,
    header: () => <span>Last Update</span>,
    footer: (info) => info.column.id,
  }),
];

const Kiosks = () => {
  const { result, hasNextPage, fetchNextPage } = useKiosks();
  const [data, _setData] = useState(() => []);
  const router = useRouter();

  useEffect(() => {
    if (result) {
      const flattenedData = (result as any).pages.flatMap(
        (page: any) => page.data
      );
      _setData(flattenedData);
    }
  }, [result]);
  const loadMore = () => {
    if (hasNextPage) {
      fetchNextPage();
    }
  };
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  return (
    <Layout>
      <div className="container">
        <Table>
          <TableCaption>A list of available kiosks.</TableCaption>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
                <TableHead>Actions</TableHead>
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
                <TableCell className="flex gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      router.navigate({
                        to: `/kiosks/${row.original?.id}`,
                      });
                    }}
                  >
                    {/* {row.original} */}
                    <FilePenLine />
                  </Button>
                  <Button variant="ghost" onClick={() => {}}>
                    <Trash2 />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          {/* <TableFooter>
            {table.getFooterGroups().map((footerGroup) => (
              <TableRow key={footerGroup.id}>
                {footerGroup.headers.map((header) => (
                  <TableCell key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.footer,
                          header.getContext()
                        )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableFooter> */}
        </Table>
        <div className="h-4" />
        <div className="container flex justify-center items-center">
          {hasNextPage && (
            <button onClick={loadMore} className="border p-2">
              load more
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
};
export default Kiosks;
