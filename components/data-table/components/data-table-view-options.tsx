"use client";
import { Table } from "@tanstack/react-table";
import toast from "react-hot-toast";
import { SlidersHorizontal, RefreshCcw } from "lucide-react";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { refresh } from "@/service/datatable.service";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";


interface DataTableViewOptionsProps {
  table: Table<any>;
  optionLabel: any;
  trans: any;
}

export function DataTableViewOptions({
  table,
  optionLabel,
  trans
}: DataTableViewOptionsProps) {

  //Function to handel refresh
  const handelRefresh = async () => {
    try {
      await refresh();
    } catch (error: any) {
      toast.error(error?.message);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="ltr:ml-2 rtl:mr-2  h-8 "
          >
            <SlidersHorizontal className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
            {trans('View')}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[150px]">
          <DropdownMenuLabel>{trans('Toggle columns')}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {table
            .getAllColumns()
            .filter(
              (column) =>
                typeof column.accessorFn !== "undefined" && column.getCanHide()
            )
            .map((column) => {
              return (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  //className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {optionLabel[column.id] ? optionLabel[column.id] : column.id}
                </DropdownMenuCheckboxItem>
              );
            })}
        </DropdownMenuContent>
      </DropdownMenu>
      <Button variant="outline" size="sm" className="ltr:ml-2 rtl:mr-2  h-8" onClick={handelRefresh}>
        <RefreshCcw className="h-4 w-4" />
      </Button>
    </>
  );
}
