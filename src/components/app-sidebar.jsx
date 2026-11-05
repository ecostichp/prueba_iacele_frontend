import { Link } from "react-router";

import miLogo from '@/assets/brand/Logo2021.png';
import miLogoNegativo from '@/assets/brand/LogoNegativo2021.png';
import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ListXIcon, UserGroupIcon, DatabaseIcon, FileChartColumnIcon, Layers2Icon, NotebookPen, LayoutDashboardIcon, UsersIcon } from "lucide-react";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: (
        <LayoutDashboardIcon />
      ),
    },
    {
      title: "Mis registros de inventario",
      url: "/inventory",
      icon: (
        <NotebookPen />
      ),
    },
    {
      title: "Diferencias en equipo",
      url: "#",
      icon: (
        <ListXIcon
        />
      ),
    },
    {
      title: "Conteos dobles",
      url: "#",
      icon: (
        <Layers2Icon
        />
      ),
    },
  ],
  navSecondary: [
    {
      title: "Mi equipo",
      url: "#",
      icon: (
        <UsersIcon
        />
      ),
    },
  ],
  gerentes: [
    {
      name: "Todos los registros",
      url: "#",
      icon: (
        <DatabaseIcon
        />
      ),
    },
    {
      name: "Métricas",
      url: "#",
      icon: (
        <FileChartColumnIcon
        />
      ),
    },
    {
      name: "Todos los equipos",
      url: "#",
      icon: (
        <UserGroupIcon
        />
      ),
    },
  ],
}
export function AppSidebar({
  ...props
}) {

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="flex justify-center items-center data-[slot=sidebar-menu-button]:p-1.5! w-full"
            >
              <Link to="/">
                <img src={miLogo} alt="La Casa Del Carpintero" className="dark:hidden block mx-auto w-auto h-9 object-contain" />
                <img src={miLogoNegativo} alt="La Casa Del Carpintero" className="hidden dark:block mx-auto w-auto h-9 object-contain" />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.gerentes} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
