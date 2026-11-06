
"use client";

import * as React from "react";

import {
  useTable,
  createColumnHelper,
  tableFeatures,
  columnFilteringFeature,
  columnVisibilityFeature, // AGREGAR
  rowPaginationFeature,
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
import { Badge } from "@/components/ui/badge";

import TableCellViewer from "@/components/table-cell-viewer"
import useProducts from "@/hooks/useProducts"
import { MyCountsProvider, useMyCounts } from "@/context/MyCountsContext"

// ======================================================
// 1. CONFIGURACIÓN DE TANSTACK TABLE V9
// ======================================================

const features = tableFeatures({
  columnFilteringFeature,
  columnVisibilityFeature, // AGREGAR
  rowPaginationFeature,
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

const formatQty = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number) || number === 0) return "0";
  return Number.isInteger(number)
    ? number.toLocaleString("es-MX")
    : number.toLocaleString("es-MX", { maximumFractionDigits: 2 });
};

function CountedCell({ productId }) {
  const { totals } = useMyCounts();
  const total = Number(totals[productId] ?? 0);

  if (!Number.isFinite(total) || total <= 0) return null;

  return (
    <Badge>
      {formatQty(total)}
    </Badge>
  );
}

const columns = columnHelper.columns([
  columnHelper.accessor("code", {
    header: sortableHeader("Código"),
    sortingFn: "alphanumeric",
  }),

  columnHelper.accessor("id_odoo", {
    header: sortableHeader("ID Odoo"),
    sortingFn: "alphanumeric",
  }),

  columnHelper.accessor("name", {
    header: sortableHeader("Producto"),
    sortingFn: "text",
    filterFn: "includesString",
    cell: ({ row }) => (
      <TableCellViewer item={{ ...row.original, header: row.original.name }} />
    ),
    enableHiding: false,
  }),

  columnHelper.display({
    id: "contado",
    header: "Contado",
    cell: ({ row }) => <CountedCell productId={row.original.id} />,
  }),

  columnHelper.accessor("fecha_alta", {
    header: sortableHeader("Fecha de creación"),
    sortingFn: "alphanumeric",
    cell: ({ getValue }) => formatDate(getValue()),
  }),
]);

// ======================================================
// 4. COMPONENTE PRINCIPAL
// ======================================================

export default function RegistrarInventario() {
  return (
    <MyCountsProvider>
      <InventarioTable />
    </MyCountsProvider>
  );
}

function InventarioTable() {
  const { products, status, error } = useProducts();
  const { totals } = useMyCounts();
  const [onlyCounted, setOnlyCounted] = React.useState(false);
  const [sorting, setSorting] = React.useState([]);
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const countedProducts = React.useMemo(
    () => products.filter((product) => Number(totals[product.id] ?? 0) > 0),
    [products, totals]
  );

  const table = useTable({
    features,
    data: onlyCounted ? countedProducts : products,
    columns,
    getRowId: (row) => String(row.id),

    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,

    state: {
      sorting,
      columnFilters,
      pagination,
    },
  });

  // ====================================================
  // 5. INTERFAZ
  // ====================================================

  const showOnlyCounted = () => {
    setOnlyCounted((current) => !current);
    setPagination((current) => ({ ...current, pageIndex: 0 }));
  };

  return (
    <div className="w-full space-y-4 p-4 sm:space-y-6 sm:p-6">

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
      <div className="flex flex-wrap items-center gap-3">

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
          className="w-full sm:max-w-sm"
        />

        <Button
          variant="outline"
          onClick={() => {
            setOnlyCounted(false);
            setPagination((current) => ({ ...current, pageIndex: 0 }));
            table.resetColumnFilters();
            table.resetSorting();
          }}
        >
          Limpiar filtros
        </Button>

      </div>

      {/* TABLA */}
      <div className="overflow-hidden rounded-md border">
      <div className="overflow-x-auto">

        <Table>

          {/* ENCABEZADOS */}
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>

                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className={header.column.columnDef.meta?.className}>
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
                <TableRow key={row.id}>

                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={cell.column.columnDef.meta?.className}>
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
                  {onlyCounted
                    ? "Todavía no tienes productos contados."
                    : "No se encontraron productos."}
                </TableCell>
              </TableRow>

            )}

          </TableBody>

        </Table>

      </div>
        <div className="flex justify-end border-t bg-muted/40 px-3 py-2">
          <Button
            size="sm"
            variant={onlyCounted ? "default" : "outline"}
            aria-pressed={onlyCounted}
            onClick={showOnlyCounted}
          >
            Contados
            <span className="tabular-nums">{countedProducts.length}</span>
          </Button>
        </div>
      </div>

      {/* PIE Y PAGINACIÓN */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <p className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length}
          {" "}producto(s).
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
