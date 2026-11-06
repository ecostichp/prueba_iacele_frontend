import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router";

import { API_URL } from "@/constants/api";
import { useAuth } from "@/context/auth";

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
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ListXIcon, UserGroupIcon, DatabaseIcon, FileChartColumnIcon, Layers2Icon, NotebookPen, UsersIcon } from "lucide-react";

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
  ],
  managers: [
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
function canSeeManagerMenu(user, jobTitle) {
  if (!user) return false;
  if (user.tipo === "accionista" || user.username === "lic") return true;
  const title = (jobTitle || "").trim().toLocaleLowerCase("es-MX");
  if (title === "administración general") return true;
  return title.startsWith("gerente");
}

export function AppSidebar({
  ...props
}) {
  const { user } = useAuth();
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

  const showManagers = canSeeManagerMenu(user, jobTitle);

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
        <NavMain items={navigation.navMain} />
        {showManagers && <NavDocuments items={navigation.managers} />}
        <NavSecondary items={navigation.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
