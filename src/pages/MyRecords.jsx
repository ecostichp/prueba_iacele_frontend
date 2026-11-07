"use client";

import * as React from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";

import {
  useTable,
  createColumnHelper,
  tableFeatures,
  columnFilteringFeature,
  columnVisibilityFeature,
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
import { formatCaboDate } from "@/lib/datetime";
import { API_URL } from "@/constants/api";
import { useAuth } from "@/context/auth";
import { useCounts } from "@/context/counts";

function capitalize(value) {
  const text = (value || "").trim();
  if (!text) return "";
  return text.charAt(0).toLocaleUpperCase("es-MX") + text.slice(1);
}

function firstWord(value) {
  const text = (value || "").trim();
  return text ? text.split(/\s+/)[0] : "";
}

const features = tableFeatures({
  columnFilteringFeature,
  columnVisibilityFeature,
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

const formatQty = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number) || number === 0) return "0";
  return Number.isInteger(number)
    ? number.toLocaleString("es-MX")
    : number.toLocaleString("es-MX", { maximumFractionDigits: 2 });
};

const columnHelper = createColumnHelper();

const sortableHeader = (title, align = "left") => {
  return ({ column }) => (
    <div className={align === "right" ? "flex justify-end" : undefined}>
      <Button
        variant="ghost"
        className={align === "right" ? "-mr-3" : "-ml-3"}
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
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

function QuantityBadge({ total }) {
  const { helping } = useCounts();
  const number = Number(total);
  if (!Number.isFinite(number) || number <= 0) return null;
  return <Badge className={helping ? "!bg-helping !text-white" : undefined}>{formatQty(number)}</Badge>;
}

function ProductCell({ product }) {
  const date = formatDate(product.last_count);

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="text-xs font-bold tracking-wide">{product.code}</span>
      <span className="min-w-0 text-left whitespace-normal">{product.name}</span>
      <div className="mt-1 flex items-center gap-2 md:hidden">
        <QuantityBadge total={product.total_qty} />
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

function DateCell({ product }) {
  const date = formatDate(product.last_count);

  return (
    <div className="flex items-center justify-end gap-3">
      <QuantityBadge total={product.total_qty} />
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

function buildColumns(expandedId) {
  return [
  columnHelper.display({
    id: "expander",
    header: () => null,
    cell: ({ row }) => {
      const open = expandedId === row.original.id;
      return open ? (
        <ChevronUpIcon className="size-4 text-muted-foreground" aria-hidden="true" />
      ) : (
        <ChevronDownIcon className="size-4 text-muted-foreground" aria-hidden="true" />
      );
    },
    meta: { className: "w-10 px-2" },
  }),
  columnHelper.accessor("name", {
    header: sortableHeader("Registro"),
    sortingFn: "text",
    filterFn: "includesString",
    cell: ({ row }) => <ProductCell product={row.original} />,
    meta: { className: "whitespace-normal" },
  }),
  columnHelper.accessor("last_count", {
    header: sortableHeader("Último conteo", "right"),
    sortingFn: "alphanumeric",
    cell: ({ row }) => <DateCell product={row.original} />,
    meta: { className: "hidden whitespace-nowrap text-right md:table-cell md:w-64" },
  }),
  ];
}

function CountHistory({ product, employeeId }) {
  const navigate = useNavigate();
  const { helping } = useCounts();
  const [registers, setRegisters] = React.useState([]);
  const [status, setStatus] = React.useState("loading");

  const load = React.useCallback(async () => {
    if (!employeeId) {
      setRegisters([]);
      setStatus("ready");
      return;
    }
    setStatus("loading");
    try {
      const response = await axios.get(
        `${API_URL}inventory/individuals/id/${employeeId}/product/${product.id}`
      );
      const rows = response.data?.[0]?.registers ?? [];
      rows.sort((a, b) => new Date(b.date_create || 0) - new Date(a.date_create || 0));
      setRegisters(rows);
      setStatus("ready");
    } catch {
      setRegisters([]);
      setStatus("error");
    }
  }, [employeeId, product.id]);

  React.useEffect(() => {
    load();
  }, [load]);

  return (
    <div className={`border-l-4 bg-muted/30 px-3 py-3 md:px-4 ${helping ? "border-helping" : "border-primary"}`}>
      <div className="mb-2 flex justify-end">
        <Button
          type="button"
          size="sm"
          className={helping ? "!bg-helping !text-white hover:!bg-helping/80" : undefined}
          onClick={() => navigate(`/inventory_register?producto=${product.id}`)}
        >
          Ingresar/Borrar registros
        </Button>
      </div>
      <div className="overflow-hidden rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-muted/30">
              <TableHead>Cantidad</TableHead>
              <TableHead>Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {status === "loading" ? (
              <TableRow>
                <TableCell colSpan={2} className="h-14 text-center">
                  Cargando conteos...
                </TableCell>
              </TableRow>
            ) : status === "error" ? (
              <TableRow>
                <TableCell colSpan={2} className="h-14 text-center">
                  No se pudieron cargar tus conteos.
                </TableCell>
              </TableRow>
            ) : registers.length > 0 ? (
              registers.map((register) => (
                <TableRow key={register.id}>
                  <TableCell className="font-medium">{formatQty(register.count_qty)}</TableCell>
                  <TableCell>{formatDate(register.date_create) || "—"}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} className="h-14 text-center">
                  Todavía no tienes conteos de este producto.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default function MyRecords() {
  const { user, token } = useAuth();
  const { assignedUserId, helping, assignedName, totals } = useCounts();
  const [rows, setRows] = React.useState([]);
  const [status, setStatus] = React.useState("loading");
  const [error, setError] = React.useState("");
  const [expandedId, setExpandedId] = React.useState(null);
  const [search, setSearch] = React.useState("");
  const [sorting, setSorting] = React.useState([{ id: "last_count", desc: true }]);
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  React.useEffect(() => {
    if (!user) {
      setRows([]);
      setStatus(token ? "loading" : "ready");
      return;
    }
    if (!assignedUserId) {
      setRows([]);
      setStatus("ready");
      return;
    }

    let cancelled = false;
    if (!rows.length) setStatus("loading");
    axios
      .get(`${API_URL}inventory/individuals/id/${assignedUserId}`)
      .then((response) => {
        if (cancelled) return;
        setRows(
          response.data.map((row) => ({
            id: row.id_products,
            code: row.code,
            name: row.name,
            total_qty: row.total_qty,
            last_count: row.last_count,
          }))
        );
        setStatus("ready");
      })
      .catch((requestError) => {
        if (cancelled) return;
        setError(
          requestError.response?.data?.detail || "No se pudieron cargar tus registros."
        );
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [user, token, assignedUserId, totals]);

  const visibleRows = React.useMemo(() => {
    const query = search.trim().toLocaleLowerCase("es-MX");
    if (!query) return rows;
    return rows.filter((row) =>
      String(row.name).toLocaleLowerCase("es-MX").includes(query) ||
      String(row.code).toLocaleLowerCase("es-MX").includes(query)
    );
  }, [rows, search]);

  const columns = React.useMemo(
    () => buildColumns(expandedId),
    [expandedId]
  );

  const latestCount = rows.reduce((latest, row) => {
    if (!row.last_count) return latest;
    if (!latest || String(row.last_count) > String(latest)) return row.last_count;
    return latest;
  }, null);

  const toggleRow = (id) => {
    setExpandedId((current) => (current === id ? null : id));
  };

  const table = useTable({
    features,
    data: visibleRows,
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

  const sessionName = capitalize(user?.username);
  const assignedGivenName = firstWord(assignedName);

  const emptyMessage = !assignedUserId
    ? "Tu cuenta no está ligada a un empleado, así que no tiene registros."
    : search.trim()
      ? "No se encontraron registros."
      : helping
        ? `Todavía no hay conteos de ${assignedName || "esta persona"}.`
        : "Todavía no tienes conteos registrados.";

  return (
    <div className="w-full space-y-4 p-4 sm:space-y-6 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {helping && sessionName && assignedGivenName
            ? `${sessionName}, estos son los registros de ${assignedGivenName}`
            : "Mis registros de inventario"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Tu bitácora. Abre un renglón para ver cada conteo de ese código.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground">Códigos contados</p>
          <p className={`text-3xl font-semibold tabular-nums ${helping ? "text-helping" : "text-primary"}`}>{rows.length}</p>
        </div>
        <div className="rounded-2xl border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground">Último conteo</p>
          <p className="pt-2 text-lg font-medium">{formatDate(latestCount) || "—"}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Buscar en mis registros..."
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPagination((current) => ({ ...current, pageIndex: 0 }));
          }}
          className="w-full sm:max-w-sm"
        />
        <Button
          variant="outline"
          onClick={() => {
            setSearch("");
            setPagination((current) => ({ ...current, pageIndex: 0 }));
            setSorting([{ id: "last_count", desc: true }]);
          }}
        >
          Limpiar filtros
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card">
        <div className="max-md:[&_[data-slot=table-container]]:overflow-x-hidden">
          <Table className="table-fixed">
            <colgroup>
              <col className="w-10" />
              <col />
              <col className="w-0 md:w-64" />
            </colgroup>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className={header.column.columnDef.meta?.className}>
                      {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {status === "loading" ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    Cargando registros...
                  </TableCell>
                </TableRow>
              ) : status === "error" ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    {error}
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <React.Fragment key={row.id}>
                    <TableRow
                      className="cursor-pointer"
                      tabIndex={0}
                      aria-expanded={expandedId === row.original.id}
                      onClick={() => toggleRow(row.original.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          toggleRow(row.original.id);
                        }
                      }}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className={cell.column.columnDef.meta?.className}>
                          <table.FlexRender cell={cell} />
                        </TableCell>
                      ))}
                    </TableRow>
                    {expandedId === row.original.id && (
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={columns.length} className="p-0">
                          <CountHistory
                            product={row.original}
                            employeeId={assignedUserId}
                          />
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
          <span className="text-sm text-muted-foreground">
            Página {table.state.pagination.pageIndex + 1} de {table.getPageCount() || 1}
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
  );
}
