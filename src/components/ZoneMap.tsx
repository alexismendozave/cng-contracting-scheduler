
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface Zone {
  id: number;
  name: string;
  multiplier: number;
  description: string;
  color: string;
  coordinates: [number, number][];
}

interface ZoneMapProps {
  zones: Zone[];
  selectedZone?: Zone | null;
  onZoneSelect?: (zone: Zone) => void;
  onLocationSelect?: (lat: number, lng: number, address: string) => void;
  center?: [number, number];
  zoom?: number;
}

const ZoneMap: React.FC<ZoneMapProps> = ({
  zones,
  selectedZone,
  onZoneSelect,
  onLocationSelect,
  center = [-99.1332, 19.4326], // Mexico City default
  zoom = 10
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selectedAddress, setSelectedAddress] = useState('');
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
      } else {
        // Usar el token proporcionado por el usuario como fallback
        setMapboxToken('sk.eyJ1IjoiYWxleGlzbWVuZG96YXZlIiwiYSI6ImNtY25xMWdwNjB4ajgycXBwNnhqNXZlaWsifQ.fwEzsi4qbtziXbFJjgrI8A');
      }
    } catch (error) {
      console.error('Error fetching Mapbox token:', error);
      // Usar el token proporcionado por el usuario como fallback
      setMapboxToken('sk.eyJ1IjoiYWxleGlzbWVuZG96YXZlIiwiYSI6ImNtY25xMWdwNjB4ajgycXBwNnhqNXZlaWsifQ.fwEzsi4qbtziXbFJjgrI8A');
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
        center: center,
        zoom: zoom,
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add zones to map
      map.current.on('load', () => {
        zones.forEach((zone, index) => {
          if (zone.coordinates && zone.coordinates.length > 0) {
            // Create polygon for zone
            const polygonCoordinates = [...zone.coordinates, zone.coordinates[0]]; // Close polygon
            
            map.current?.addSource(`zone-${zone.id}`, {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {
                  zoneId: zone.id,
                  name: zone.name,
                  description: zone.description,
                  multiplier: zone.multiplier
                },
                geometry: {
                  type: 'Polygon',
                  coordinates: [polygonCoordinates]
                }
              }
            });

            // Add fill layer
            map.current?.addLayer({
              id: `zone-fill-${zone.id}`,
              type: 'fill',
              source: `zone-${zone.id}`,
              paint: {
                'fill-color': zone.color,
                'fill-opacity': selectedZone?.id === zone.id ? 0.6 : 0.3
              }
            });

            // Add border layer
            map.current?.addLayer({
              id: `zone-border-${zone.id}`,
              type: 'line',
              source: `zone-${zone.id}`,
              paint: {
                'line-color': zone.color,
                'line-width': selectedZone?.id === zone.id ? 3 : 2
              }
            });

            // Add zone label
            const center = zone.coordinates.reduce(
              (acc, coord) => [acc[0] + coord[0], acc[1] + coord[1]],
              [0, 0]
            ).map(sum => sum / zone.coordinates.length) as [number, number];

            new mapboxgl.Marker({
              element: createZoneLabel(zone),
              anchor: 'center'
            })
              .setLngLat(center)
              .addTo(map.current!);
          }
        });

        // Add click handler for zones
        map.current?.on('click', (e) => {
          const features = map.current?.queryRenderedFeatures(e.point, {
            layers: zones.map(z => `zone-fill-${z.id}`)
          });

          if (features && features.length > 0) {
            const zoneId = features[0].properties?.zoneId;
            const zone = zones.find(z => z.id === zoneId);
            if (zone && onZoneSelect) {
              onZoneSelect(zone);
            }
          } else {
            // User clicked outside zones - set location
            if (onLocationSelect) {
              reverseGeocode(e.lngLat.lng, e.lngLat.lat).then(address => {
                setUserLocation([e.lngLat.lng, e.lngLat.lat]);
                setSelectedAddress(address);
                onLocationSelect(e.lngLat.lat, e.lngLat.lng, address);
              });
            }
          }
        });
      });

      return () => {
        map.current?.remove();
      };
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }, [mapboxToken, zones, selectedZone, center, zoom, loading]);

  const createZoneLabel = (zone: Zone) => {
    const el = document.createElement('div');
    el.className = 'zone-label';
    el.style.cssText = `
      background: white;
      border: 2px solid ${zone.color};
      border-radius: 8px;
      padding: 4px 8px;
      font-size: 12px;
      font-weight: bold;
      color: ${zone.color};
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      cursor: pointer;
    `;
    el.innerHTML = zone.name;
    return el;
  };

  const reverseGeocode = async (lng: number, lat: number): Promise<string> => {
    if (!mapboxToken) return 'Ubicación seleccionada';
    
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxToken}`
      );
      const data = await response.json();
      return data.features?.[0]?.place_name || 'Ubicación seleccionada';
    } catch (error) {
      console.error('Error en geocoding:', error);
      return 'Ubicación seleccionada';
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([longitude, latitude]);
          map.current?.flyTo({
            center: [longitude, latitude],
            zoom: 14
          });
          
          if (onLocationSelect) {
            reverseGeocode(longitude, latitude).then(address => {
              setSelectedAddress(address);
              onLocationSelect(latitude, longitude, address);
            });
          }
        },
        (error) => {
          console.error('Error obteniendo ubicación:', error);
        }
      );
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
          <p className="text-red-600 mb-4">
            No se pudo cargar el token de Mapbox. Por favor verifica la configuración en la sección de APIs.
          </p>
          <p className="text-sm text-gray-600">
            Obtén tu token en <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">mapbox.com</a>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button onClick={getCurrentLocation} variant="outline" size="sm">
          📍 Mi ubicación actual
        </Button>
        {selectedAddress && (
          <div className="flex-1 text-sm text-gray-600 flex items-center">
            📍 {selectedAddress}
          </div>
        )}
      </div>
      
      <div ref={mapContainer} className="w-full h-96 rounded-lg border" />
      
      {selectedZone && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">{selectedZone.name}</h4>
                <p className="text-sm text-gray-600">{selectedZone.description}</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Multiplicador</div>
                <div className="text-lg font-bold" style={{ color: selectedZone.color }}>
                  {selectedZone.multiplier}x
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ZoneMap;
