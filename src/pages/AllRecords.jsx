import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";

import { useTable, createColumnHelper, tableFeatures, columnVisibilityFeature, rowPaginationFeature, rowSortingFeature, createPaginatedRowModel, createSortedRowModel, sortFn_alphanumeric, sortFn_text } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { API_URL } from "@/constants/api";
import { useAuth } from "@/context/auth";
import { canSeeManagerMenu } from "@/lib/access";
import { formatCaboDate } from "@/lib/datetime";

const features = tableFeatures({
  columnVisibilityFeature,
  rowPaginationFeature,
  rowSortingFeature,
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    text: sortFn_text,
  },
});

const columnHelper = createColumnHelper();

const typeLabel = {
  individual: "Individual",
  equipo: "Diferencias",
  diferencias: "Diferencias",
  doble: "Doble",
  gerente: "Gerente",
};

function formatQty(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  return Number.isInteger(number)
    ? number.toLocaleString("es-MX")
    : number.toLocaleString("es-MX", { maximumFractionDigits: 2 });
}

const columns = [
  columnHelper.accessor("date_create", {
    header: "Fecha",
    sortingFn: "alphanumeric",
    cell: ({ getValue }) => formatCaboDate(getValue()) || "—",
    meta: { className: "whitespace-nowrap text-muted-foreground" },
  }),
  columnHelper.accessor("code", {
    header: "Código",
    sortingFn: "alphanumeric",
    meta: { className: "whitespace-nowrap font-medium" },
  }),
  columnHelper.accessor("name", {
    header: "Producto",
    sortingFn: "text",
    meta: { className: "whitespace-normal" },
  }),
  columnHelper.accessor("count_qty", {
    header: "Cantidad",
    sortingFn: "alphanumeric",
    cell: ({ getValue }) => formatQty(getValue()),
    meta: { className: "text-right tabular-nums" },
  }),
  columnHelper.accessor("count_type", {
    header: "Tipo",
    sortingFn: "text",
    cell: ({ getValue }) => typeLabel[getValue()] || getValue() || "—",
  }),
  columnHelper.accessor("counting_name", {
    header: "Contó",
    sortingFn: "text",
  }),
];

function MobileRegister({ register }) {
  return (
    <article className="space-y-1 px-4 py-3">
      <p className="text-xs text-muted-foreground">{formatCaboDate(register.date_create) || "—"}</p>
      <p className="font-medium">{register.code}</p>
      <p>{register.name}</p>
      <dl className="grid grid-cols-[5.5rem_1fr] gap-x-2 gap-y-0.5 pt-1 text-xs">
        <dt className="text-muted-foreground">Cantidad</dt>
        <dd className="tabular-nums">{formatQty(register.count_qty)}</dd>
        <dt className="text-muted-foreground">Tipo</dt>
        <dd>{typeLabel[register.count_type] || register.count_type || "—"}</dd>
        <dt className="text-muted-foreground">Contó</dt>
        <dd>{register.counting_name}</dd>
      </dl>
    </article>
  );
}

export default function AllRecords() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [access, setAccess] = useState("loading");
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("loading");
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState([{ id: "date_create", desc: true }]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });

  useEffect(() => {
    if (!user) return undefined;

    const employeeId = Number(user.empleado_id) || null;
    if (!employeeId) {
      setAccess("denied");
      return undefined;
    }

    let cancelled = false;
    axios
      .get(`${API_URL}employees/id/${employeeId}`)
      .then((response) => {
        if (cancelled) return;
        setAccess(canSeeManagerMenu(response.data?.job_title) ? "allowed" : "denied");
      })
      .catch(() => {
        if (!cancelled) setAccess("denied");
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (access === "denied") navigate("/", { replace: true });
  }, [access, navigate]);

  useEffect(() => {
    if (access !== "allowed") return undefined;

    const controller = new AbortController();
    Promise.all([
      axios.get(`${API_URL}inventory/registers`, { signal: controller.signal }),
      axios.get(`${API_URL}products/`, { signal: controller.signal }),
      axios.get(`${API_URL}employees/`, { signal: controller.signal }),
    ])
      .then(([registersResponse, productsResponse, employeesResponse]) => {
        const products = new Map(
          productsResponse.data.map((product) => [product.id, product])
        );
        const employees = new Map(
          employeesResponse.data.map((employee) => [employee.id, employee.name])
        );
        setRows(
          registersResponse.data.map((register) => {
            const product = products.get(register.id_products);
            return {
              id: register.id,
              date_create: register.date_create,
              code: product?.code || String(register.id_products),
              name: product?.name || "Producto sin nombre",
              count_qty: register.count_qty,
              count_type: register.count_type,
              counting_name: employees.get(register.counting_user_id) || "—",
            };
          })
        );
        setStatus("ready");
      })
      .catch((error) => {
        if (error?.code === "ERR_CANCELED" || error?.name === "CanceledError") return;
        setStatus("error");
      });

    return () => controller.abort();
  }, [access]);

  const visibleRows = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("es-MX");
    if (!query) return rows;
    return rows.filter((row) =>
      [row.code, row.name, row.counting_name, typeLabel[row.count_type] || row.count_type]
        .join(" ")
        .toLocaleLowerCase("es-MX")
        .includes(query)
    );
  }, [rows, search]);

  const table = useTable({
    features,
    data: visibleRows,
    columns,
    getRowId: (row) => String(row.id),
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    state: { sorting, pagination },
  });

  if (access !== "allowed") return null;

  return (
    <div className="w-full space-y-4 p-4 sm:space-y-6 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Todos los registros</h1>
        <p className="text-sm text-muted-foreground">
          {status === "ready"
            ? `${rows.length.toLocaleString("es-MX")} registros de inventario.`
            : "Los conteos de inventario."}
        </p>
      </div>

      <Input
        placeholder="Buscar código, producto o persona..."
        value={search}
        onChange={(event) => {
          setSearch(event.target.value);
          setPagination((current) => ({ ...current, pageIndex: 0 }));
        }}
        className="w-full sm:max-w-sm"
      />

      <div className="overflow-hidden rounded-2xl border">
        <div className="divide-y md:hidden">
          {status === "loading" ? (
            <p className="px-4 py-10 text-center text-sm">Cargando registros...</p>
          ) : status === "error" ? (
            <p className="px-4 py-10 text-center text-sm">No se pudieron cargar los registros.</p>
          ) : table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <MobileRegister key={row.id} register={row.original} />
            ))
          ) : (
            <p className="px-4 py-10 text-center text-sm">No se encontraron registros.</p>
          )}
        </div>
        <Table className="hidden md:table">
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
                  No se pudieron cargar los registros.
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
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No se encontraron registros.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
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
