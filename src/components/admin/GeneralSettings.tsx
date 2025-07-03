
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Search, Save } from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCentralAddress();
  }, []);

  const fetchCentralAddress = async () => {
    try {
      const { data } = await supabase
        .from('general_settings')
        .select('setting_value')
        .eq('setting_key', 'central_address')
        .single();
      
      if (data?.setting_value) {
        setCentralAddress(data.setting_value as CentralAddress);
      }
    } catch (error) {
      console.error('Error fetching central address:', error);
    }
  };

  const searchAddress = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const { data: mapboxData } = await supabase
        .from('api_configs')
        .select('api_key')
        .eq('name', 'mapbox')
        .single();

      if (!mapboxData?.api_key) {
        toast.error('Token de Mapbox no configurado');
        return;
      }

      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${mapboxData.api_key}&language=es`
      );
      
      if (!response.ok) throw new Error('Error en la búsqueda');
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        const newAddress = {
          address: data.features[0].place_name,
          latitude: lat,
          longitude: lng,
          zoom: 12
        };
        setCentralAddress(newAddress);
        toast.success('Dirección encontrada');
      } else {
        toast.error('No se encontró la dirección');
      }
    } catch (error) {
      console.error('Error searching address:', error);
      toast.error('Error al buscar la dirección');
    } finally {
      setLoading(false);
    }
  };

  const handleMapLocationSelect = (lat: number, lng: number, address: string) => {
    setCentralAddress({
      address,
      latitude: lat,
      longitude: lng,
      zoom: 12
    });
  };

  const saveCentralAddress = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('general_settings')
        .upsert({
          setting_key: 'central_address',
          setting_value: centralAddress
        });

      if (error) throw error;

      toast.success('Dirección central guardada exitosamente');
    } catch (error) {
      console.error('Error saving central address:', error);
      toast.error('Error al guardar la dirección central');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Configuración General
          </CardTitle>
          <CardDescription>
            Configura la dirección central de tu empresa que se usará como base para el mapa
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="current-address">Dirección Central Actual</Label>
            <div className="mt-1 p-3 bg-gray-50 rounded-lg border">
              <div className="font-medium">{centralAddress.address}</div>
              <div className="text-sm text-gray-600">
                Lat: {centralAddress.latitude.toFixed(6)}, Lng: {centralAddress.longitude.toFixed(6)}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="search-address">Buscar Nueva Dirección</Label>
              <Input
                id="search-address"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ej: Av. Reforma 123, Ciudad de México"
                onKeyPress={(e) => e.key === 'Enter' && searchAddress()}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={searchAddress} 
                disabled={loading || !searchQuery.trim()}
                variant="outline"
              >
                <Search className="h-4 w-4 mr-2" />
                {loading ? 'Buscando...' : 'Buscar'}
              </Button>
            </div>
          </div>

          <Button 
            onClick={saveCentralAddress} 
            disabled={saving}
            className="w-full"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Guardando...' : 'Guardar Dirección Central'}
          </Button>
        </CardContent>
      </Card>

      <CentralAddressMap
        centralAddress={centralAddress}
        onLocationSelect={handleMapLocationSelect}
      />
    </div>
  );
};

export default GeneralSettings;
