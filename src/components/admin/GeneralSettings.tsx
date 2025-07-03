
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import CentralAddressMap from "./CentralAddressMap";

interface CentralAddress {
  address: string;
  latitude: number;
  longitude: number;
  zoom: number;
}

const GeneralSettings = () => {
  const [centralAddress, setCentralAddress] = useState<CentralAddress>({
    address: "Ciudad de México, CDMX, México",
    latitude: 19.4326,
    longitude: -99.1332,
    zoom: 10
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCentralAddress();
  }, []);

  const fetchCentralAddress = async () => {
    try {
      const { data, error } = await supabase
        .from('general_settings')
        .select('setting_value')
        .eq('setting_key', 'central_address')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching central address:', error);
        return;
      }

      if (data?.setting_value) {
        const addressData = data.setting_value as any;
        if (addressData && typeof addressData === 'object' && 
            'address' in addressData && 'latitude' in addressData && 
            'longitude' in addressData && 'zoom' in addressData) {
          setCentralAddress(addressData as CentralAddress);
        }
      }
    } catch (error) {
      console.error('Error fetching central address:', error);
    }
  };

  const handleAddressUpdate = async (newAddress: CentralAddress) => {
    setLoading(true);
    try {
      // Primero intentar actualizar
      const { error: updateError } = await supabase
        .from('general_settings')
        .update({
          setting_value: newAddress as any
        })
        .eq('setting_key', 'central_address');

      if (updateError) {
        // Si falla, intentar insertar
        const { error: insertError } = await supabase
          .from('general_settings')
          .insert({
            setting_key: 'central_address',
            setting_value: newAddress as any
          });

        if (insertError) {
          console.error('Error saving address:', insertError);
          toast.error('Error al guardar la dirección: ' + insertError.message);
          return;
        }
      }

      setCentralAddress(newAddress);
      toast.success('Dirección central actualizada exitosamente');
    } catch (error) {
      console.error('Error updating central address:', error);
      toast.error('Error al actualizar la dirección');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuraciones Generales</CardTitle>
          <CardDescription>
            Gestiona las configuraciones básicas del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Dirección Central</h3>
              <p className="text-sm text-gray-600 mb-4">
                Establece la ubicación central de tu negocio. Esta será la referencia base para el mapa y las zonas de servicio.
              </p>
              
              <CentralAddressMap
                initialAddress={centralAddress}
                onAddressUpdate={handleAddressUpdate}
                loading={loading}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeneralSettings;
