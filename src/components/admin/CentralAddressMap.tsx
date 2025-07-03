
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CentralAddress {
  address: string;
  latitude: number;
  longitude: number;
  zoom: number;
}

interface CentralAddressMapProps {
  initialAddress: CentralAddress;
  onAddressUpdate: (newAddress: CentralAddress) => Promise<void>;
  loading: boolean;
}

const CentralAddressMap: React.FC<CentralAddressMapProps> = ({
  initialAddress,
  onAddressUpdate,
  loading
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [mapLoading, setMapLoading] = useState(true);
  const [searchAddress, setSearchAddress] = useState(initialAddress.address);
  const [currentAddress, setCurrentAddress] = useState<CentralAddress>(initialAddress);

  useEffect(() => {
    fetchMapboxToken();
  }, []);

  useEffect(() => {
    setCurrentAddress(initialAddress);
    setSearchAddress(initialAddress.address);
  }, [initialAddress]);

  const fetchMapboxToken = async () => {
    try {
      const { data } = await supabase
        .from('api_configs')
        .select('api_key')
        .eq('name', 'mapbox')
        .single();
      
      if (data?.api_key) {
        setMapboxToken(data.api_key);
      } else {
        console.log('No Mapbox token found, using fallback');
        setMapboxToken('pk.eyJ1IjoiYWxleGlzbWVuZG96YXZlIiwiYSI6ImNtY21vMmpydTBuZ2QybG9uMmRud3VqZW8ifQ.QuPR_Yee1i2pPqm2MMajLA');
      }
    } catch (error) {
      console.error('Error fetching Mapbox token:', error);
      setMapboxToken('pk.eyJ1IjoiYWxleGlzbWVuZG96YXZlIiwiYSI6ImNtY21vMmpydTBuZ2QybG9uMmRud3VqZW8ifQ.QuPR_Yee1i2pPqm2MMajLA');
    } finally {
      setMapLoading(false);
    }
  };

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || mapLoading || !currentAddress) return;

    try {
      mapboxgl.accessToken = mapboxToken;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [currentAddress.longitude || -99.1332, currentAddress.latitude || 19.4326],
        zoom: currentAddress.zoom || 10,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add marker
      marker.current = new mapboxgl.Marker({
        color: '#DC2626',
        draggable: true
      })
        .setLngLat([currentAddress.longitude || -99.1332, currentAddress.latitude || 19.4326])
        .addTo(map.current);

      // Handle marker drag
      marker.current.on('dragend', async () => {
        if (!marker.current) return;
        
        const lngLat = marker.current.getLngLat();
        const address = await reverseGeocode(lngLat.lng, lngLat.lat);
        const newAddress = {
          address,
          latitude: lngLat.lat,
          longitude: lngLat.lng,
          zoom: map.current?.getZoom() || 10
        };
        setCurrentAddress(newAddress);
        setSearchAddress(address);
      });

      // Handle map click
      map.current.on('click', async (e) => {
        if (!marker.current) return;
        
        marker.current.setLngLat(e.lngLat);
        const address = await reverseGeocode(e.lngLat.lng, e.lngLat.lat);
        const newAddress = {
          address,
          latitude: e.lngLat.lat,
          longitude: e.lngLat.lng,
          zoom: map.current?.getZoom() || 10
        };
        setCurrentAddress(newAddress);
        setSearchAddress(address);
      });

      return () => {
        map.current?.remove();
      };
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }, [mapboxToken, mapLoading, currentAddress.latitude, currentAddress.longitude]);

  // Update marker when currentAddress changes
  useEffect(() => {
    if (marker.current && map.current && currentAddress.longitude && currentAddress.latitude) {
      marker.current.setLngLat([currentAddress.longitude, currentAddress.latitude]);
      map.current.flyTo({
        center: [currentAddress.longitude, currentAddress.latitude],
        zoom: currentAddress.zoom
      });
    }
  }, [currentAddress]);

  const reverseGeocode = async (lng: number, lat: number): Promise<string> => {
    if (!mapboxToken) return 'Ubicación seleccionada';
    
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxToken}&language=es`
      );
      const data = await response.json();
      return data.features?.[0]?.place_name || 'Ubicación seleccionada';
    } catch (error) {
      console.error('Error en geocoding:', error);
      return 'Ubicación seleccionada';
    }
  };

  const searchLocation = async () => {
    if (!mapboxToken || !searchAddress.trim()) return;

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchAddress)}.json?access_token=${mapboxToken}&language=es&limit=1`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        const address = data.features[0].place_name;
        
        const newAddress = {
          address,
          latitude: lat,
          longitude: lng,
          zoom: 12
        };
        
        setCurrentAddress(newAddress);
        setSearchAddress(address);
        
        if (map.current) {
          map.current.flyTo({
            center: [lng, lat],
            zoom: 12
          });
        }
        
        if (marker.current) {
          marker.current.setLngLat([lng, lat]);
        }
      } else {
        toast.error('No se encontró la dirección');
      }
    } catch (error) {
      console.error('Error en búsqueda:', error);
      toast.error('Error al buscar la dirección');
    }
  };

  const handleSave = async () => {
    try {
      await onAddressUpdate(currentAddress);
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error('Error al guardar la dirección');
    }
  };

  if (mapLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Cargando mapa...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!mapboxToken) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error de Configuración</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">
            No se pudo cargar el token de Mapbox. Por favor verifica la configuración en la sección de APIs.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurar Dirección Central</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="search-address">Buscar dirección</Label>
              <Input
                id="search-address"
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                placeholder="Escribe una dirección o ciudad..."
                onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={searchLocation} variant="outline">
                Buscar
              </Button>
            </div>
          </div>
          
          <p className="text-sm text-gray-600">
            Haz clic en el mapa, arrastra el marcador rojo o busca una dirección para seleccionar la ubicación central.
          </p>
          
          <div ref={mapContainer} className="w-full h-96 rounded-lg border" />
          
          <div className="flex justify-between items-center pt-4">
            <div className="text-sm text-gray-600">
              <strong>Dirección actual:</strong> {currentAddress.address}
            </div>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Dirección Central'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CentralAddressMap;
