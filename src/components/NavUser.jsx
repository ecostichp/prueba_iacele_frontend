import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useEffect, useState } from "react"
import axios from "axios"
import { EllipsisVerticalIcon, Settings2Icon, LogOutIcon } from "lucide-react"
import { useAuth } from "@/context/auth";
import ThemeToggle from "@/components/ThemeToggle";
import { avatarUrl } from "@/lib/avatars";
import { API_URL } from "@/constants/api";


export function NavUser() {

  const { isMobile } = useSidebar()
  const { user, logout } = useAuth()
  const [employee, setEmployee] = useState(null)
  const avatarSrc = avatarUrl(user?.avatar)
  const initial = (user?.username || "?").slice(0, 1).toUpperCase()
  const jobTitle = employee?.job_title || user?.tipo
  const employeeName = employee?.name || user?.tipo

  useEffect(() => {
    const employeeId = Number(user?.empleado_id) || null
    if (!employeeId) {
      setEmployee(null)
      return undefined
    }

    let cancelled = false
    axios.get(`${API_URL}employees/id/${employeeId}`).then((response) => {
      if (!cancelled) setEmployee(response.data)
    }).catch(() => {
      if (!cancelled) setEmployee(null)
    })

    return () => {
      cancelled = true
    }
  }, [user?.empleado_id])

  const handleLogout = () => {
    logout()
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton size="lg" className="aria-expanded:bg-muted" />
            }
          >
            <Avatar className="size-8 rounded-lg">
              <AvatarImage src={avatarSrc} alt={user?.username || ""} />
              <AvatarFallback className="rounded-lg">{initial}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user?.username}</span>
              <span className="truncate text-xs text-foreground/70">
                {jobTitle}
              </span>
            </div>
            <EllipsisVerticalIcon className="ml-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="size-8">
                    <AvatarImage src={avatarSrc} alt={user?.username || ""} />
                    <AvatarFallback className="rounded-lg">{initial}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user?.username}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {employeeName}
                    </span>
                  </div>
                  <ThemeToggle />
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                disabled
                className="text-muted-foreground/35 focus:bg-transparent focus:text-muted-foreground/40 data-disabled:opacity-100 [&_svg]:text-muted-foreground/35"
              >
                <Settings2Icon />
                Configuración
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOutIcon
              />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
