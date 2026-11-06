import { useEffect, useState } from "react";
import axios from "axios";
import { Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";
import BACKEND_URL from "@/constants/values";
import { useMyCounts } from "@/context/MyCountsContext";
import { formatCaboDate } from "@/lib/datetime";

const formatQty = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return "0";
  return Number.isInteger(number)
    ? number.toLocaleString("es-MX")
    : number.toLocaleString("es-MX", { maximumFractionDigits: 2 });
};

const formatDate = (value) => formatCaboDate(value) || "—";

const errorDetail = (error, fallback) =>
  error?.response?.data?.detail || fallback;

export default function TableCellViewer({ item, open: openProp, onOpenChange }) {
  const isMobile = useIsMobile();
  const { employeeId, teamId, refresh } = useMyCounts();
  const [openState, setOpenState] = useState(false);
  const open = openProp ?? openState;
  const setOpen = onOpenChange ?? setOpenState;
  const controlled = onOpenChange != null;
  const [qty, setQty] = useState("");
  const [registers, setRegisters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [formError, setFormError] = useState("");

  const title = item.name || item.header || "Producto";
  const totalQty = registers.reduce(
    (sum, register) => sum + Number(register.count_qty || 0),
    0
  );

  const loadRegisters = async () => {
    if (!employeeId || !item?.id) {
      setRegisters([]);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `${BACKEND_URL}inventory/individuals/id/${employeeId}/product/${item.id}`
      );
      const payload = response.data?.[0];
      const rows = payload?.registers ?? [];
      rows.sort(
        (a, b) => new Date(b.date_create || 0) - new Date(a.date_create || 0)
      );
      setRegisters(rows);
    } catch (error) {
      setRegisters([]);
      setFormError(errorDetail(error, "No se pudieron cargar tus conteos."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    setFormError("");
    loadRegisters();
  }, [open, employeeId, item?.id]);

  const saveCount = async (event) => {
    event.preventDefault();
    const count = Number(qty);

    if (!employeeId) {
      setFormError("Tu cuenta no está ligada a un empleado.");
      return;
    }
    if (!teamId) {
      setFormError("Tu usuario no tiene un equipo asignado.");
      return;
    }
    if (!Number.isFinite(count) || count <= 0) {
      setFormError("Escribe una cantidad mayor que cero.");
      return;
    }

    setSaving(true);
    setFormError("");
    try {
      await axios.post(`${BACKEND_URL}inventory/registers/new`, {
        id_products: item.id,
        count_qty: count,
        assigned_team_id: teamId,
        assigned_user_id: employeeId,
        counting_user_id: employeeId,
        count_type: "individual",
      });
      setQty("");
      await loadRegisters();
      await refresh();
      toast.success("Conteo guardado");
    } catch (error) {
      setFormError(errorDetail(error, "No se pudo guardar el conteo."));
    } finally {
      setSaving(false);
    }
  };

  const deleteCount = async (registerId) => {
    setDeletingId(registerId);
    setFormError("");
    try {
      await axios.delete(`${BACKEND_URL}inventory/id/${registerId}`);
      await loadRegisters();
      await refresh();
      toast.success("Conteo eliminado");
    } catch (error) {
      setFormError(errorDetail(error, "No se pudo borrar el conteo."));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Drawer
      open={open}
      onOpenChange={setOpen}
      swipeDirection={isMobile ? "down" : "right"}
    >
      {!controlled && (
        <DrawerTrigger
          render={
            <Button
              variant="link"
              className="h-auto w-full min-w-0 justify-start px-0 text-left whitespace-normal text-foreground"
            />
          }
        >
          {title}
        </DrawerTrigger>
      )}
      <DrawerContent className="data-[swipe-axis=y]:[--drawer-content-max-height:92dvh]! data-[swipe-axis=x]:sm:[--drawer-content-width:42rem]!">
        <DrawerHeader className="text-left">
          <DrawerTitle className="text-lg leading-snug">{title}</DrawerTitle>
          <DrawerDescription>
            Código {item.code || "—"}. Registra la cantidad que contaste.
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-4 py-4">
          <form onSubmit={saveCount} className="flex flex-col gap-3">
            <Label htmlFor={`qty-${item.id}`}>Cantidad</Label>
            <div className="flex items-center gap-2">
              <Input
                id={`qty-${item.id}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                placeholder="0"
                value={qty}
                onChange={(event) => setQty(event.target.value)}
                className="h-12 flex-1 text-lg"
              />
              <Button
                type="submit"
                size="icon-lg"
                className="size-12 shrink-0 rounded-full"
                disabled={saving || !employeeId}
                aria-label="Guardar conteo"
              >
                <Save />
              </Button>
            </div>
            {!employeeId && (
              <p className="text-sm text-muted-foreground">
                Tu cuenta no está ligada a un empleado, así que no puede guardar conteos.
              </p>
            )}
            {formError && (
              <p className="text-sm text-destructive">{formError}</p>
            )}
          </form>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3 rounded-2xl border bg-muted/40 px-4 py-3">
              <div>
                <h3 className="text-sm font-medium">Total contado</h3>
                <p className="text-xs text-muted-foreground">
                  Suma de tus conteos de este producto
                </p>
              </div>
              <p className="text-3xl font-semibold tabular-nums tracking-tight">
                {loading ? "…" : formatQty(totalQty)}
              </p>
            </div>
            <div className="overflow-hidden rounded-2xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="w-12 text-right">
                      <span className="sr-only">Borrar</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="h-16 text-center">
                        Cargando conteos...
                      </TableCell>
                    </TableRow>
                  ) : registers.length > 0 ? (
                    registers.map((register) => (
                      <TableRow key={register.id}>
                        <TableCell className="font-medium">
                          {formatQty(register.count_qty)}
                        </TableCell>
                        <TableCell>{formatDate(register.date_create)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            disabled={deletingId === register.id}
                            aria-label="Borrar conteo"
                            onClick={() => deleteCount(register.id)}
                          >
                            <Trash2 />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="h-16 text-center">
                        Todavía no tienes conteos de este producto.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <DrawerFooter>
          <DrawerClose render={<Button variant="outline" className="w-full" />}>
            Cerrar
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
