
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AdminZoneMap from "@/components/AdminZoneMap";
import ServiceCreationForm from "@/components/admin/ServiceCreationForm";
import ServiceZonePricing from "@/components/admin/ServiceZonePricing";
import ApiConfiguration from "@/components/admin/ApiConfiguration";
import PaymentMethods from "@/components/admin/PaymentMethods";
import Analytics from "@/components/admin/Analytics";
import { Zone, Service, ServiceZonePrice, ApiConfig, PaymentMethod } from "@/components/admin/types";

const Admin = () => {
  const { user, profile, signOut } = useAuth();
  const [zones, setZones] = useState<Zone[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [serviceZonePrices, setServiceZonePrices] = useState<ServiceZonePrice[]>([]);
  const [apiConfigs, setApiConfigs] = useState<ApiConfig[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    try {
      // Fetch zones
      const { data: zonesData } = await supabase
        .from('zones')
        .select('*')
        .order('name');
      
      // Fetch services
      const { data: servicesData } = await supabase
        .from('services')
        .select('*')
        .order('name');
      
      // Fetch service zone prices
      const { data: serviceZoneData } = await supabase
        .from('service_zone_prices')
        .select('*');
      
      // Fetch API configs
      const { data: apiData } = await supabase
        .from('api_configs')
        .select('*')
        .order('name');
      
      // Fetch payment methods
      const { data: paymentData } = await supabase
        .from('payment_methods')
        .select('*')
        .order('name');

      setZones(zonesData || []);
      setServices(servicesData || []);
      setServiceZonePrices(serviceZoneData || []);
      setApiConfigs(apiData || []);
      setPaymentMethods(paymentData || []);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleZoneUpdate = (updatedZones: Zone[]) => {
    setZones(updatedZones);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando panel administrativo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Panel Administrativo</h1>
              <p className="text-gray-600">
                Bienvenido, {profile?.full_name} ({profile?.role})
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={signOut} variant="outline">
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="px-6 py-6">
        <Tabs defaultValue="services" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="services">Servicios</TabsTrigger>
            <TabsTrigger value="zones">Zonas</TabsTrigger>
            <TabsTrigger value="apis">APIs</TabsTrigger>
            <TabsTrigger value="payments">Pagos</TabsTrigger>
            <TabsTrigger value="analytics">Análisis</TabsTrigger>
          </TabsList>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
            <div className="grid gap-6">
              <ServiceCreationForm onServiceCreated={fetchData} />
              <ServiceZonePricing 
                services={services}
                zones={zones}
                serviceZonePrices={serviceZonePrices}
                onDataRefresh={fetchData}
              />
            </div>
          </TabsContent>

          {/* Zones Tab */}
          <TabsContent value="zones" className="space-y-6">
            <AdminZoneMap 
              zones={zones}
              onZoneUpdate={handleZoneUpdate}
            />
          </TabsContent>

          {/* APIs Tab */}
          <TabsContent value="apis" className="space-y-6">
            <ApiConfiguration 
              apiConfigs={apiConfigs}
              onDataRefresh={fetchData}
            />
          </TabsContent>

          {/* Payment Methods Tab */}
          <TabsContent value="payments" className="space-y-6">
            <PaymentMethods 
              paymentMethods={paymentMethods}
              onDataRefresh={fetchData}
            />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Analytics 
              services={services}
              zones={zones}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
