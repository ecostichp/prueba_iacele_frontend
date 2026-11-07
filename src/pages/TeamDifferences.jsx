"use client";

import * as React from "react";
import axios from "axios";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";

import CountDrawer from "@/components/CountDrawer";

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
import { useCounts } from "@/context/counts";

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

function formatQty(value) {
  if (value == null || value === "") return "—";
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  return Number.isInteger(number)
    ? number.toLocaleString("es-MX")
    : number.toLocaleString("es-MX", { maximumFractionDigits: 2 });
}

function isMatch(value) {
  return value === true || value === 1 || value === "true";
}

function firstName(name) {
  const text = (name || "").trim();
  return text ? text.split(/\s+/)[0] : "";
}

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

function hasTeamCount(product) {
  return product?.total_qty_equipo != null && product.total_qty_equipo !== "";
}

function PersonQty({ name, total }) {
  return (
    <span className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">{name}</span>
      <span className="tabular-nums font-medium">{formatQty(total)}</span>
    </span>
  );
}

function TeamQty({ total }) {
  if (!hasTeamCount({ total_qty_equipo: total })) return null;
  return (
    <span className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">Equipo</span>
      <Badge data-tone="difference">{formatQty(total)}</Badge>
    </span>
  );
}

function ProductCell({ product, names }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="text-xs font-bold tracking-wide">{product.code}</span>
      <span className="min-w-0 text-left whitespace-normal">{product.name}</span>
      <div className="mt-1 flex flex-col gap-1 md:hidden">
        <PersonQty name={names.a} total={product.total_qty_a} />
        <PersonQty name={names.b} total={product.total_qty_b} />
        <TeamQty total={product.total_qty_equipo} />
      </div>
    </div>
  );
}

function AmountsCell({ product, names }) {
  return (
    <div className="flex items-center justify-end gap-4">
      <PersonQty name={names.a} total={product.total_qty_a} />
      <PersonQty name={names.b} total={product.total_qty_b} />
      <TeamQty total={product.total_qty_equipo} />
    </div>
  );
}

function createColumns(names, expandedId) {
  return columnHelper.columns([
    columnHelper.display({
      id: "expander",
      header: () => null,
      cell: ({ row }) => (
        expandedId === row.original.id_products
          ? <ChevronUpIcon className="size-4 text-muted-foreground" aria-hidden="true" />
          : <ChevronDownIcon className="size-4 text-muted-foreground" aria-hidden="true" />
      ),
      meta: { className: "w-10 px-2" },
    }),
    columnHelper.accessor("name", {
      header: sortableHeader("Registro"),
      sortingFn: "text",
      filterFn: "includesString",
      cell: ({ row }) => <ProductCell product={row.original} names={names} />,
      meta: { className: "whitespace-normal" },
    }),
    columnHelper.accessor("code", {
      id: "amounts",
      header: sortableHeader("Cantidades", "right"),
      sortingFn: "alphanumeric",
      cell: ({ row }) => <AmountsCell product={row.original} names={names} />,
      meta: { className: "hidden whitespace-nowrap text-right md:table-cell md:w-[32rem]" },
    }),
  ]);
}

function PersonRegisters({ employeeId, productId, historyVersion }) {
  const [registers, setRegisters] = React.useState([]);
  const [status, setStatus] = React.useState("loading");

  React.useEffect(() => {
    if (!employeeId || !productId) {
      setRegisters([]);
      setStatus("ready");
      return undefined;
    }
    const controller = new AbortController();
    setStatus("loading");
    axios
      .get(`${API_URL}inventory/individuals/id/${employeeId}/product/${productId}?count_type=individual`, {
        signal: controller.signal,
      })
      .then((response) => {
        const lines = response.data?.[0]?.registers ?? [];
        lines.sort((a, b) => new Date(b.date_create || 0) - new Date(a.date_create || 0));
        setRegisters(lines);
        setStatus("ready");
      })
      .catch((error) => {
        if (error?.code === "ERR_CANCELED" || error?.name === "CanceledError") return;
        setRegisters([]);
        setStatus("error");
      });
    return () => controller.abort();
  }, [employeeId, productId, historyVersion]);

  return (
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
              <TableCell colSpan={2} className="h-14 text-center">Cargando conteos...</TableCell>
            </TableRow>
          ) : status === "error" ? (
            <TableRow>
              <TableCell colSpan={2} className="h-14 text-center">No se pudieron cargar los conteos.</TableCell>
            </TableRow>
          ) : registers.length > 0 ? (
            registers.map((register) => (
              <TableRow key={register.id}>
                <TableCell className="font-medium text-primary">{formatQty(register.count_qty)}</TableCell>
                <TableCell>{formatCaboDate(register.date_create) || "—"}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={2} className="h-14 text-center">Todavía no hay conteos de este producto.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function TeamRegisters({ teamId, productId, historyVersion, namesById }) {
  const [registers, setRegisters] = React.useState([]);
  const [status, setStatus] = React.useState("loading");

  React.useEffect(() => {
    if (!teamId || !productId) {
      setRegisters([]);
      setStatus("ready");
      return undefined;
    }
    const controller = new AbortController();
    setStatus("loading");
    axios
      .get(`${API_URL}inventory/teams/id/${teamId}/product/${productId}`, {
        signal: controller.signal,
      })
      .then((response) => {
        const lines = response.data?.[0]?.registers ?? [];
        lines.sort((a, b) => new Date(b.date_create || 0) - new Date(a.date_create || 0));
        setRegisters(lines);
        setStatus("ready");
      })
      .catch((error) => {
        if (error?.code === "ERR_CANCELED" || error?.name === "CanceledError") return;
        setRegisters([]);
        setStatus("error");
      });
    return () => controller.abort();
  }, [teamId, productId, historyVersion]);

  return (
    <div className="overflow-hidden rounded-md border bg-background">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-muted/30">
            <TableHead>Cantidad</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Contó</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {status === "loading" ? (
            <TableRow>
              <TableCell colSpan={3} className="h-14 text-center">Cargando conteos...</TableCell>
            </TableRow>
          ) : status === "error" ? (
            <TableRow>
              <TableCell colSpan={3} className="h-14 text-center">No se pudieron cargar los conteos.</TableCell>
            </TableRow>
          ) : registers.length > 0 ? (
            registers.map((register) => (
              <TableRow key={register.id}>
                <TableCell className="font-medium text-difference">{formatQty(register.count_qty)}</TableCell>
                <TableCell>{formatCaboDate(register.date_create) || "—"}</TableCell>
                <TableCell>{firstName(namesById[Number(register.counting_user_id)]) || "—"}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} className="h-14 text-center">Todavía no hay conteos de diferencias de este producto.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function DifferenceHistory({ product, members, teamId, historyVersion, namesById, onOpenDrawer }) {
  return (
    <div className="bg-muted/30 px-3 py-3 md:px-4">
      <div className="mb-3 flex justify-end">
        <Button type="button" size="sm" data-tone="difference" onClick={onOpenDrawer}>
          Ingresar/Borrar registros
        </Button>
      </div>
      <div className="space-y-4">
        <div className="space-y-2 border-l-4 border-difference pl-3">
          <p className="text-sm font-medium text-difference">Equipo</p>
          <TeamRegisters
            teamId={teamId}
            productId={product.id_products}
            historyVersion={historyVersion}
            namesById={namesById}
          />
        </div>
        {members.filter((member) => member.id).map((member) => (
          <div key={member.id} className="space-y-2 border-l-4 border-primary pl-3">
            <p className="text-sm font-medium text-primary">{member.name}</p>
            <PersonRegisters
              employeeId={member.id}
              productId={product.id_products}
              historyVersion={historyVersion}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TeamDifferences() {
  const { teamId } = useCounts();
  const [rows, setRows] = React.useState([]);
  const [members, setMembers] = React.useState([
    { id: null, name: "Usuario 1" },
    { id: null, name: "Usuario 2" },
  ]);
  const [namesById, setNamesById] = React.useState({});
  const names = { a: members[0].name, b: members[1].name };
  const [status, setStatus] = React.useState("loading");
  const [error, setError] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [sorting, setSorting] = React.useState([]);
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [expandedId, setExpandedId] = React.useState(null);
  const [selected, setSelected] = React.useState(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [historyVersion, setHistoryVersion] = React.useState(0);
  const [onlyMissingTeamCounts, setOnlyMissingTeamCounts] = React.useState(false);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  React.useEffect(() => {
    if (!teamId) {
      setRows([]);
      setStatus("empty");
      return undefined;
    }

    const controller = new AbortController();
    setStatus((current) => (current === "ready" ? current : "loading"));
    Promise.all([
      axios.get(`${API_URL}teams/`, { signal: controller.signal }),
      axios.get(`${API_URL}employees/`, { signal: controller.signal }),
      axios.get(`${API_URL}inventory/teams/id/${teamId}`, { signal: controller.signal }),
    ])
      .then(([teamsResponse, employeesResponse, countsResponse]) => {
        const team = teamsResponse.data.find((item) => Number(item.id) === Number(teamId));
        const people = new Map(employeesResponse.data.map((employee) => [Number(employee.id), employee.name]));
        setNamesById(Object.fromEntries(people));
        setMembers([
          {
            id: Number(team?.empleado_id_a) || null,
            name: firstName(people.get(Number(team?.empleado_id_a))) || "Usuario 1",
          },
          {
            id: Number(team?.empleado_id_b) || null,
            name: firstName(people.get(Number(team?.empleado_id_b))) || "Usuario 2",
          },
        ]);
        setRows(countsResponse.data);
        setStatus("ready");
      })
      .catch((requestError) => {
        if (requestError?.code === "ERR_CANCELED" || requestError?.name === "CanceledError") return;
        setError(requestError.response?.data?.detail || "No se pudieron cargar las diferencias.");
        setStatus("error");
      });

    return () => controller.abort();
  }, [teamId, historyVersion]);

  const differenceRows = React.useMemo(
    () => rows.filter((row) => !isMatch(row.iguales)),
    [rows],
  );
  const missingTeamRows = React.useMemo(
    () => differenceRows.filter((row) => !hasTeamCount(row)),
    [differenceRows],
  );
  const listedRows = onlyMissingTeamCounts ? missingTeamRows : differenceRows;

  const visibleRows = React.useMemo(() => {
    const query = search.trim().toLocaleLowerCase("es-MX");
    if (!query) return listedRows;
    return listedRows.filter((row) =>
      String(row.name).toLocaleLowerCase("es-MX").includes(query) ||
      String(row.code).toLocaleLowerCase("es-MX").includes(query)
    );
  }, [listedRows, search]);

  const columns = React.useMemo(() => createColumns(names, expandedId), [names, expandedId]);

  const table = useTable({
    features,
    data: visibleRows,
    columns,
    getRowId: (row) => String(row.id_products),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    autoResetPageIndex: false,
    state: {
      sorting,
      columnFilters,
      pagination,
    },
  });

  const emptyMessage = !teamId
    ? "Esta cuenta no tiene equipo."
    : search.trim()
      ? "No se encontraron diferencias."
      : onlyMissingTeamCounts
        ? "Todos los códigos ya tienen conteo de diferencias."
        : "No hay diferencias en este equipo.";

  return (
    <div className="w-full space-y-4 p-4 sm:space-y-6 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Diferencias en equipo</h1>
        <p className="text-sm text-muted-foreground">
          Códigos en los que las cantidades de las dos personas no coinciden.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground">Códigos con diferencia</p>
          <p className="text-3xl font-semibold tabular-nums text-difference">{differenceRows.length}</p>
        </div>
        <div className="rounded-2xl border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground">Equipo</p>
          <p className="pt-2 text-lg font-medium">{names.a} y {names.b}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Buscar en las diferencias..."
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
            setSorting([]);
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
              <col className="w-0 md:w-[32rem]" />
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
                    Cargando diferencias...
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
                      aria-expanded={expandedId === row.original.id_products}
                      onClick={() => setExpandedId((current) => (
                        current === row.original.id_products ? null : row.original.id_products
                      ))}
                      onKeyDown={(event) => {
                        if (event.key !== "Enter" && event.key !== " ") return;
                        event.preventDefault();
                        setExpandedId((current) => (
                          current === row.original.id_products ? null : row.original.id_products
                        ));
                      }}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className={cell.column.columnDef.meta?.className}>
                          <table.FlexRender cell={cell} />
                        </TableCell>
                      ))}
                    </TableRow>
                    {expandedId === row.original.id_products && (
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={columns.length} className="p-0">
                          <DifferenceHistory
                            product={row.original}
                            members={members}
                            teamId={teamId}
                            historyVersion={historyVersion}
                            namesById={namesById}
                            onOpenDrawer={() => {
                              setSelected(row.original);
                              setDrawerOpen(true);
                            }}
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
        <div className="flex justify-end border-t bg-muted/40 px-3 py-2">
          <Button
            size="sm"
            type="button"
            variant={onlyMissingTeamCounts ? "default" : "outline"}
            aria-pressed={onlyMissingTeamCounts}
            onClick={() => {
              setOnlyMissingTeamCounts((current) => !current);
              setPagination((current) => ({ ...current, pageIndex: 0 }));
            }}
          >
            códigos sin conteo de diferencias
            <span className="tabular-nums">{missingTeamRows.length}</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {visibleRows.length} producto(s).
        </p>
        <div className="flex items-center gap-2">
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
      {selected && (
        <CountDrawer
          item={{ id: selected.id_products, name: selected.name, code: selected.code, header: selected.name }}
          mode="team"
          open={drawerOpen}
          onOpenChange={(open) => {
            setDrawerOpen(open);
            if (!open) setHistoryVersion((current) => current + 1);
          }}
          onChanged={() => setHistoryVersion((current) => current + 1)}
        />
      )}
    </div>
  );
}
