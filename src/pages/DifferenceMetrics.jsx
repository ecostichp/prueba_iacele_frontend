import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";

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
import { canSeeManagerMenu } from "@/lib/access";

function firstName(name) {
  const text = (name || "").trim();
  return text ? text.split(/\s+/)[0] : "—";
}

function buildRows(teams, employees, registers) {
  const quantities = new Map();
  const writtenByTeam = new Map();
  registers.forEach((register) => {
    const productId = Number(register.id_products);
    if (!productId) return;
    if (register.count_type === "equipo") {
      const teamId = Number(register.assigned_team_id);
      if (!teamId) return;
      if (!writtenByTeam.has(teamId)) writtenByTeam.set(teamId, new Set());
      writtenByTeam.get(teamId).add(productId);
      return;
    }
    if (register.count_type !== "individual") return;
    const personId = Number(register.assigned_user_id);
    if (!personId) return;
    if (!quantities.has(personId)) quantities.set(personId, new Map());
    const products = quantities.get(personId);
    products.set(productId, (products.get(productId) || 0) + Number(register.count_qty || 0));
  });

  return teams
    .map((team) => {
      const personA = Number(team.empleado_id_a);
      const personB = Number(team.empleado_id_b);
      const qtyByA = quantities.get(personA) || new Map();
      const qtyByB = quantities.get(personB) || new Map();
      const written = writtenByTeam.get(Number(team.id)) || new Set();
      const productIds = new Set([...qtyByA.keys(), ...qtyByB.keys()]);
      let differences = 0;
      let counted = 0;
      let pending = 0;
      productIds.forEach((productId) => {
        const amountA = qtyByA.get(productId) || 0;
        const amountB = qtyByB.get(productId) || 0;
        if (Math.abs(amountA - amountB) <= 0.0005) return;
        differences += 1;
        if (written.has(productId)) counted += 1;
        else pending += 1;
      });
      const nameA = employees.get(personA) || "Sin asignar";
      const nameB = employees.get(personB) || "Sin asignar";
      return {
        id: team.id,
        nameA,
        nameB,
        shortA: firstName(nameA),
        shortB: firstName(nameB),
        differences,
        counted,
        pending,
      };
    })
    .sort((left, right) => left.id - right.id)
    .map((row, index) => ({
      ...row,
      label: String(index + 1).padStart(2, "0"),
    }));
}

export default function DifferenceMetrics() {
  const { user } = useAuth();
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
        setRows(buildRows(teamsResponse.data, employees, registersResponse.data));
        setStatus("ready");
      })
      .catch((error) => {
        if (error?.code === "ERR_CANCELED" || error?.name === "CanceledError") return;
        setStatus("error");
      });
    return () => controller.abort();
  }, [access]);

  if (access !== "allowed") return null;

  const differences = rows.reduce((total, row) => total + row.differences, 0);
  const counted = rows.reduce((total, row) => total + row.counted, 0);
  const pending = rows.reduce((total, row) => total + row.pending, 0);

  return (
    <div className="w-full space-y-4 p-4 sm:space-y-6 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Métricas diferencias</h1>
        <p className="text-sm text-muted-foreground">
          Diferencias que tuvieron y cuántas de esas ya tienen conteo de equipo.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Summary label="Diferencias" value={differences.toLocaleString("es-MX")} />
        <Summary label="Contadas" value={counted.toLocaleString("es-MX")} />
        <Summary label="Faltan por contar" value={pending.toLocaleString("es-MX")} />
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
            {rows.map((row) => (
              <div key={row.id} className="rounded-2xl border p-4">
                <p className="font-medium">
                  Equipo {row.label} · {row.shortA} y {row.shortB}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {row.differences.toLocaleString("es-MX")} diferencias · {row.counted.toLocaleString("es-MX")} contadas · {row.pending.toLocaleString("es-MX")} faltan
                </p>
              </div>
            ))}
          </div>
          <div className="hidden overflow-hidden rounded-2xl border md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Equipo</TableHead>
                  <TableHead>A</TableHead>
                  <TableHead>B</TableHead>
                  <TableHead className="text-right">Diferencias</TableHead>
                  <TableHead className="text-right">Contadas</TableHead>
                  <TableHead className="text-right">Faltan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium tabular-nums">{row.label}</TableCell>
                    <TableCell title={row.nameA}>{row.shortA}</TableCell>
                    <TableCell title={row.nameB}>{row.shortB}</TableCell>
                    <TableCell className="text-right tabular-nums">{row.differences.toLocaleString("es-MX")}</TableCell>
                    <TableCell className="text-right tabular-nums">{row.counted.toLocaleString("es-MX")}</TableCell>
                    <TableCell className="text-right tabular-nums">{row.pending.toLocaleString("es-MX")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3}>
                    {rows.length.toLocaleString("es-MX")} equipos
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{differences.toLocaleString("es-MX")}</TableCell>
                  <TableCell className="text-right tabular-nums">{counted.toLocaleString("es-MX")}</TableCell>
                  <TableCell className="text-right tabular-nums">{pending.toLocaleString("es-MX")}</TableCell>
                </TableRow>
              </TableFooter>
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
