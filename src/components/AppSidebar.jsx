import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router";

import { API_URL } from "@/constants/api";
import { useAuth } from "@/context/auth";
import { useCounts } from "@/context/counts";
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
import { ArrowUpNarrowWideIcon, ListXIcon, LockKeyholeIcon, LockKeyholeOpenIcon, UserGroupIcon, DatabaseIcon, FileChartColumnIcon, Layers2Icon, NotebookPen, Trash2Icon, UsersIcon, UsersRoundCollaborationIcon } from "lucide-react";
import { STAGE_PATH } from "@/lib/stage";

function UserExclamationPointIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="lucide lucide-user-exclamation-point"
    >
      <path d="M15 15H9a4 4 0 00-4 4v2" />
      <path d="M18.988 13v4" />
      <path d="M18.988 21h.01" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

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
      url: "/team_differences",
      icon: (
        <ListXIcon
        />
      ),
    },
    {
      title: "Conteos dobles",
      url: "/double_counts",
      icon: (
        <Layers2Icon
        />
      ),
    },
    {
      title: "Conteos gerentes",
      url: "/manager_counts",
      icon: (
        <UserExclamationPointIcon />
      ),
    },
  ],
  navSecondary: [
    {
      title: "Mis compañeros",
      url: "/coworkers",
      icon: (
        <UserGroupIcon
        />
      ),
    },
    {
      title: "Todos los equipos",
      url: "/all_teams",
      icon: (
        <UsersIcon
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
      url: "/metrics",
      icon: (
        <FileChartColumnIcon
        />
      ),
    },
    {
      name: "Asignados y Contadores",
      url: "/teams",
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
  const { helping, assignedName, stage } = useCounts();
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
  const [loginOpen, setLoginOpen] = useState(true);

  useEffect(() => {
    if (!showDatabase) return undefined;

    let cancelled = false;
    const loadAccess = () => {
      axios
        .get(`${API_URL}authentication/access`)
        .then((response) => {
          if (!cancelled) setLoginOpen(response.data?.login_open !== false);
        })
        .catch(() => {});
    };

    loadAccess();
    const intervalId = setInterval(loadAccess, 4000);
    window.addEventListener("iacele-access", loadAccess);
    return () => {
      cancelled = true;
      clearInterval(intervalId);
      window.removeEventListener("iacele-access", loadAccess);
    };
  }, [showDatabase]);

  const assignedLabel = (assignedName || "").trim().split(/\s+/)[0];
  const inventoryItems = navigation.navMain.map((item) => {
    let next = item;
    if (item.url === "/" && helping && assignedLabel) {
      next = { ...next, title: `Registros de ${assignedLabel}` };
    }
    const activeUrl = STAGE_PATH[stage] || "/";
    if (Object.values(STAGE_PATH).includes(item.url) && item.url !== activeUrl) {
      next = { ...next, disabled: true };
    }
    return next;
  });

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
        <NavSecondary label="Inventario" items={inventoryItems} />
        <NavSecondary label="Personas" items={navigation.navSecondary} />
        {showManagers && (
          <NavDocuments
            items={navigation.managers.map((item) => (
              item.url === "/teams" && stage !== "individual"
                ? { ...item, disabled: true }
                : item
            ))}
          />
        )}
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
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link to="/database/stages" />}
                  isActive={pathname === "/database/stages"}
                  tooltip="Etapas inventario"
                >
                  <ArrowUpNarrowWideIcon />
                  <span>Etapas inventario</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link to="/database/access" />}
                  isActive={pathname === "/database/access"}
                  tooltip={loginOpen ? "Entrada abierta" : "Entrada cerrada"}
                >
                  {loginOpen ? <LockKeyholeOpenIcon /> : <LockKeyholeIcon />}
                  <span>{loginOpen ? "Entrada abierta" : "Entrada cerrada"}</span>
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
