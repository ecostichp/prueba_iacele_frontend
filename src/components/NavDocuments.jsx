"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Link, useLocation } from "react-router"
import { MoreHorizontalIcon, FolderIcon, ShareIcon, Trash2Icon } from "lucide-react"
export function NavDocuments({ items }) {

  const { isMobile } = useSidebar()
  const { pathname } = useLocation()
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Gerentes</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const pending = !item.url || item.url === "#";
          return (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton
              render={pending ? <button type="button" /> : <Link to={item.url} />}
              isActive={!pending && pathname === item.url}
              aria-disabled={pending || undefined}
              className={pending ? "text-muted-foreground/35 hover:bg-transparent hover:text-muted-foreground/40 [&_svg]:text-muted-foreground/35" : undefined}
            >
              {item.icon}
              <span>{item.name}</span>
            </SidebarMenuButton>
            {pending && <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuAction
                    showOnHover
                    className="text-muted-foreground/35 aria-expanded:bg-muted [&_svg]:text-muted-foreground/35"
                  />
                }
              >
                <MoreHorizontalIcon />
                <span className="sr-only">Más acciones</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-36"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownMenuItem>
                  <FolderIcon />
                  Abrir
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ShareIcon />
                  Compartir
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">
                  <Trash2Icon />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>}
          </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
