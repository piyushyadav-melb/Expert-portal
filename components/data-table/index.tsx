"use client";
import * as React from "react";
import { flexRender } from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Skeleton from "../tables/skeleton";
import { DataTablePagination } from "./components/data-table-pagination";

interface DataTableProps<TData> {
  isLoading: boolean;
  tableObj: any;
  trans: any;
}
export function DataTable<TData>({
  isLoading,
  tableObj,
  trans
}: DataTableProps<TData>) {
  const headerGroups = tableObj.getHeaderGroups(); 
  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {headerGroups.map((headerGroup: any) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header: any) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={headerGroups[0]?.headers.length} className=" !p-0 w-full">
                  <Skeleton />
                </TableCell>
              </TableRow>
            ) : tableObj.getRowModel().rows?.length ? (
              tableObj.getRowModel().rows.map((row: any) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                >
                  {row.getVisibleCells().map((cell: any) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={headerGroups[0]?.headers.length}
                  className="!text-center"
                >
                  {trans('No results')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination trans={trans} table={tableObj} />
    </>
  );

}
