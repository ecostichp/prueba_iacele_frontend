import { useLocation } from "react-router"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useCounts } from "@/context/counts"

const pageTitles = {
  "/": "Mis registros",
  "/inventory_register": "Registrar inventario",
  "/database/inventory": "Base de datos",
  "/all_records": "Todos los registros",
  "/metrics": "Métricas",
  "/coworkers": "Mis compañeros",
  "/teams": "Asignados y Contadores",
  "/all_teams": "Todos los equipos",
}

function firstName(name) {
  const text = (name || "").trim()
  return text ? text.split(/\s+/)[0] : ""
}

export function SiteHeader() {
  const { pathname } = useLocation()
  const { helping, assignedName } = useCounts()
  const countingForSomeone = helping && (pathname === "/" || pathname === "/inventory_register")
  const assignedLabel = firstName(assignedName)
  const title = countingForSomeone && pathname === "/" && assignedLabel
    ? `Registros de ${assignedLabel}`
    : pageTitles[pathname] || "Inventario"
  const recordsView = pathname === "/"

  return (
    <header className={`flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) ${recordsView ? `border-transparent text-white md:rounded-t-2xl ${countingForSomeone ? "bg-helping" : "bg-primary"}` : countingForSomeone ? "border-transparent bg-helping text-white md:rounded-t-2xl" : ""}`}>
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className={(recordsView || countingForSomeone) ? "-ml-1 text-white hover:bg-white/15 hover:text-white" : "-ml-1"} />
        <Separator
          orientation="vertical"
          className={(recordsView || countingForSomeone) ? "mx-2 h-4 bg-white/40 data-vertical:self-auto" : "mx-2 h-4 data-vertical:self-auto"}
        />
        <h1 className="text-base font-medium">{title}</h1>
      </div>
    </header>
  )
}
