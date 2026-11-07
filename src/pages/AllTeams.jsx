import { useEffect, useState } from "react";
import axios from "axios";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { API_URL } from "@/constants/api";
import { avatarUrl } from "@/lib/avatars";

function initial(name) {
  return (name || "?").trim().slice(0, 1).toUpperCase();
}

function countSplits(registers, homeTeam) {
  const counted = new Map();
  const assigned = new Map();
  const unassigned = new Map();

  const add = (bucket, personId, productId) => {
    if (!bucket.has(personId)) bucket.set(personId, new Set());
    bucket.get(personId).add(productId);
  };

  registers.forEach((register) => {
    if (register.count_type !== "individual") return;
    const personId = Number(register.counting_user_id);
    const productId = Number(register.id_products);
    const teamId = Number(register.assigned_team_id);
    if (!personId || !productId) return;
    add(counted, personId, productId);
    if (homeTeam.get(personId) === teamId) add(assigned, personId, productId);
    else add(unassigned, personId, productId);
  });

  return { counted, assigned, unassigned };
}

export default function AllTeams() {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      axios.get(`${API_URL}teams/`, { signal: controller.signal }),
      axios.get(`${API_URL}employees/`, { signal: controller.signal }),
      axios.get(`${API_URL}authentication/`, { signal: controller.signal }),
      axios.get(`${API_URL}inventory/registers`, { signal: controller.signal }),
    ])
      .then(([teamsResponse, employeesResponse, accountsResponse, registersResponse]) => {
        const avatars = new Map();
        accountsResponse.data.forEach((account) => {
          if (account.empleado_id && account.avatar) {
            avatars.set(account.empleado_id, account.avatar);
          }
        });
        const homeTeam = new Map();
        teamsResponse.data.forEach((team) => {
          if (team.empleado_id_a) homeTeam.set(Number(team.empleado_id_a), Number(team.id));
          if (team.empleado_id_b) homeTeam.set(Number(team.empleado_id_b), Number(team.id));
        });
        const splits = countSplits(registersResponse.data, homeTeam);
        const size = (bucket, employeeId) => bucket.get(employeeId)?.size || 0;
        const people = new Map(
          employeesResponse.data.map((employee) => [
            employee.id,
            {
              name: employee.name,
              avatar: avatars.get(employee.id) || null,
              counted: size(splits.counted, employee.id),
              assigned: size(splits.assigned, employee.id),
              unassigned: size(splits.unassigned, employee.id),
            },
          ])
        );
        const person = (employeeId) => people.get(employeeId) || null;
        const teams = [...teamsResponse.data]
          .sort((left, right) => left.id - right.id)
          .map((team, index) => ({
            id: team.id,
            label: String(index + 1).padStart(2, "0"),
            personA: person(team.empleado_id_a),
            personB: person(team.empleado_id_b),
          }));
        setRows(teams);
        setStatus("ready");
      })
      .catch((error) => {
        if (error?.code === "ERR_CANCELED" || error?.name === "CanceledError") return;
        setStatus("error");
      });

    return () => controller.abort();
  }, []);

  return (
    <div className="w-full space-y-4 p-4 sm:space-y-6 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Todos los equipos</h1>
        <p className="text-sm text-muted-foreground">
          Los equipos de este inventario y los códigos que contó cada persona.
        </p>
      </div>

      {status === "loading" ? (
        <p className="text-sm text-muted-foreground">Cargando equipos...</p>
      ) : status === "error" ? (
        <p className="text-sm text-muted-foreground">No se pudieron cargar los equipos.</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">Todavía no hay equipos.</p>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {rows.map((team) => (
              <article key={team.id} className="space-y-4 rounded-2xl border p-4">
                <p className="text-sm font-medium tabular-nums">Equipo {team.label}</p>
                <PersonBlock person={team.personA} />
                <PersonBlock person={team.personB} />
              </article>
            ))}
          </div>
          <div className="hidden overflow-hidden rounded-2xl border md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Id</TableHead>
                  <TableHead>Usuario 1</TableHead>
                  <TableHead>Usuario 2</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((team) => (
                  <TableRow key={team.id}>
                    <TableCell className="font-medium tabular-nums">{team.label}</TableCell>
                    <TableCell className="whitespace-normal">
                      <PersonCell person={team.personA} />
                    </TableCell>
                    <TableCell className="whitespace-normal">
                      <PersonCell person={team.personB} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}

function PersonBlock({ person }) {
  if (!person) return <p className="text-sm text-muted-foreground">Sin asignar</p>;

  return (
    <div className="flex items-start gap-3">
      <Avatar className="size-11">
        <AvatarImage src={avatarUrl(person.avatar)} alt="" />
        <AvatarFallback>{initial(person.name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 space-y-1">
        <p className="font-medium leading-snug">{person.name}</p>
        <p className="text-sm leading-5 text-muted-foreground">
          Total de códigos contados: {person.counted.toLocaleString("es-MX")}
        </p>
        <p className="text-sm leading-5 text-muted-foreground">
          Asignados {person.assigned.toLocaleString("es-MX")}
        </p>
        <p className="text-sm leading-5 text-muted-foreground">
          No asignados {person.unassigned.toLocaleString("es-MX")}
        </p>
      </div>
    </div>
  );
}

function PersonCell({ person }) {
  if (!person) return "Sin asignar";

  return (
    <div className="flex items-center gap-3 py-1">
      <Avatar className="size-11">
        <AvatarImage src={avatarUrl(person.avatar)} alt="" />
        <AvatarFallback>{initial(person.name)}</AvatarFallback>
      </Avatar>
      <div>
        <div className="font-medium">{person.name}</div>
        <p className="text-xs tabular-nums text-muted-foreground">
          Total de códigos contados: {person.counted.toLocaleString("es-MX")}
        </p>
        <p className="text-xs tabular-nums text-muted-foreground">
          Asignados {person.assigned.toLocaleString("es-MX")} / No asignados {person.unassigned.toLocaleString("es-MX")}
        </p>
      </div>
    </div>
  );
}
