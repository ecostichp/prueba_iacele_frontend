import { useLocation } from "react-router"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useCounts } from "@/context/counts"
import { STAGE_PATH, stageTone } from "@/lib/stage"

const pageTitles = {
  "/": "Mis registros",
  "/inventory_register": "Registrar inventario",
  "/database/inventory": "Base de datos",
  "/database/stages": "Etapas inventario",
  "/all_records": "Todos los registros",
  "/metrics": "Métricas individuales",
  "/metrics_differences": "Métricas diferencias",
  "/coworkers": "Mis compañeros",
  "/teams": "Asignados y Contadores",
  "/all_teams": "Todos los equipos",
  "/team_differences": "Diferencias en equipo",
  "/double_counts": "Conteos dobles",
  "/manager_counts": "Conteos gerentes",
}

function firstName(name) {
  const text = (name || "").trim()
  return text ? text.split(/\s+/)[0] : ""
}

export function SiteHeader() {
  const { pathname } = useLocation()
  const { helping, assignedName, stage } = useCounts()
  const tone = stageTone(stage)
  const onRegister = pathname === "/inventory_register"
  const onStagePage = pathname === (STAGE_PATH[stage] || "/")
  const countingForSomeone = stage === "individual" && helping && (pathname === "/" || onRegister)
  const assignedLabel = firstName(assignedName)
  const title = countingForSomeone && pathname === "/" && assignedLabel
    ? `Registros de ${assignedLabel}`
    : pageTitles[pathname] || "Inventario"
  const coloredHeader = tone === "primary"
    ? pathname === "/" || countingForSomeone
    : onStagePage || onRegister
  const headerTone = tone === "difference"
    ? "bg-difference text-white"
    : tone === "mono"
      ? "bg-foreground text-background"
      : countingForSomeone
        ? "bg-helping text-white"
        : "bg-primary text-white"
  const headerInk = tone === "mono" && coloredHeader
    ? "text-background hover:bg-background/15 hover:text-background"
    : "text-white hover:bg-white/15 hover:text-white"
  const headerLine = tone === "mono" && coloredHeader ? "bg-background/40" : "bg-white/40"

  return (
    <header className={`flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) ${coloredHeader ? `border-transparent md:rounded-t-2xl ${headerTone}` : ""}`}>
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className={coloredHeader ? `-ml-1 ${headerInk}` : "-ml-1"} />
        <Separator
          orientation="vertical"
          className={coloredHeader ? `mx-2 h-4 data-vertical:self-auto ${headerLine}` : "mx-2 h-4 data-vertical:self-auto"}
        />
        <h1 className="text-base font-medium">{title}</h1>
      </div>
    </header>
  )
}
