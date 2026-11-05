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
import { EllipsisVerticalIcon, CircleUserRoundIcon, Settings2Icon, BellIcon, LogOutIcon } from "lucide-react"
import { useContext } from 'react'
import { useNavigate } from "react-router";
import { TokenContext, CurrentUserContext } from '../context/Context'
import ToggleDarkModeMode from "../components/ToggleDarkMode";


const avatars = import.meta.glob(
  "../assets/avatars/*.png",
  {
    eager: true,
    query: "?url",
    import: "default",
  }
);


export function NavUser() {

  const { isMobile } = useSidebar()
  const navigate = useNavigate()

  const user = useContext(CurrentUserContext)
  const avatarSrc = avatars[`../assets/avatars/${user.avatar}`]

  const { setToken } = useContext(TokenContext)

  const handleLogout = (e) => {
    navigate("/")
    localStorage.removeItem("iaCeleAppToken")
    setToken(null)
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
              <AvatarImage src={avatarSrc} alt={user.username} />
              <AvatarFallback className="rounded-lg">{user.username[0]}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.username}</span>
              <span className="truncate text-xs text-foreground/70">
                {user.tipo}
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
                    <AvatarImage src={avatarSrc} alt={user.username} />
                    <AvatarFallback className="rounded-lg">{user.username[0]}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.username}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user.tipo}
                    </span>
                  </div>
                  <ToggleDarkModeMode />
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Settings2Icon
                />
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
