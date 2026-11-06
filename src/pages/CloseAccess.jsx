import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import { Dialog } from "@base-ui/react/dialog";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { API_URL } from "@/constants/api";
import { useAuth } from "@/context/auth";
import { canSeeDatabaseMenu } from "@/lib/access";
import { cn } from "@/lib/utils";

export default function CloseAccess() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [access, setAccess] = useState("loading");
  const [loginOpen, setLoginOpen] = useState(null);
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
    const accessToken = token || localStorage.getItem("iaCeleAppToken");
    let cancelled = false;
    axios
      .get(`${API_URL}authentication/access`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((response) => {
        if (!cancelled) setLoginOpen(response.data?.login_open !== false);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [access, token]);

  const applyChange = async () => {
    const nextOpen = !loginOpen;
    setPending(true);
    try {
      const accessToken = token || localStorage.getItem("iaCeleAppToken");
      const response = await axios.put(
        `${API_URL}authentication/access`,
        { login_open: nextOpen },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const open = response.data?.login_open !== false;
      setLoginOpen(open);
      window.dispatchEvent(new CustomEvent("iacele-access"));
      toast.success(
        nextOpen
          ? "La entrada quedó abierta. El personal puede iniciar sesión."
          : "La entrada quedó cerrada. El personal sale de la app y no puede volver a entrar."
      );
      setConfirmOpen(false);
    } catch (error) {
      const detail = error.response?.data?.detail;
      toast.error(
        typeof detail === "string" ? detail : "No se pudo cambiar la entrada."
      );
    } finally {
      setPending(false);
    }
  };

  if (access === "loading" || (loginOpen === null && !loadError)) {
    return <p className="p-6 text-sm text-muted-foreground">Cargando…</p>;
  }
  if (access !== "allowed") return null;
  if (loadError) {
    return (
      <p className="p-6 text-sm text-muted-foreground">
        No se pudo leer si la entrada está abierta.
      </p>
    );
  }

  const closing = loginOpen;

  return (
    <div className="w-full space-y-4 p-4 sm:space-y-6 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Cerrar entrada</h1>
        <p className="text-sm text-muted-foreground">
          Apagada, el personal sale de la app y no puede volver a entrar. Tú sí puedes entrar para encenderla otra vez.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={loginOpen}
          aria-label={loginOpen ? "Entrada abierta" : "Entrada cerrada"}
          disabled={pending}
          onClick={() => setConfirmOpen(true)}
          className={cn(
            "relative h-8 w-14 shrink-0 rounded-full transition-colors",
            loginOpen ? "bg-primary" : "bg-muted"
          )}
        >
          <span
            className={cn(
              "absolute top-1 size-6 rounded-full bg-background shadow transition-transform",
              loginOpen ? "left-7" : "left-1"
            )}
          />
        </button>
        <div>
          <p className="text-sm font-medium">{loginOpen ? "Abierta" : "Cerrada"}</p>
          <p className="text-sm text-muted-foreground">
            {loginOpen
              ? "El personal puede iniciar sesión."
              : "Nadie del personal puede iniciar sesión."}
          </p>
        </div>
      </div>

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
              {closing ? "¿Cerrar la entrada?" : "¿Abrir la entrada?"}
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-muted-foreground">
              {closing
                ? "El personal sale de la app y no puede volver a entrar hasta que la abras."
                : "El personal podrá iniciar sesión otra vez."}
            </Dialog.Description>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={pending}
                onClick={() => setConfirmOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant={closing ? "destructive" : "default"}
                disabled={pending}
                onClick={applyChange}
              >
                {pending ? "Guardando..." : closing ? "Cerrar entrada" : "Abrir entrada"}
              </Button>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
