import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ApiConfiguration from "@/components/admin/ApiConfiguration";
import { ApiConfig } from "@/components/admin/types";

export default function ApiConfigurationWrapper() {
  const [apiConfigs, setApiConfigs] = useState<ApiConfig[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: apiData } = await supabase
        .from('api_configs')
        .select('*')
        .order('name');

      setApiConfigs(apiData || []);
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
    <ApiConfiguration 
      apiConfigs={apiConfigs}
      onDataRefresh={fetchData}
    />
  );
}