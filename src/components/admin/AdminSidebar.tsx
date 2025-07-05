import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Settings,
  FileText,
  Calendar,
  Zap,
  Users,
  Youtube,
} from "lucide-react";

const mainMenuItems = [
  { title: "Dashboard", url: "/admin/dashboard", icon: Settings },
  { title: "Servicios", url: "/admin/services", icon: FileText },
  { title: "Reservas", url: "/admin/bookings", icon: Calendar },
  { title: "Técnicos", url: "/admin/handymen", icon: Users },
  { title: "Disponibilidad", url: "/admin/availability", icon: Calendar },
  { title: "Zonas", url: "/admin/zones", icon: Zap },
];

const configMenuItems = [
  { title: "Compañía", url: "/admin/company", icon: Settings },
  { title: "APIs", url: "/admin/apis", icon: Youtube },
  { title: "Pedidos", url: "/admin/orders", icon: FileText },
  { title: "Correo", url: "/admin/email", icon: Settings },
  { title: "Notificaciones", url: "/admin/notifications", icon: Settings },
  { title: "Personalización", url: "/admin/customization", icon: Settings },
  { title: "Métodos de Pago", url: "/admin/payments", icon: Settings },
  { title: "Usuarios", url: "/admin/users", icon: Users },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary text-primary-foreground font-medium" 
      : "text-[#333333] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground";

  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">A</span>
          </div>
          {state === "expanded" && (
            <div>
              <h2 className="font-semibold text-foreground">Admin Panel</h2>
              <p className="text-xs text-muted-foreground">Gestión del sistema</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {state === "expanded" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Configuración</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {configMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {state === "expanded" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-4">
        <div className="text-xs text-muted-foreground text-center">
          {state === "expanded" ? "Sistema de Gestión v1.0" : "v1.0"}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}