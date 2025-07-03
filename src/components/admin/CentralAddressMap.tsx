
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface CentralAddress {
  address: string;
  latitude: number;
  longitude: number;
  zoom: number;
}

interface CentralAddressMapProps {
  centralAddress: CentralAddress;
  onLocationSelect: (lat: number, lng: number, address: string) => void;
}

const CentralAddressMap: React.FC<CentralAddressMapProps> = ({
  centralAddress,
  onLocationSelect
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMapboxToken();
  }, []);

  const fetchMapboxToken = async () => {
    try {
      const { data } = await supabase
        .from('api_configs')
        .select('api_key')
        .eq('name', 'mapbox')
        .single();
      
      if (data?.api_key) {
        setMapboxToken(data.api_key);
      }
    } catch (error) {
      console.error('Error fetching Mapbox token:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || loading) return;

    try {
      mapboxgl.accessToken = mapboxToken;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [centralAddress.longitude, centralAddress.latitude],
        zoom: centralAddress.zoom,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add initial marker
      marker.current = new mapboxgl.Marker({
        color: '#DC2626',
        draggable: true
      })
        .setLngLat([centralAddress.longitude, centralAddress.latitude])
        .addTo(map.current);

      // Handle marker drag
      marker.current.on('dragend', async () => {
        if (!marker.current) return;
        
        const lngLat = marker.current.getLngLat();
        const address = await reverseGeocode(lngLat.lng, lngLat.lat);
        onLocationSelect(lngLat.lat, lngLat.lng, address);
      });

      // Handle map click
      map.current.on('click', async (e) => {
        if (!marker.current) return;
        
        marker.current.setLngLat(e.lngLat);
        const address = await reverseGeocode(e.lngLat.lng, e.lngLat.lat);
        onLocationSelect(e.lngLat.lat, e.lngLat.lng, address);
      });

      return () => {
        map.current?.remove();
      };
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }, [mapboxToken, loading]);

  // Update marker position when centralAddress changes
  useEffect(() => {
    if (marker.current) {
      marker.current.setLngLat([centralAddress.longitude, centralAddress.latitude]);
    }
    if (map.current) {
      map.current.flyTo({
        center: [centralAddress.longitude, centralAddress.latitude],
        zoom: centralAddress.zoom
      });
    }
  }, [centralAddress]);

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

  if (loading) {
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
        <CardTitle>Seleccionar Dirección Central</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Haz clic en el mapa o arrastra el marcador rojo para seleccionar la nueva ubicación central.
          </p>
          <div ref={mapContainer} className="w-full h-96 rounded-lg border" />
        </div>
      </CardContent>
    </Card>
  );
};

export default CentralAddressMap;
