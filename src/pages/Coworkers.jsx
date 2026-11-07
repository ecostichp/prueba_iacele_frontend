import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { avatarUrl } from "@/lib/avatars";

function initial(name) {
  return (name || "?").trim().slice(0, 1).toUpperCase();
}

export default function Coworkers() {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("loading");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    axios
      .get(`${API_URL}employees/`, { signal: controller.signal })
      .then(async (employeesResponse) => {
        const accountsResponse = await axios.get(`${API_URL}authentication/`, {
          signal: controller.signal,
        });
        const avatarByEmployee = new Map();
        for (const account of accountsResponse.data) {
          if (account.empleado_id && account.avatar) {
            avatarByEmployee.set(account.empleado_id, account.avatar);
          }
        }
        const people = employeesResponse.data
          .map((employee) => ({
            id: employee.id,
            name: employee.name,
            jobTitle: employee.job_title,
            department: employee.department,
            warehouse: employee.warehouse,
            avatar: avatarByEmployee.get(employee.id) || null,
          }))
          .sort((a, b) => a.name.localeCompare(b.name, "es-MX"));
        setRows(people);
        setStatus("ready");
      })
      .catch((error) => {
        if (error?.code === "ERR_CANCELED" || error?.name === "CanceledError") return;
        setStatus("error");
      });

    return () => controller.abort();
  }, []);

  const visibleRows = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("es-MX");
    if (!query) return rows;
    return rows.filter((row) =>
      [row.name, row.jobTitle, row.department, row.warehouse]
        .join(" ")
        .toLocaleLowerCase("es-MX")
        .includes(query)
    );
  }, [rows, search]);

  return (
    <div className="w-full space-y-4 p-4 sm:space-y-6 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mis compañeros</h1>
        <p className="text-sm text-muted-foreground">Los empleados asignados a este inventario.</p>
      </div>

      <Input
        placeholder="Buscar empleado..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="w-full sm:max-w-sm"
      />

      <div className="overflow-hidden rounded-2xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16" />
              <TableHead>Empleado</TableHead>
              <TableHead className="hidden md:table-cell">Puesto</TableHead>
              <TableHead className="hidden md:table-cell">Departamento</TableHead>
              <TableHead className="hidden md:table-cell">Almacén</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {status === "loading" ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Cargando empleados...
                </TableCell>
              </TableRow>
            ) : status === "error" ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No se pudieron cargar los empleados.
                </TableCell>
              </TableRow>
            ) : visibleRows.length > 0 ? (
              visibleRows.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <Avatar className="size-11">
                      <AvatarImage src={avatarUrl(employee.avatar)} alt="" />
                      <AvatarFallback>{initial(employee.name)}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{employee.name}</div>
                    <dl className="mt-1 space-y-0.5 text-xs md:hidden">
                      <div className="flex gap-2">
                        <dt className="w-24 shrink-0 text-muted-foreground">Puesto</dt>
                        <dd>{employee.jobTitle}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="w-24 shrink-0 text-muted-foreground">Departamento</dt>
                        <dd>{employee.department}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="w-24 shrink-0 text-muted-foreground">Almacén</dt>
                        <dd>{employee.warehouse}</dd>
                      </div>
                    </dl>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {employee.jobTitle}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {employee.department}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {employee.warehouse}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No se encontraron empleados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
