
"use client";

import * as React from "react";
import { useSearchParams } from "react-router";

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

import CountDrawer from "@/components/CountDrawer"
import { formatCaboDate } from "@/lib/datetime"
import { useProducts } from "@/context/products"
import { useCounts } from "@/context/counts"

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

const formatDate = formatCaboDate;

// ======================================================
// 2. CONFIGURACIÓN DE COLUMNAS
// ======================================================

const columnHelper = createColumnHelper();

const sortableHeader = (title, align = "left") => {
  return ({ column }) => (
    <div className={align === "right" ? "flex justify-end" : undefined}>
    <Button
      variant="ghost"
      className={align === "right" ? "-mr-3" : "-ml-3"}
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
    </div>
  );
};

const formatQty = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number) || number === 0) return "0";
  return Number.isInteger(number)
    ? number.toLocaleString("es-MX")
    : number.toLocaleString("es-MX", { maximumFractionDigits: 2 });
};

function QuantityBadge({ productId }) {
  const { totals } = useCounts();
  const total = Number(totals[productId] ?? 0);

  if (!Number.isFinite(total) || total <= 0) return null;

  return (
    <Badge>
      {formatQty(total)}
    </Badge>
  );
}

function ProductCell({ product }) {
  const { lastCounts, totals } = useCounts();
  const date = formatDate(lastCounts[product.id]);
  const counted = Number(totals[product.id] ?? 0) > 0;

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <div className="flex min-w-0 items-center gap-3">
        <span className="min-w-0 flex-1 text-left whitespace-normal">{product.name}</span>
        {counted && (
          <span className="shrink-0 md:hidden">
            <QuantityBadge productId={product.id} />
          </span>
        )}
      </div>
      <div className="md:hidden">
        {date ? (
          <span className="text-xs text-muted-foreground">{date}</span>
        ) : (
          <span className="text-[10px] leading-tight text-muted-foreground/50">
            No hay conteos registrados
          </span>
        )}
      </div>
    </div>
  );
}

function DateCell({ productId, value }) {
  const date = formatDate(value);

  return (
    <div className="flex items-center justify-end gap-3">
      <QuantityBadge productId={productId} />
      {date ? (
        <span>{date}</span>
      ) : (
        <span className="text-[10px] font-normal leading-tight text-muted-foreground/50">
          No hay conteos registrados
        </span>
      )}
    </div>
  );
}

function createColumns(lastCounts) {
  return columnHelper.columns([
    columnHelper.accessor("code", {
      header: sortableHeader("Código"),
      sortingFn: "alphanumeric",
      cell: ({ getValue }) => <span className="font-bold">{getValue()}</span>,
      meta: { className: "w-[5.5rem] whitespace-normal px-2 md:w-28 md:px-3" },
    }),

    columnHelper.accessor("name", {
      header: sortableHeader("Producto"),
      sortingFn: "text",
      filterFn: "includesString",
      cell: ({ row }) => <ProductCell product={row.original} />,
      enableHiding: false,
      meta: { className: "whitespace-normal" },
    }),

    columnHelper.accessor((row) => lastCounts[row.id] || "", {
      id: "last_count",
      header: sortableHeader("Fecha", "right"),
      sortingFn: "alphanumeric",
      cell: ({ row, getValue }) => (
        <DateCell productId={row.original.id} value={getValue()} />
      ),
      meta: { className: "hidden w-64 whitespace-nowrap text-right md:table-cell" },
    }),
  ]);
}

// ======================================================
// 4. COMPONENTE PRINCIPAL
// ======================================================

export default function RegisterInventory() {
  const { products, status, error } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedProductId = searchParams.get("producto");
  const { totals, lastCounts } = useCounts();
  const [onlyCounted, setOnlyCounted] = React.useState(false);
  const [selected, setSelected] = React.useState(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [sorting, setSorting] = React.useState([]);
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  React.useEffect(() => {
    if (!requestedProductId || status !== "ready") return;
    const product = products.find((item) => String(item.id) === requestedProductId);
    if (!product) return;
    setSelected(product);
    setDrawerOpen(true);
    setSearchParams({}, { replace: true });
  }, [requestedProductId, products, status, setSearchParams]);

  const countedProducts = React.useMemo(
    () => products.filter((product) => Number(totals[product.id] ?? 0) > 0),
    [products, totals]
  );

  const columns = React.useMemo(
    () => createColumns(lastCounts),
    [lastCounts]
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
          Consulta y administra los conteos registrados.
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
      <div className="max-md:[&_[data-slot=table-container]]:overflow-x-hidden">

        <Table className="table-fixed">

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
                <TableRow
                  key={row.id}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelected(row.original);
                    setDrawerOpen(true);
                  }}
                >

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
        {selected && (
          <CountDrawer
            item={{ ...selected, header: selected.name }}
            open={drawerOpen}
            onOpenChange={setDrawerOpen}
          />
        )}
        <div className="flex justify-end border-t bg-muted/40 px-3 py-2">
          <Button
            size="sm"
            variant={onlyCounted ? "default" : "outline"}
            aria-pressed={onlyCounted}
            onClick={showOnlyCounted}
          >
            códigos contados
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
