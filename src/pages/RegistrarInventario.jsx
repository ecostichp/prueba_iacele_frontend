
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

// ======================================================
// 2. DATOS DE INVENTARIO
// ======================================================

const datosInventario = [
  {
    id: "1",
    codigo: "PROD-001",
    nombre: "Laptop Lenovo ThinkPad",
    categoria: "Electrónica",
    stock: 15,
    unidad: "Piezas",
    ubicacion: "Almacén A",
    estado: "Disponible",
  },
  {
    id: "2",
    codigo: "PROD-002",
    nombre: "Mouse inalámbrico",
    categoria: "Accesorios",
    stock: 3,
    unidad: "Piezas",
    ubicacion: "Almacén B",
    estado: "Stock bajo",
  },
  {
    id: "3",
    codigo: "PROD-003",
    nombre: "Teclado mecánico",
    categoria: "Accesorios",
    stock: 0,
    unidad: "Piezas",
    ubicacion: "Almacén A",
    estado: "Agotado",
  },
  {
    id: "4",
    codigo: "PROD-004",
    nombre: "Monitor Samsung 27",
    categoria: "Electrónica",
    stock: 20,
    unidad: "Piezas",
    ubicacion: "Almacén C",
    estado: "Disponible",
  },
  {
    id: "5",
    codigo: "PROD-005",
    nombre: "Cable HDMI",
    categoria: "Accesorios",
    stock: 8,
    unidad: "Piezas",
    ubicacion: "Almacén B",
    estado: "Disponible",
  },
];

// ======================================================
// 3. CONFIGURACIÓN DE COLUMNAS
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

  // Código
  columnHelper.accessor("codigo", {
    header: sortableHeader("Código"),
    sortingFn: "alphanumeric",
  }),

  // Nombre
  columnHelper.accessor("nombre", {
    header: sortableHeader("Producto"),
    sortingFn: "text",
  }),

  // Categoría
  columnHelper.accessor("categoria", {
    header: sortableHeader("Categoría"),
    sortingFn: "text",
  }),

  // Existencias
  columnHelper.accessor("stock", {
    header: sortableHeader("Existencias"),
    sortingFn: "alphanumeric",
    cell: ({ row }) => (
      <span className="font-medium">
        {row.original.stock}
      </span>
    ),
  }),

  // Unidad
  columnHelper.accessor("unidad", {
    header: "Unidad",
  }),

  // Ubicación
  columnHelper.accessor("ubicacion", {
    header: "Ubicación",
  }),

  // Estado
  columnHelper.accessor("estado", {
    header: "Estado",

    cell: ({ row }) => {
      const estado = row.original.estado;

      const estilos = {
        "Disponible": "bg-green-100 text-green-700",
        "Stock bajo": "bg-yellow-100 text-yellow-700",
        "Agotado": "bg-red-100 text-red-700",
      };

      return (
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${estilos[estado] || "bg-gray-100 text-gray-700"
            }`}
        >
          {estado}
        </span>
      );
    },
  }),
]);

// ======================================================
// 4. COMPONENTE PRINCIPAL
// ======================================================

export default function RegistrarInventario() {
  const [sorting, setSorting] = React.useState([]);
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [rowSelection, setRowSelection] = React.useState({});

  // Crear tabla
  const table = useTable({
    features,
    data: datosInventario,
    columns,

    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,

    state: {
      sorting,
      columnFilters,
      rowSelection,
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
            table.getColumn("nombre")?.getFilterValue() ?? ""
          }
          onChange={(event) =>
            table
              .getColumn("nombre")
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

            {table.getRowModel().rows.length > 0 ? (

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
