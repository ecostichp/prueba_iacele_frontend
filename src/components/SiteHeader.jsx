import { useLocation } from "react-router"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

const pageTitles = {
  "/": "Mis registros",
  "/inventory_register": "Registrar inventario",
  "/database/inventory": "Base de datos",
  "/all_records": "Todos los registros",
  "/metrics": "Métricas",
  "/coworkers": "Mis compañeros",
}

export function SiteHeader() {
  const { pathname } = useLocation()
  const title = pageTitles[pathname] || "Inventario"
  const recordsView = pathname === "/"

  return (
    <header className={`flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) ${recordsView ? "border-transparent bg-primary text-primary-foreground md:rounded-t-2xl" : ""}`}>
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className={recordsView ? "-ml-1 text-primary-foreground hover:bg-white/15 hover:text-primary-foreground" : "-ml-1"} />
        <Separator
          orientation="vertical"
          className={recordsView ? "mx-2 h-4 bg-white/40 data-vertical:self-auto" : "mx-2 h-4 data-vertical:self-auto"}
        />
        <h1 className="text-base font-medium">{title}</h1>
      </div>
    </header>
  )
}
