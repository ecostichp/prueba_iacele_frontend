import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { API_URL } from "@/constants/api";
import { useAuth } from "@/context/auth";
import { useCounts } from "@/context/counts";
import { canSeeManagerMenu } from "@/lib/access";
import { cn } from "@/lib/utils";

const IMBALANCE_MARK = 0.3;

function firstName(name) {
  const text = (name || "").trim();
  return text ? text.split(/\s+/)[0] : "—";
}

function formatPieces(value) {
  return Number(value || 0).toLocaleString("es-MX", { maximumFractionDigits: 2 });
}

function formatAverage(value) {
  return Number(value || 0).toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatPercent(value) {
  return Number(value || 0).toLocaleString("es-MX", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function personBehind(row) {
  if (row.imbalance < IMBALANCE_MARK) return null;
  if (row.qtyA < row.qtyB) return "a";
  if (row.qtyB < row.qtyA) return "b";
  return null;
}

function teamMetrics(qtyA, qtyB) {
  const average = (qtyA + qtyB) / 2;
  const highest = Math.max(qtyA, qtyB);
  const lowest = Math.min(qtyA, qtyB);
  const gap = Math.abs(qtyA - qtyB);
  return {
    average,
    imbalance: highest === 0 ? 0 : 1 - lowest / highest,
    gap,
    gapFloor: Math.max(gap, 1),
    gapShare: average === 0 ? 0 : gap / average,
  };
}

function buildRows(teams, employees, registers, stage) {
  const counted = new Map();
  registers.forEach((register) => {
    if (register.count_type !== "individual") return;
    const personId = Number(register.assigned_user_id);
    const productId = Number(register.id_products);
    if (!personId || !productId) return;
    if (!counted.has(personId)) counted.set(personId, new Set());
    counted.get(personId).add(productId);
  });

  return teams
    .map((team) => {
      const personA = Number(team.empleado_id_a);
      const personB = Number(team.empleado_id_b);
      const codesA = counted.get(personA) || new Set();
      const codesB = counted.get(personB) || new Set();
      const productIds = new Set([...codesA, ...codesB]);
      let codes = 0;
      productIds.forEach((productId) => {
        if (codesA.has(productId) !== codesB.has(productId)) codes += 1;
      });
      const qtyA = codesA.size;
      const qtyB = codesB.size;
      const nameA = employees.get(personA) || "Sin asignar";
      const nameB = employees.get(personB) || "Sin asignar";
      return {
        id: team.id,
        nameA,
        nameB,
        shortA: firstName(nameA),
        shortB: firstName(nameB),
        qtyA,
        qtyB,
        codes,
        ...teamMetrics(qtyA, qtyB),
      };
    })
    .sort((left, right) => left.id - right.id)
    .map((row, index) => ({
      ...row,
      label: String(index + 1).padStart(2, "0"),
    }));
}

export default function Metrics() {
  const { user } = useAuth();
  const { stage } = useCounts();
  const navigate = useNavigate();
  const [access, setAccess] = useState("loading");
  const [status, setStatus] = useState("loading");
  const [rows, setRows] = useState([]);

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
      axios.get(`${API_URL}teams/`, { signal: controller.signal }),
      axios.get(`${API_URL}employees/`, { signal: controller.signal }),
      axios.get(`${API_URL}inventory/registers`, { signal: controller.signal }),
    ])
      .then(([teamsResponse, employeesResponse, registersResponse]) => {
        const employees = new Map(
          employeesResponse.data.map((employee) => [employee.id, employee.name])
        );
        setRows(buildRows(teamsResponse.data, employees, registersResponse.data, stage));
        setStatus("ready");
      })
      .catch((error) => {
        if (error?.code === "ERR_CANCELED" || error?.name === "CanceledError") return;
        setStatus("error");
      });
    return () => controller.abort();
  }, [access, stage]);

  if (access !== "allowed") return null;

  const shownGap = rows.reduce((total, row) => total + row.gap, 0);
  const shownAverage = rows.reduce((total, row) => total + row.average, 0);

  return (
    <div className="w-full space-y-4 p-4 sm:space-y-6 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Métricas</h1>
        <p className="text-sm text-muted-foreground">
          El conteo es cuántos códigos distintos contó cada quien. El desbalance se pone rojo desde 30%.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Summary label="Equipos" value={rows.length.toLocaleString("es-MX")} />
        <Summary
          label="Con desbalance"
          value={rows.filter((row) => row.imbalance >= IMBALANCE_MARK).length.toLocaleString("es-MX")}
        />
      </div>

      {status === "loading" ? (
        <p className="text-sm text-muted-foreground">Cargando equipos...</p>
      ) : status === "error" ? (
        <p className="text-sm text-muted-foreground">No se pudieron cargar las métricas.</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">Todavía no hay equipos.</p>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {rows.map((row) => <TeamCard key={row.id} row={row} />)}
          </div>
          <div className="hidden overflow-hidden rounded-2xl border md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Eq</TableHead>
                  <TableHead>A</TableHead>
                  <TableHead className="text-right">Conteo</TableHead>
                  <TableHead>B</TableHead>
                  <TableHead className="text-right">Conteo</TableHead>
                  <TableHead className="text-right">PromEq</TableHead>
                  <TableHead className="text-right">Desbalance</TableHead>
                  <TableHead className="text-right">Diff</TableHead>
                  <TableHead className="text-right">Diff alt.</TableHead>
                  <TableHead className="text-right">%Diff</TableHead>
                  <TableHead className="text-right">Códigos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => {
                  const behind = personBehind(row);
                  return (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium tabular-nums">{row.label}</TableCell>
                      <TableCell title={row.nameA} className={behind === "a" ? "font-medium text-destructive" : undefined}>{row.shortA}</TableCell>
                      <TableCell className={cn("text-right tabular-nums", behind === "a" && "font-medium text-destructive")}>{formatPieces(row.qtyA)}</TableCell>
                      <TableCell title={row.nameB} className={behind === "b" ? "font-medium text-destructive" : undefined}>{row.shortB}</TableCell>
                      <TableCell className={cn("text-right tabular-nums", behind === "b" && "font-medium text-destructive")}>{formatPieces(row.qtyB)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatAverage(row.average)}</TableCell>
                      <TableCell className="text-right">
                        <DesbalanceBadge value={row.imbalance} />
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{formatPieces(row.gap)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatPieces(row.gapFloor)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatPercent(row.gapShare)}</TableCell>
                      <TableCell className="text-right tabular-nums">{row.codes.toLocaleString("es-MX")}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
              {rows.length > 0 && (
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={5}>
                      {rows.length.toLocaleString("es-MX")} equipos
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{formatAverage(shownAverage)}</TableCell>
                    <TableCell />
                    <TableCell className="text-right tabular-nums">{formatPieces(shownGap)}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatPieces(rows.reduce((total, row) => total + row.gapFloor, 0))}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatPercent(shownAverage === 0 ? 0 : shownGap / shownAverage)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {rows.reduce((total, row) => total + row.codes, 0).toLocaleString("es-MX")}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              )}
            </Table>
          </div>
        </>
      )}
    </div>
  );
}

function Summary({ label, value }) {
  return (
    <div className="rounded-2xl border px-4 py-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold tabular-nums tracking-tight">{value}</p>
    </div>
  );
}

function DesbalanceBadge({ value }) {
  const marked = value >= IMBALANCE_MARK;
  return (
    <Badge
      variant={marked ? "destructive" : "secondary"}
      className="ml-auto tabular-nums"
    >
      {formatPercent(value)}
    </Badge>
  );
}

function TeamCard({ row }) {
  const behind = personBehind(row);
  return (
    <div className="rounded-2xl border p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-medium">
          Eq {row.label} ·{" "}
          <span className={behind === "a" ? "text-destructive" : undefined}>{row.shortA}</span>
          {" y "}
          <span className={behind === "b" ? "text-destructive" : undefined}>{row.shortB}</span>
        </p>
        <DesbalanceBadge value={row.imbalance} />
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {formatPieces(row.qtyA)} y {formatPieces(row.qtyB)} códigos · promedio {formatAverage(row.average)} · diferencia {formatPieces(row.gap)}
      </p>
    </div>
  );
}
