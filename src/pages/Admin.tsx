
import { Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import AdminDashboard from "@/components/admin/AdminDashboard";
import ServiceManagementWrapper from "@/components/admin/wrappers/ServiceManagementWrapper";
import EnhancedZoneMapWrapper from "@/components/admin/wrappers/EnhancedZoneMapWrapper";
import ApiConfigurationWrapper from "@/components/admin/wrappers/ApiConfigurationWrapper";
import PaymentMethodsWrapper from "@/components/admin/wrappers/PaymentMethodsWrapper";
import UserManagement from "@/components/admin/UserManagement";

const Admin = () => {
  const { profile, signOut } = useAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <SidebarInset className="flex-1">
          {/* Header */}
          <header className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border z-40">
            <div className="flex h-14 items-center gap-4 px-6">
              <SidebarTrigger />
              <div className="flex-1">
                <h1 className="text-lg font-semibold text-foreground">
                  Bienvenido, {profile?.full_name}
                </h1>
              </div>
              <Button onClick={signOut} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 p-6">
            <Routes>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="services" element={<ServiceManagementWrapper />} />
              <Route path="zones" element={<EnhancedZoneMapWrapper />} />
              <Route path="apis" element={<ApiConfigurationWrapper />} />
              <Route path="payments" element={<PaymentMethodsWrapper />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
            </Routes>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Admin;
