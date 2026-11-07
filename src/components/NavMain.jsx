import { useCounts } from "@/context/counts";
import { stageTone } from "@/lib/stage";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { CirclePlusIcon } from "lucide-react";
import { Link, useLocation } from "react-router";

const registerButton =
  "min-w-8 duration-200 ease-linear";
const ownCount =
  "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground data-active:bg-primary data-active:text-primary-foreground data-active:hover:bg-primary/90 data-active:hover:text-primary-foreground";
const teamCount =
  "bg-difference text-white hover:bg-difference/90 hover:text-white active:bg-difference/90 active:text-white data-active:bg-difference data-active:text-white data-active:hover:bg-difference/90 data-active:hover:text-white";
const helpingCount =
  "bg-helping text-white hover:bg-helping/90 hover:text-white active:bg-helping/90 active:text-white data-active:bg-helping data-active:text-white data-active:hover:bg-helping/90 data-active:hover:text-white";
const monoCount =
  "bg-foreground text-background hover:bg-foreground/90 hover:text-background active:bg-foreground/90 active:text-background data-active:bg-foreground data-active:text-background data-active:hover:bg-foreground/90 data-active:hover:text-background";

export function NavMain() {
  const { pathname } = useLocation();
  const { stage, helping } = useCounts();
  const tone = stageTone(stage);
  const buttonClass = tone === "difference"
    ? teamCount
    : tone === "mono"
      ? monoCount
      : helping
        ? helpingCount
        : ownCount;

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              render={<Link to="/inventory_register" />}
              isActive={pathname === "/inventory_register"}
              tooltip="Registrar inventario"
              data-tone={tone === "primary" ? undefined : tone}
              className={`${registerButton} ${buttonClass}`}
            >
              <CirclePlusIcon />
              <span>Registrar inventario</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
