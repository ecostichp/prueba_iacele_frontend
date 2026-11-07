"use client"

import { Link, useLocation } from "react-router"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"


const pendingItemClass =
  "text-muted-foreground/35 hover:bg-transparent hover:text-muted-foreground/40 [&_svg]:text-muted-foreground/35";

export function NavSecondary({ items, label, ...props }) {
  const { pathname } = useLocation();

  return (
    <SidebarGroup {...props}>
      {label ? <SidebarGroupLabel>{label}</SidebarGroupLabel> : null}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const pending = item.disabled || !item.url || item.url === "#";
            return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                render={pending ? <button type="button" /> : <Link to={item.url} />}
                isActive={!pending && pathname === item.url}
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
