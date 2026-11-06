
"use client";

import * as React from "react";

import {
  useTable,
  createColumnHelper,
  tableFeatures,
  columnFilteringFeature,
  columnVisibilityFeature, // AGREGAR
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_includesString,
  sortFn_alphanumeric,
  sortFn_text,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

import TableCellViewer from "@/components/table-cell-viewer"
import useProducts from "@/hooks/useProducts"

// ======================================================
// 1. CONFIGURACIÓN DE TANSTACK TABLE V9
// ======================================================

const features = tableFeatures({
  columnFilteringFeature,
  columnVisibilityFeature, // AGREGAR
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,

  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),

  filterFns: {
    includesString: filterFn_includesString,
  },

  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    text: sortFn_text,
  },
});

const formatMoney = (value) =>
  Number(value ?? 0).toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatDate = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleString("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

// ======================================================
// 2. CONFIGURACIÓN DE COLUMNAS
// ======================================================

const columnHelper = createColumnHelper();

const sortableHeader = (title) => {
  return ({ column }) => (
    <Button
      variant="ghost"
      className="-ml-3"
      onClick={() =>
        column.toggleSorting(column.getIsSorted() === "asc")
      }
    >
      {title}
      {column.getIsSorted() === "asc"
        ? " ↑"
        : column.getIsSorted() === "desc"
          ? " ↓"
          : " ↕"}
    </Button>
  );
};

const columns = columnHelper.columns([
  // Selección
  columnHelper.display({
    id: "select",

    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected()
            ? true
            : table.getIsSomePageRowsSelected()
              ? "indeterminate"
              : false
        }
        onCheckedChange={(value) =>
          table.toggleAllPageRowsSelected(!!value)
        }
        aria-label="Seleccionar todos"
      />
    ),

    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) =>
          row.toggleSelected(!!value)
        }
        aria-label="Seleccionar producto"
      />
    ),

    enableSorting: false,
  }),

  columnHelper.accessor("code", {
    header: sortableHeader("Código"),
    sortingFn: "alphanumeric",
  }),

  columnHelper.accessor("name", {
    header: sortableHeader("Producto"),
    sortingFn: "text",
    filterFn: "includesString",
    cell: ({ row }) => {
      const datosAdaptados = {
        ...row.original,
        header: row.original.name,
      };

      return <TableCellViewer item={datosAdaptados} />
    },
    enableHiding: false,
  }),

  columnHelper.accessor("cost", {
    header: sortableHeader("Costo"),
    sortingFn: "alphanumeric",
    cell: ({ getValue }) => formatMoney(getValue()),
  }),

  columnHelper.accessor("price", {
    header: sortableHeader("Precio"),
    sortingFn: "alphanumeric",
    cell: ({ getValue }) => formatMoney(getValue()),
  }),

  columnHelper.accessor("id_odoo", {
    header: sortableHeader("ID Odoo"),
    sortingFn: "alphanumeric",
  }),

  columnHelper.accessor("fecha_alta", {
    header: sortableHeader("Alta"),
    sortingFn: "alphanumeric",
    cell: ({ getValue }) => formatDate(getValue()),
  }),
]);

// ======================================================
// 4. COMPONENTE PRINCIPAL
// ======================================================

export default function RegistrarInventario() {
  const { products, status, error } = useProducts();
  const [sorting, setSorting] = React.useState([]);
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [rowSelection, setRowSelection] = React.useState({});
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useTable({
    features,
    data: products,
    columns,
    getRowId: (row) => String(row.id),

    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,

    state: {
      sorting,
      columnFilters,
      rowSelection,
      pagination,
    },
  });

  // ====================================================
  // 5. INTERFAZ
  // ====================================================

  return (
    <div className="w-full p-6 space-y-6">

      {/* ENCABEZADO */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Inventario
        </h1>

        <p className="text-sm text-muted-foreground">
          Consulta y administra los productos registrados.
        </p>
      </div>

      {/* BUSCADOR */}
      <div className="flex items-center gap-3">

        <Input
          placeholder="Buscar producto..."
          value={
            table.getColumn("name")?.getFilterValue() ?? ""
          }
          onChange={(event) =>
            table
              .getColumn("name")
              ?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />

        <Button
          variant="outline"
          onClick={() => {
            table.resetColumnFilters();
            table.resetSorting();
            table.resetRowSelection();
          }}
        >
          Limpiar filtros
        </Button>

      </div>

      {/* TABLA */}
      <div className="overflow-hidden rounded-md border">

        <Table>

          {/* ENCABEZADOS */}
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>

                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <table.FlexRender header={header} />
                    )}
                  </TableHead>
                ))}

              </TableRow>
            ))}
          </TableHeader>

          {/* CONTENIDO */}
          <TableBody>

            {status === "loading" ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Cargando productos...
                </TableCell>
              </TableRow>
            ) : status === "error" ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {error}
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length > 0 ? (

              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={
                    row.getIsSelected() && "selected"
                  }
                >

                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}

                </TableRow>
              ))

            ) : (

              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No se encontraron productos.
                </TableCell>
              </TableRow>

            )}

          </TableBody>

        </Table>

      </div>

      {/* PIE Y PAGINACIÓN */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <p className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length}
          {" "}de{" "}
          {table.getFilteredRowModel().rows.length}
          {" "}producto(s) seleccionados.
        </p>

        <div className="flex items-center gap-2">

          <span className="text-sm text-muted-foreground">
            Página {table.state.pagination.pageIndex + 1}
            {" "}de{" "}
            {table.getPageCount()}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
          </Button>

        </div>

      </div>

    </div>
  );
}
