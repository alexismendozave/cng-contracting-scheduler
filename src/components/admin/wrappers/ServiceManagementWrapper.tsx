import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ServiceManagement from "@/components/admin/ServiceManagement";
import { Zone, Service } from "@/components/admin/types";

export default function ServiceManagementWrapper() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: zonesData } = await supabase
        .from('zones')
        .select('*')
        .order('name');
      
      const { data: servicesData } = await supabase
        .from('services')
        .select('*')
        .order('name');

      setZones(zonesData || []);
      setServices(servicesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ServiceManagement 
      services={services}
      zones={zones}
      onDataRefresh={fetchData}
    />
  );
}