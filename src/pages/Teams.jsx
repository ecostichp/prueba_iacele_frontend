import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import { DndContext, DragOverlay, PointerSensor, TouchSensor, useDraggable, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
import { useIsMobile } from "@/hooks/useIsMobile";
import { canSeeManagerMenu } from "@/lib/access";
import { cn } from "@/lib/utils";

function personId(value) {
  return `person:${value}`;
}

function slotId(value) {
  return `slot:${value}`;
}

function firstId(value) {
  const id = Number(String(value).split(":")[1]);
  return Number.isFinite(id) ? id : null;
}

export default function Teams() {
  const { user, token, refreshUser } = useAuth();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [access, setAccess] = useState("loading");
  const [status, setStatus] = useState("loading");
  const [teams, setTeams] = useState([]);
  const [people, setPeople] = useState(new Map());
  const [saved, setSaved] = useState(new Map());
  const [draft, setDraft] = useState(new Map());
  const [draggingId, setDraggingId] = useState(null);
  const pointerSensor = useSensor(PointerSensor, { activationConstraint: { distance: 6 } });
  const touchSensor = useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } });
  const sensors = useSensors(isMobile ? touchSensor : pointerSensor);

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
      axios.get(`${API_URL}authentication/`, { signal: controller.signal }),
    ])
      .then(([teamsResponse, employeesResponse, accountsResponse]) => {
        const names = new Map(
          employeesResponse.data.map((employee) => [employee.id, employee.name])
        );
        const assignments = new Map();
        accountsResponse.data.forEach((account) => {
          const empleadoId = Number(account.empleado_id);
          if (!empleadoId) return;
          assignments.set(empleadoId, Number(account.assigned_user_id) || empleadoId);
        });
        setPeople(names);
        setSaved(assignments);
        setDraft(new Map(assignments));
        setTeams([...teamsResponse.data].sort((left, right) => left.id - right.id));
        setStatus("ready");
      })
      .catch((error) => {
        if (error?.code === "ERR_CANCELED" || error?.name === "CanceledError") return;
        setStatus("error");
      });
    return () => controller.abort();
  }, [access]);

  const dirty = useMemo(() => {
    for (const [empleadoId, assignedId] of draft) {
      if (saved.get(empleadoId) !== assignedId) return true;
    }
    return false;
  }, [draft, saved]);

  const atOriginal = useMemo(() => {
    for (const [empleadoId, assignedId] of draft) {
      if (assignedId !== empleadoId) return false;
    }
    return true;
  }, [draft]);

  const nameOf = (empleadoId) => people.get(empleadoId) || "Sin asignar";

  const helpersOf = (memberId) =>
    [...draft.entries()]
      .filter(([empleadoId, assignedId]) => assignedId === memberId && empleadoId !== memberId)
      .map(([empleadoId]) => ({ id: empleadoId, name: nameOf(empleadoId) }))
      .sort((left, right) => left.name.localeCompare(right.name, "es-MX"));

  const teamOf = useMemo(() => {
    const teamsByPerson = new Map();
    teams.forEach((team) => {
      if (team.empleado_id_a) teamsByPerson.set(Number(team.empleado_id_a), team.id);
      if (team.empleado_id_b) teamsByPerson.set(Number(team.empleado_id_b), team.id);
    });
    return teamsByPerson;
  }, [teams]);

  const onDragEnd = (event) => {
    setDraggingId(null);
    const empleadoId = firstId(event.active?.id);
    const memberId = firstId(event.over?.id);
    if (!empleadoId || !memberId || !draft.has(empleadoId)) return;
    if (empleadoId !== memberId && teamOf.get(empleadoId) === teamOf.get(memberId)) {
      toast.error("No puedes asignar a alguien a su mismo equipo.");
      return;
    }
    setDraft((current) => {
      const next = new Map(current);
      next.set(empleadoId, memberId);
      return next;
    });
  };

  const save = async () => {
    const items = [...draft.entries()]
      .filter(([empleadoId, assignedId]) => saved.get(empleadoId) !== assignedId)
      .map(([empleado_id, assigned_user_id]) => ({ empleado_id, assigned_user_id }));
    if (items.length === 0) return;

    try {
      await axios.put(
        `${API_URL}authentication/assignments`,
        { items },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSaved(new Map(draft));
      await refreshUser();
      toast.success("Asignación guardada. Esa persona ya tiene el aviso.");
    } catch (error) {
      const detail = error?.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "No se pudo guardar la asignación.");
    }
  };

  const restoreOriginal = () => {
    setDraft((current) => {
      const next = new Map(current);
      for (const empleadoId of next.keys()) next.set(empleadoId, empleadoId);
      return next;
    });
  };

  const memberFields = (rawId) => {
    const memberId = Number(rawId) || null;
    const assignedId = memberId ? draft.get(memberId) : null;
    return {
      memberId,
      name: memberId ? nameOf(memberId) : "Sin asignar",
      hasAccount: memberId ? draft.has(memberId) : false,
      helpers: memberId ? helpersOf(memberId) : [],
      helpingName: assignedId && assignedId !== memberId ? nameOf(assignedId) : "",
    };
  };

  if (access !== "allowed") return null;

  const draggingName = draggingId ? nameOf(draggingId) : "";

  return (
    <div className="w-full space-y-4 p-4 sm:space-y-6 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Asignados y Contadores</h1>
          <p className="text-sm text-muted-foreground">
            {isMobile
              ? "Mantén pulsado un nombre y suéltalo sobre alguien de otro equipo."
              : "Arrastra a una persona de otro equipo. No puedes asignar a alguien a su mismo equipo. Al guardar, esa persona recibe el aviso y sus pantallas cambian de color."}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
          <Button variant="outline" disabled={atOriginal} onClick={restoreOriginal}>
            Esquema original
          </Button>
          <Button disabled={!dirty} onClick={save}>
            Guardar
          </Button>
        </div>
      </div>

      {status === "loading" ? (
        <p className="text-sm text-muted-foreground">Cargando equipos...</p>
      ) : status === "error" ? (
        <p className="text-sm text-muted-foreground">No se pudieron cargar los equipos.</p>
      ) : (
        <DndContext
          sensors={sensors}
          onDragStart={(event) => setDraggingId(firstId(event.active.id))}
          onDragCancel={() => setDraggingId(null)}
          onDragEnd={onDragEnd}
        >
          {isMobile ? (
            <div className="space-y-3">
              {teams.map((team, index) => {
                const label = String(index + 1).padStart(2, "0");
                return (
                  <article key={team.id} className="space-y-4 rounded-2xl border p-4">
                    <p className="text-sm font-medium tabular-nums">Equipo {label}</p>
                    <MemberCell {...memberFields(team.empleado_id_a)} wide />
                    <MemberCell {...memberFields(team.empleado_id_b)} wide />
                  </article>
                );
              })}
            </div>
          ) : (
          <div className="overflow-hidden rounded-2xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Eq</TableHead>
                  <TableHead>Usuario 1</TableHead>
                  <TableHead>Usuario 2</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.map((team, index) => (
                  <TableRow key={team.id}>
                    <TableCell className="align-top font-medium tabular-nums">
                      {String(index + 1).padStart(2, "0")}
                    </TableCell>
                    <TableCell className="align-top whitespace-normal">
                      <MemberCell {...memberFields(team.empleado_id_a)} />
                    </TableCell>
                    <TableCell className="align-top whitespace-normal">
                      <MemberCell {...memberFields(team.empleado_id_b)} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          )}
          <DragOverlay>
            {draggingName ? (
              <div className="rounded-xl border bg-background px-2 py-1 text-sm shadow-md">
                {draggingName}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}

function MemberCell({ memberId, name, hasAccount, helpers, helpingName, disabled, wide }) {
  if (!memberId) {
    return <p className="text-sm text-muted-foreground">Sin asignar</p>;
  }

  const countingForSelf = !helpingName;

  return (
    <div className={wide ? "space-y-2" : "min-w-44 space-y-2 py-1"}>
      {countingForSelf && hasAccount ? (
        <PersonHandle id={memberId} name={name} disabled={disabled} wide={wide} />
      ) : (
        <div>
          <p className="font-medium leading-snug">{name}</p>
          {helpingName ? (
            <p className="text-sm leading-5 text-muted-foreground">Contando para {helpingName}</p>
          ) : (
            <p className="text-sm leading-5 text-muted-foreground">Sin usuario</p>
          )}
        </div>
      )}
      <HelperSlot memberId={memberId} helpers={helpers} disabled={disabled} wide={wide} />
    </div>
  );
}

function PersonHandle({ id, name, disabled, wide }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: personId(id),
    disabled,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "cursor-grab touch-none rounded-xl border bg-background px-3 py-2 text-sm font-medium leading-snug active:cursor-grabbing",
        wide ? "w-full whitespace-normal" : "w-fit px-2 py-1",
        isDragging && "opacity-40"
      )}
      {...listeners}
      {...attributes}
    >
      {name}
    </div>
  );
}

function HelperSlot({ memberId, helpers, disabled, wide }) {
  const { setNodeRef, isOver } = useDroppable({ id: slotId(memberId) });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-16 flex-wrap gap-1.5 rounded-xl border border-dashed px-3 py-2",
        isOver && "border-primary bg-primary/5"
      )}
    >
      {helpers.length === 0 ? (
        <p className={cn("self-center text-muted-foreground", wide ? "text-sm leading-5" : "text-xs")}>
          {wide ? "Mantén pulsado un nombre y suéltalo aquí" : "Suelta aquí a quien cuenta para esta persona"}
        </p>
      ) : (
        helpers.map((helper) => (
          <PersonHandle key={helper.id} id={helper.id} name={helper.name} disabled={disabled} wide={wide} />
        ))
      )}
    </div>
  );
}
