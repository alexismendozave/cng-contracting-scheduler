import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import EnhancedZoneMap from "@/components/admin/EnhancedZoneMap";
import { Zone } from "@/components/admin/types";

export default function EnhancedZoneMapWrapper() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: zonesData } = await supabase
        .from('zones')
        .select('*')
        .order('name');

      setZones(zonesData || []);
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

  const handleZoneUpdate = (updatedZones: Zone[]) => {
    setZones(updatedZones);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <EnhancedZoneMap 
      zones={zones}
      onZoneUpdate={handleZoneUpdate}
    />
  );
}