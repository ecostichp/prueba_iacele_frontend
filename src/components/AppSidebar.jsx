import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router";

import { API_URL } from "@/constants/api";
import { useAuth } from "@/context/auth";
import { canSeeDatabaseMenu, canSeeManagerMenu } from "@/lib/access";

import logo from "@/assets/brand/Logo2021.png";
import inverseLogo from "@/assets/brand/LogoNegativo2021.png";
import { NavDocuments } from "@/components/NavDocuments";
import { NavMain } from "@/components/NavMain";
import { NavSecondary } from "@/components/NavSecondary";
import { NavUser } from "@/components/NavUser";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ListXIcon, UserGroupIcon, DatabaseIcon, FileChartColumnIcon, Layers2Icon, NotebookPen, Trash2Icon, UsersIcon, UsersRoundCollaborationIcon } from "lucide-react";

const navigation = {
  navMain: [
    {
      title: "Mis registros de inventario",
      url: "/",
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
    {
      title: "Mis compañeros",
      url: "/coworkers",
      icon: (
        <UserGroupIcon
        />
      ),
    },
  ],
  managers: [
    {
      name: "Todos los registros",
      url: "/all_records",
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
        <UsersRoundCollaborationIcon
        />
      ),
    },
  ],
}
export function AppSidebar({
  ...props
}) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [jobTitle, setJobTitle] = useState("");

  useEffect(() => {
    const employeeId = Number(user?.empleado_id) || null;
    if (!employeeId) {
      setJobTitle("");
      return;
    }

    let cancelled = false;
    axios.get(`${API_URL}employees/id/${employeeId}`).then((response) => {
      if (!cancelled) setJobTitle(response.data?.job_title || "");
    }).catch(() => {
      if (!cancelled) setJobTitle("");
    });

    return () => {
      cancelled = true;
    };
  }, [user?.empleado_id]);

  const showManagers = canSeeManagerMenu(jobTitle);
  const showDatabase = canSeeDatabaseMenu(jobTitle);

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link to="/" />}
              className="flex w-full items-center justify-center data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <img src={logo} alt="La Casa Del Carpintero" className="mx-auto block h-9 w-auto object-contain dark:hidden" />
              <img src={inverseLogo} alt="La Casa Del Carpintero" className="mx-auto hidden h-9 w-auto object-contain dark:block" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
        <NavSecondary label="Inventario" items={navigation.navMain} />
        <NavSecondary label="Personas" items={navigation.navSecondary} />
        {showManagers && <NavDocuments items={navigation.managers} />}
        {showDatabase && (
          <SidebarGroup className="mt-auto group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel>Base de datos</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link to="/database/inventory" />}
                  isActive={pathname === "/database/inventory"}
                  tooltip="Borrar inventario"
                >
                  <Trash2Icon />
                  <span>Borrar inventario</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
