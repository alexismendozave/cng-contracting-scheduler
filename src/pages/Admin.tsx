
import { Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import AdminDashboard from "@/components/admin/AdminDashboard";
import ServicesManagement from "@/components/admin/ServicesManagement";
import BookingsManagement from "@/components/admin/BookingsManagement";
import CompanyManagement from "@/components/admin/CompanyManagement";
import PaymentMethodsManagement from "@/components/admin/PaymentMethodsManagement";
import CustomizationManagement from "@/components/admin/CustomizationManagement";
import EnhancedZoneMapWrapper from "@/components/admin/wrappers/EnhancedZoneMapWrapper";
import UserManagement from "@/components/admin/UserManagement";
import ApiConfigurationWrapper from "@/components/admin/wrappers/ApiConfigurationWrapper";
import OrdersManagement from "@/components/admin/OrdersManagement";
import EmailConfiguration from "@/components/admin/EmailConfiguration";
import NotificationsManagement from "@/components/admin/NotificationsManagement";
import { HandymenManagement } from "@/components/admin/HandymenManagement";
import { AvailabilityManagement } from "@/components/admin/AvailabilityManagement";

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
              <Route path="services" element={<ServicesManagement />} />
              <Route path="bookings" element={<BookingsManagement />} />
              <Route path="company" element={<CompanyManagement />} />
              <Route path="customization" element={<CustomizationManagement />} />
              <Route path="payments" element={<PaymentMethodsManagement />} />
              <Route path="zones" element={<EnhancedZoneMapWrapper />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="apis" element={<ApiConfigurationWrapper />} />
              <Route path="orders" element={<OrdersManagement />} />
              <Route path="email" element={<EmailConfiguration />} />
              <Route path="notifications" element={<NotificationsManagement />} />
              <Route path="handymen" element={<HandymenManagement />} />
              <Route path="availability" element={<AvailabilityManagement />} />
              <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
            </Routes>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Admin;
