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
  center,
  zoom
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [searchAddress, setSearchAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [centralAddress, setCentralAddress] = useState<{latitude: number, longitude: number, zoom: number} | null>(null);

  useEffect(() => {
    fetchMapboxToken();
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
        const addressData = data.setting_value as any;
        setCentralAddress({
          latitude: addressData.latitude,
          longitude: addressData.longitude,
          zoom: addressData.zoom
        });
      }
    } catch (error) {
      console.error('Error fetching central address:', error);
    }
  };

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
        console.log('No Mapbox token found in database, using fallback');
        setMapboxToken('pk.eyJ1IjoiYWxleGlzbWVuZG96YXZlIiwiYSI6ImNtY21vMmpydTBuZ2QybG9uMmRud3VqZW8ifQ.QuPR_Yee1i2pPqm2MMajLA');
      }
    } catch (error) {
      console.error('Error fetching Mapbox token:', error);
      setMapboxToken('pk.eyJ1IjoiYWxleGlzbWVuZG96YXZlIiwiYSI6ImNtY21vMmpydTBuZ2QybG9uMmRud3VqZW8ifQ.QuPR_Yee1i2pPqm2MMajLA');
    } finally {
      setLoading(false);
    }
  };

  // Calculate center based on zones or central address
  const getMapCenter = (): [number, number] => {
    if (center) return center;
    
    // If we have zones with coordinates, center on them
    if (zones.length > 0) {
      const validZones = zones.filter(zone => zone.coordinates && zone.coordinates.length > 0);
      if (validZones.length > 0) {
        let totalLat = 0;
        let totalLng = 0;
        let pointCount = 0;
        
        validZones.forEach(zone => {
          zone.coordinates.forEach(coord => {
            totalLng += coord[0];
            totalLat += coord[1];
            pointCount++;
          });
        });
        
        if (pointCount > 0) {
          return [totalLng / pointCount, totalLat / pointCount];
        }
      }
    }
    
    // Use central address if available
    if (centralAddress) {
      return [centralAddress.longitude, centralAddress.latitude];
    }
    
    // Default fallback
    return [-99.1332, 19.4326];
  };

  const getMapZoom = (): number => {
    if (zoom) return zoom;
    if (centralAddress) return centralAddress.zoom;
    return 10;
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
        
        setUserLocation([lng, lat]);
        setSelectedAddress(address);
        
        if (map.current) {
          map.current.flyTo({
            center: [lng, lat],
            zoom: 14
          });
        }
        
        if (onLocationSelect) {
          onLocationSelect(lat, lng, address);
        }
      }
    } catch (error) {
      console.error('Error en búsqueda:', error);
    }
  };

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || loading) return;

    try {
      console.log('Initializing map with token:', mapboxToken.substring(0, 20) + '...');
      mapboxgl.accessToken = mapboxToken;
      
      const mapCenter = getMapCenter();
      const mapZoom = getMapZoom();
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: mapCenter,
        zoom: mapZoom,
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add zones to map
      map.current.on('load', () => {
        console.log('Map loaded successfully');
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

      map.current.on('error', (e) => {
        console.error('Map error:', e);
      });

      return () => {
        map.current?.remove();
      };
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }, [mapboxToken, zones, selectedZone, loading, centralAddress]);

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
        <div className="flex-1">
          <Input
            value={searchAddress}
            onChange={(e) => setSearchAddress(e.target.value)}
            placeholder="Buscar dirección o ciudad..."
            onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
          />
        </div>
        <Button onClick={searchLocation} variant="outline" size="sm">
          Buscar
        </Button>
        <Button onClick={getCurrentLocation} variant="outline" size="sm">
          📍 Mi ubicación
        </Button>
      </div>

      {selectedAddress && (
        <div className="text-sm text-gray-600 flex items-center">
          📍 {selectedAddress}
        </div>
      )}
      
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
