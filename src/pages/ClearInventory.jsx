import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import { Dialog } from "@base-ui/react/dialog";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { API_URL } from "@/constants/api";
import { useAuth } from "@/context/auth";
import { useCounts } from "@/context/counts";
import { canSeeDatabaseMenu } from "@/lib/access";

export default function ClearInventory() {
  const { user, token } = useAuth();
  const { refresh } = useCounts();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState("ask");
  const [seconds, setSeconds] = useState(5);
  const [pending, setPending] = useState(false);
  const [access, setAccess] = useState("loading");

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
    if (phase !== "countdown") return undefined;
    if (seconds <= 0) {
      setPhase("ready");
      return undefined;
    }
    const timeoutId = setTimeout(() => setSeconds((current) => current - 1), 1000);
    return () => clearTimeout(timeoutId);
  }, [phase, seconds]);

  const reset = () => {
    setOpen(false);
    setPhase("ask");
    setSeconds(5);
    setPending(false);
  };

  const startCountdown = () => {
    setSeconds(5);
    setPhase("countdown");
  };

  const eraseInventory = async () => {
    setPending(true);
    try {
      const accessToken = token || localStorage.getItem("iaCeleAppToken");
      const response = await axios.delete(`${API_URL}inventory/registers`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      await refresh();
      const deleted = Number(response.data?.deleted ?? 0);
      toast.success(
        `Se borraron ${deleted.toLocaleString("es-MX")} registros de inventario.`
      );
      reset();
    } catch (error) {
      const detail = error.response?.data?.detail;
      toast.error(
        typeof detail === "string"
          ? detail
          : "No se pudieron borrar los registros de inventario."
      );
      setPending(false);
    }
  };

  if (access !== "allowed") return null;

  const countdownButtonLabel = phase === "countdown" ? String(seconds) : "Borrar ahora";

  return (
    <div className="w-full space-y-4 p-4 sm:space-y-6 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Borrar inventario</h1>
        <p className="text-sm text-muted-foreground">
          Se borran todos los conteos. Los productos, los equipos y los empleados se quedan.
        </p>
      </div>
      <Button
        type="button"
        variant="destructive"
        onClick={() => {
          setPhase("ask");
          setSeconds(5);
          setOpen(true);
        }}
      >
        Borrar todos los registros de inventario
      </Button>

      <Dialog.Root
        open={open}
        onOpenChange={(nextOpen) => {
          if (pending) return;
          if (!nextOpen) reset();
        }}
      >
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40" />
          <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 w-[min(24rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-2xl border bg-popover p-6 text-popover-foreground shadow-lg outline-none">
            <Dialog.Title className="text-base font-semibold">
              ¿Borrar todos los registros de inventario?
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-muted-foreground">
              {phase === "ask"
                ? "Esta acción quita todos los conteos. No borra productos, equipos ni empleados."
                : phase === "countdown"
                  ? "El botón no sirve hasta que termine la cuenta."
                  : "Vuelve a picar el botón para borrar todos los registros."}
            </Dialog.Description>
            <div className="mt-6 flex justify-end">
              {phase === "ask" ? (
                <Button type="button" variant="destructive" onClick={startCountdown}>
                  Borrar
                </Button>
              ) : (
                <Button
                  type="button"
                  variant={phase === "countdown" ? "secondary" : "destructive"}
                  disabled={phase === "countdown" || pending}
                  className={phase === "countdown" ? "disabled:opacity-100" : undefined}
                  onClick={eraseInventory}
                >
                  {pending ? "Borrando..." : countdownButtonLabel}
                </Button>
              )}
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
