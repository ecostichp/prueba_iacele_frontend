import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import { Dialog } from "@base-ui/react/dialog";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { API_URL } from "@/constants/api";
import { useAuth } from "@/context/auth";
import { canSeeDatabaseMenu } from "@/lib/access";
import { INVENTORY_STAGES, stageById } from "@/lib/stage";
import { cn } from "@/lib/utils";

export default function InventoryStages() {
  const { user, token, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [access, setAccess] = useState("loading");
  const [current, setCurrent] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, setPending] = useState(false);

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
        setAccess(canSeeDatabaseMenu(response.data?.job_title) ? "allowed" : "denied");
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
    let cancelled = false;
    axios
      .get(`${API_URL}inventory/stage`)
      .then((response) => {
        if (cancelled) return;
        const stage = response.data?.stage || "individual";
        setCurrent(stage);
        setSelected(stage);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [access]);

  const applyChange = async () => {
    setPending(true);
    try {
      const accessToken = token || localStorage.getItem("iaCeleAppToken");
      const response = await axios.put(
        `${API_URL}inventory/stage`,
        { stage: selected },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const stage = response.data?.stage || selected;
      setCurrent(stage);
      setSelected(stage);
      window.dispatchEvent(new CustomEvent("iacele-stage"));
      await refreshUser();
      toast.success(`La etapa quedó en ${stageById(stage).label}.`);
      setConfirmOpen(false);
    } catch (error) {
      const detail = error.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "No se pudo cambiar la etapa.");
    } finally {
      setPending(false);
    }
  };

  if (access === "loading" || (current === null && !loadError)) {
    return <p className="p-6 text-sm text-muted-foreground">Cargando…</p>;
  }
  if (access !== "allowed") return null;
  if (loadError) {
    return <p className="p-6 text-sm text-muted-foreground">No se pudo leer la etapa del inventario.</p>;
  }

  const choice = stageById(selected);
  const dirty = selected !== current;

  return (
    <div className="w-full space-y-4 p-4 sm:space-y-6 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Etapas inventario</h1>
        <p className="text-sm text-muted-foreground">
          Solo puede estar activa una etapa. Al guardar, los registros nuevos quedan con ese tipo. Los conteos que ya existían no cambian.
        </p>
      </div>

      <fieldset className="space-y-3">
        <legend className="sr-only">Etapa del inventario</legend>
        {INVENTORY_STAGES.map((item) => {
          const active = selected === item.id;
          return (
            <label
              key={item.id}
              className={cn(
                "flex cursor-pointer gap-3 rounded-2xl border p-4",
                active ? "border-primary bg-primary/5" : "bg-card"
              )}
            >
              <input
                type="radio"
                name="inventory-stage"
                className="mt-1"
                checked={active}
                onChange={() => setSelected(item.id)}
              />
              <span>
                <span className="block text-sm font-medium">{item.label}</span>
                <span className="mt-1 block text-sm text-muted-foreground">{item.detail}</span>
              </span>
            </label>
          );
        })}
      </fieldset>

      <Button type="button" disabled={!dirty || pending} onClick={() => setConfirmOpen(true)}>
        Guardar
      </Button>

      <Dialog.Root
        open={confirmOpen}
        onOpenChange={(nextOpen) => {
          if (pending) return;
          setConfirmOpen(nextOpen);
        }}
      >
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40" />
          <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 w-[min(24rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-2xl border bg-popover p-6 text-popover-foreground shadow-lg outline-none">
            <Dialog.Title className="text-base font-semibold">
              ¿Dejar el inventario en {choice.label}?
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-muted-foreground">
              {choice.confirm}
            </Dialog.Description>
            <div className="mt-6 flex justify-end gap-2">
              <Button type="button" variant="outline" disabled={pending} onClick={() => setConfirmOpen(false)}>
                Cancelar
              </Button>
              <Button type="button" disabled={pending} onClick={applyChange}>
                {pending ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
