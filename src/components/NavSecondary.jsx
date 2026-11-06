"use client"

import { Link } from "react-router"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"


const pendingItemClass =
  "text-muted-foreground/35 hover:bg-transparent hover:text-muted-foreground/40 [&_svg]:text-muted-foreground/35";

export function NavSecondary({ items, ...props }) {

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const pending = !item.url || item.url === "#";
            return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                render={pending ? <button type="button" /> : <Link to={item.url} />}
                aria-disabled={pending || undefined}
                className={pending ? pendingItemClass : undefined}
              >
                {item.icon}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
