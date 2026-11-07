import { useCounts } from "@/context/counts";
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
const helpingCount =
  "bg-helping text-white hover:bg-helping/90 hover:text-white active:bg-helping/90 active:text-white data-active:bg-helping data-active:text-white data-active:hover:bg-helping/90 data-active:hover:text-white";

export function NavMain() {
  const { pathname } = useLocation();
  const { helping } = useCounts();

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              render={<Link to="/inventory_register" />}
              isActive={pathname === "/inventory_register"}
              tooltip="Registrar inventario"
              className={`${registerButton} ${helping ? helpingCount : ownCount}`}
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
