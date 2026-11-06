import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

import { useIsMobile } from "@/hooks/use-mobile"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const FIELD_LABELS = {
  code: "Código",
  name: "Producto",
  cost: "Costo",
  price: "Precio",
  id_odoo: "ID Odoo",
  fecha_alta: "Alta",
  type: "Tipo",
  status: "Estado",
  target: "Objetivo",
  limit: "Límite",
  reviewer: "Revisor",
}

export default function TableCellViewer({
  item
}) {
  const isMobile = useIsMobile()
  const title = item.header || item.name || "Detalle"
  const fields = Object.entries(item).filter(
    ([key, value]) =>
      key !== "header" &&
      key !== "id" &&
      value != null &&
      typeof value !== "object"
  )

  return (
    <Drawer swipeDirection={isMobile ? "down" : "right"}>
      <DrawerTrigger
        render={
          <Button
            variant="link"
            className="w-fit px-0 text-left text-foreground"
          />
        }
      >
        {title}
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>
            Detalle del registro seleccionado.
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          <div className={isMobile ? "grid grid-cols-1 gap-4" : "grid grid-cols-2 gap-4"}>
            {fields.map(([key, value]) => (
              <div key={key} className="flex flex-col gap-3">
                <Label htmlFor={`detail-${key}`}>
                  {FIELD_LABELS[key] || key}
                </Label>
                <Input id={`detail-${key}`} readOnly value={String(value)} />
              </div>
            ))}
          </div>
        </div>
        <DrawerFooter>
          <DrawerClose render={<Button variant="outline" />}>Cerrar</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
