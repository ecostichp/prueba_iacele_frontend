import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { CirclePlusIcon } from "lucide-react";
import { Link, useLocation } from "react-router";


const pendingItemClass =
  "text-muted-foreground/35 hover:bg-transparent hover:text-muted-foreground/40 [&_svg]:text-muted-foreground/35";

export function NavMain({ items }) {
  const { pathname } = useLocation();

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              render={<Link to="/inventory_register" />}
              isActive={pathname === "/inventory_register"}
              tooltip="Registrar inventario"
              className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground data-active:bg-primary data-active:text-primary-foreground data-active:hover:bg-primary/90 data-active:hover:text-primary-foreground"
            >
              <CirclePlusIcon />
              <span>Registrar inventario</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => {
            const pending = !item.url || item.url === "#";
            return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                render={pending ? <button type="button" /> : <Link to={item.url} />}
                isActive={!pending && pathname === item.url}
                tooltip={item.title}
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
