"use client";

import { useState } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import Link from "next/link";
import { useTranslation } from "react-i18next";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Search,
  Filter,
  Columns3,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  AlertCircle,
  Plus,
  LayoutGrid,
  List,
} from "lucide-react";
import { formatAddress } from "@/utils/helper";
import { PROPERTY_TYPES } from "@/constants";
import { PropertyCard } from "../_components/propertyCard";
import { PropertyActions } from "@/components/property/property-actions";
import { Property } from "@/types/property";
import { EmptyListingsState } from "../_components/empty-state";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  error?: Error | null;
}



export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  error = null,
}: DataTableProps<TData, TValue>) {
  const { t } = useTranslation();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("grid");

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, filterValue: string) => {
      const search = filterValue.toLowerCase();
      const property = row.original as Property;
      const broker = property.listedBy || {};
      const addressString = formatAddress(property.address);

      return (
        property.propertyId?.toLowerCase().includes(search) ||
        addressString.toLowerCase().includes(search) ||
        property.propertyCategory?.toLowerCase().includes(search) ||
        property.propertyType?.toLowerCase().includes(search) ||
        broker.firstName?.toLowerCase().includes(search) ||
        broker.lastName?.toLowerCase().includes(search) ||
        broker.mobile?.includes(search) ||
        broker.email?.toLowerCase().includes(search)
      );
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 12,
      },
    },
  });

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    if (value === "all") {
      table.getColumn("listingStatus")?.setFilterValue(undefined);
    } else {
      table.getColumn("listingStatus")?.setFilterValue(value);
    }
  };

  const handlePropertyTypeFilter = (value: string) => {
    setPropertyTypeFilter(value);
    if (value === "all") {
      table.getColumn("propertyType")?.setFilterValue(undefined);
    } else {
      table.getColumn("propertyType")?.setFilterValue(value);
    }
  };

  const filteredRowCount = table.getFilteredRowModel().rows.length;
  const totalCount = data.length;
  const currentPage = table.getState().pagination.pageIndex + 1;
  const pageCount = table.getPageCount();

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Filters & Actions Section */}
      <div className="flex flex-col xl:flex-row gap-3 sm:gap-4 items-start xl:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-1 w-full">
          <div className="relative flex-1 w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("search_properties_placeholder")}
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-10 h-10 text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={propertyTypeFilter}
              onValueChange={handlePropertyTypeFilter}
            >
              <SelectTrigger className="w-[140px] sm:w-[150px] h-10 text-sm">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("label_all_types")}</SelectItem>
                {PROPERTY_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-[140px] sm:w-[150px] h-10 text-sm">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("label_all_status")}</SelectItem>
                <SelectItem value="ACTIVE">{t("label_active")}</SelectItem>
                <SelectItem value="ENQUIRY_ONLY">{t("label_enquiry_only")}</SelectItem>
                <SelectItem value="PENDING_APPROVAL">
                  {t("label_pending_approval")}
                </SelectItem>
                <SelectItem value="REJECTED">{t("label_rejected")}</SelectItem>
                <SelectItem value="DRAFT">{t("label_draft")}</SelectItem>
                <SelectItem value="DELISTED">{t("label_delisted")}</SelectItem>
                <SelectItem value="DELETED">{t("label_deleted") || "Deleted"}</SelectItem>
              </SelectContent>
            </Select>

            {viewMode === "table" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 w-[120px] rounded-[8px] px-3 text-xs"
                  >
                    <Columns3 className="mr-2 h-4 w-4" />
                    {t("label_columns")}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <div className="bg-muted p-0.5 rounded-lg flex items-center h-10">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                className="h-9 w-9 p-0"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
                <span className="sr-only">{t("label_grid_view")}</span>
              </Button>
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                className="h-9 w-9 p-0"
                onClick={() => setViewMode("table")}
              >
                <List className="h-4 w-4" />
                <span className="sr-only">{t("label_table_view")}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="flex flex-row items-center justify-between gap-3 text-xs text-muted-foreground border-b border-border/40 pb-3">
        <p>
          {t("label_showing")}{" "}
          <span className="font-semibold text-foreground">
            {filteredRowCount}
          </span>{" "}
          {t("label_of")} {totalCount} {t("label_properties")}
        </p>
        {viewMode === "grid" && (
          <div className="flex items-center gap-2">
            <span>{t("label_per_page")}:</span>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger className="h-7 w-[65px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent side="top">
                {[12, 24, 36, 48].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* States */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {t("error_load_properties")}
          </AlertDescription>
        </Alert>
      )}

      {/* Content Section */}
      {!isLoading && !error && (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 pt-2">
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => {
                  const property = row.original as Property;
                  return (
                    <PropertyCard
                      key={property._id}
                      property={property}
                      showMapButton={false}
                      actionSlot={<PropertyActions property={property} />}
                    />
                  );
                })
              ) : (
                <div className="col-span-full">
                  <EmptyListingsState />
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-border/60 overflow-hidden text-sm bg-card shadow-sm">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className="bg-muted/30">
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id} className="h-11 font-semibold">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                        className="hover:bg-muted/20 transition-colors"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className="py-3">
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
                        colSpan={columns.length}
                        className="h-32 text-center text-muted-foreground"
                      >
                        {t("empty_no_matching_properties")}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {pageCount > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/40">
              <p className="text-xs text-muted-foreground">
                {t("label_page")} <span className="font-medium text-foreground">{currentPage}</span> {t("label_of")} <span className="font-medium text-foreground">{pageCount}</span>
              </p>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
