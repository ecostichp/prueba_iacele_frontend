import { Fragment, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";

import CountDrawer from "@/components/CountDrawer";
import { Badge } from "@/components/ui/badge";
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
import { useCounts } from "@/context/counts";
import { formatCaboDate } from "@/lib/datetime";

const PAGE_SIZE = 10;

function formatQty(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  return Number.isInteger(number)
    ? number.toLocaleString("es-MX")
    : number.toLocaleString("es-MX", { maximumFractionDigits: 2 });
}

function History({ employeeId, productId, version }) {
  const [registers, setRegisters] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    if (!employeeId || !productId) return undefined;
    const controller = new AbortController();
    axios
      .get(`${API_URL}inventory/individuals/id/${employeeId}/product/${productId}`, {
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
        setStatus("error");
      });
    return () => controller.abort();
  }, [employeeId, productId, version]);

  return (
    <div className="border-l-4 border-foreground bg-muted/30 px-3 py-3 md:px-4">
      <div className="overflow-hidden rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
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
                  <TableCell className="font-medium">{formatQty(register.count_qty)}</TableCell>
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
    </div>
  );
}

export default function StageCounts({ title, subtitle }) {
  const { assignedUserId, totals } = useCounts();
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("loading");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [expandedId, setExpandedId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!assignedUserId) {
      setRows([]);
      setStatus("ready");
      return undefined;
    }
    let cancelled = false;
    axios
      .get(`${API_URL}inventory/individuals/id/${assignedUserId}`)
      .then((response) => {
        if (cancelled) return;
        setRows(response.data || []);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [assignedUserId, totals, version]);

  const visible = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("es-MX");
    const list = !query
      ? rows
      : rows.filter((row) =>
        String(row.name || "").toLocaleLowerCase("es-MX").includes(query) ||
        String(row.code || "").toLocaleLowerCase("es-MX").includes(query)
      );
    return [...list].sort((a, b) => String(b.last_count || "").localeCompare(String(a.last_count || "")));
  }, [rows, search]);

  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const pageIndex = Math.min(page, pageCount - 1);
  const slice = visible.slice(pageIndex * PAGE_SIZE, pageIndex * PAGE_SIZE + PAGE_SIZE);

  return (
    <div className="w-full space-y-4 p-4 sm:space-y-6 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>

      <div className="rounded-2xl border bg-card px-4 py-3">
        <p className="text-xs text-muted-foreground">Códigos contados</p>
        <p className="text-3xl font-semibold text-foreground tabular-nums">{rows.length}</p>
      </div>

      <Input
        placeholder="Buscar por código o nombre..."
        value={search}
        onChange={(event) => {
          setSearch(event.target.value);
          setPage(0);
        }}
        className="w-full sm:max-w-sm"
      />

      <div className="overflow-hidden rounded-2xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <TableHead>Registro</TableHead>
              <TableHead className="text-right">Cantidad</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {status === "loading" ? (
              <TableRow>
                <TableCell colSpan={3} className="h-16 text-center">Cargando conteos...</TableCell>
              </TableRow>
            ) : status === "error" ? (
              <TableRow>
                <TableCell colSpan={3} className="h-16 text-center">No se pudieron cargar los conteos.</TableCell>
              </TableRow>
            ) : slice.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-16 text-center">No hay conteos en esta etapa.</TableCell>
              </TableRow>
            ) : slice.map((row) => (
              <Fragment key={row.id_products}>
                <TableRow
                  className="cursor-pointer"
                  onClick={() => setExpandedId((current) => current === row.id_products ? null : row.id_products)}
                >
                  <TableCell>
                    {expandedId === row.id_products
                      ? <ChevronUpIcon className="size-4 text-muted-foreground" />
                      : <ChevronDownIcon className="size-4 text-muted-foreground" />}
                  </TableCell>
                  <TableCell>
                    <span className="block text-xs font-bold tracking-wide">{row.code}</span>
                    <span className="whitespace-normal">{row.name}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge data-tone="mono">{formatQty(row.total_qty)}</Badge>
                  </TableCell>
                </TableRow>
                {expandedId === row.id_products && (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={3} className="p-0">
                      <div className="flex justify-end px-3 pt-3 md:px-4">
                        <Button
                          type="button"
                          size="sm"
                          data-tone="mono"
                          onClick={() => {
                            setSelected(row);
                            setDrawerOpen(true);
                          }}
                        >
                          Ingresar/Borrar registros
                        </Button>
                      </div>
                      <History employeeId={assignedUserId} productId={row.id_products} version={version} />
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end gap-2">
        <span className="text-sm text-muted-foreground">{visible.length} producto(s).</span>
        <Button variant="outline" size="sm" disabled={pageIndex === 0} onClick={() => setPage(pageIndex - 1)}>
          Anterior
        </Button>
        <Button variant="outline" size="sm" disabled={pageIndex >= pageCount - 1} onClick={() => setPage(pageIndex + 1)}>
          Siguiente
        </Button>
      </div>

      {selected && (
        <CountDrawer
          item={{ id: selected.id_products, name: selected.name, code: selected.code, header: selected.name }}
          open={drawerOpen}
          onOpenChange={(open) => {
            setDrawerOpen(open);
            if (!open) setVersion((current) => current + 1);
          }}
        />
      )}
    </div>
  );
}
