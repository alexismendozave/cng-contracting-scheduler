import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Save, X, Search, MapPin, Undo } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Zone } from './types';

interface EnhancedZoneMapProps {
  zones: Zone[];
  onZoneUpdate: (zones: Zone[]) => void;
}

const EnhancedZoneMap: React.FC<EnhancedZoneMapProps> = ({
  zones,
  onZoneUpdate
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<[number, number][]>([]);
  const [editingZone, setEditingZone] = useState<Partial<Zone> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [mapboxToken, setMapboxToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [markers, setMarkers] = useState<mapboxgl.Marker[]>([]);
  const [centralAddress, setCentralAddress] = useState({ lat: 19.4326, lng: -99.1332 });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      // Fetch Mapbox token
      const { data: mapboxData } = await supabase
        .from('api_configs')
        .select('api_key')
        .eq('name', 'mapbox')
        .single();
      
      if (mapboxData?.api_key) {
        setMapboxToken(mapboxData.api_key);
      }

      // Fetch central address
      const { data: centralData } = await supabase
        .from('general_settings')
        .select('setting_value')
        .eq('setting_key', 'central_address')
        .single();
      
      if (centralData?.setting_value) {
        const addr = centralData.setting_value as any;
        setCentralAddress({ lat: addr.latitude, lng: addr.longitude });
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchLocation = async () => {
    if (!searchQuery.trim() || !mapboxToken) return;
    
    setSearching(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${mapboxToken}&language=es`
      );
      
      if (!response.ok) throw new Error('Error en la búsqueda');
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        
        if (map.current) {
          map.current.flyTo({
            center: [lng, lat],
            zoom: 14,
            duration: 2000
          });
          
          // Add temporary marker for searched location
          const tempMarker = new mapboxgl.Marker({ color: '#10B981' })
            .setLngLat([lng, lat])
            .addTo(map.current);
          
          setTimeout(() => tempMarker.remove(), 5000);
        }
        
        toast.success(`Ubicación encontrada: ${data.features[0].place_name}`);
      } else {
        toast.error('No se encontró la ubicación');
      }
    } catch (error) {
      console.error('Error searching location:', error);
      toast.error('Error al buscar la ubicación');
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || loading) return;

    try {
      mapboxgl.accessToken = mapboxToken;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [centralAddress.lng, centralAddress.lat],
        zoom: 10,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      map.current.on('load', () => {
        renderZones();
        
        // Click handler for drawing zones
        map.current?.on('click', (e) => {
          if (isDrawing) {
            const newPoint: [number, number] = [e.lngLat.lng, e.lngLat.lat];
            setCurrentPath(prev => [...prev, newPoint]);
            
            // Add marker for the point
            const marker = new mapboxgl.Marker({ 
              color: '#EF4444',
              draggable: isDrawing 
            })
              .setLngLat(newPoint)
              .addTo(map.current!);
            
            setMarkers(prev => [...prev, marker]);
          }
        });
      });

      return () => {
        clearMarkers();
        map.current?.remove();
      };
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }, [mapboxToken, zones, isDrawing, loading, centralAddress]);

  const clearMarkers = () => {
    markers.forEach(marker => marker.remove());
    setMarkers([]);
  };

  const renderZones = () => {
    if (!map.current) return;

    // Clear existing zones
    zones.forEach(zone => {
      if (map.current?.getSource(`zone-${zone.id}`)) {
        map.current.removeLayer(`zone-fill-${zone.id}`);
        map.current.removeLayer(`zone-border-${zone.id}`);
        map.current.removeSource(`zone-${zone.id}`);
      }
    });

    // Render zones
    zones.forEach(zone => {
      if (zone.coordinates && Array.isArray(zone.coordinates) && zone.coordinates.length > 2) {
        const polygonCoordinates = [...zone.coordinates, zone.coordinates[0]];
        
        map.current?.addSource(`zone-${zone.id}`, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: { zoneId: zone.id },
            geometry: {
              type: 'Polygon',
              coordinates: [polygonCoordinates]
            }
          }
        });

        map.current?.addLayer({
          id: `zone-fill-${zone.id}`,
          type: 'fill',
          source: `zone-${zone.id}`,
          paint: {
            'fill-color': zone.color || '#3B82F6',
            'fill-opacity': 0.4
          }
        });

        map.current?.addLayer({
          id: `zone-border-${zone.id}`,
          type: 'line',
          source: `zone-${zone.id}`,
          paint: {
            'line-color': zone.color || '#3B82F6',
            'line-width': 2
          }
        });

        // Add zone label
        if (zone.coordinates.length > 0) {
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
      }
    });
  };

  const createZoneLabel = (zone: Zone) => {
    const el = document.createElement('div');
    el.className = 'zone-label';
    el.style.cssText = `
      background: white;
      border: 2px solid ${zone.color || '#3B82F6'};
      border-radius: 8px;
      padding: 4px 8px;
      font-size: 12px;
      font-weight: bold;
      color: ${zone.color || '#3B82F6'};
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      cursor: pointer;
    `;
    el.innerHTML = zone.name;
    return el;
  };

  const startDrawing = () => {
    setIsDrawing(true);
    setCurrentPath([]);
    clearMarkers();
    setEditingZone({
      name: '',
      multiplier: 1.0,
      description: '',
      color: '#3B82F6',
      coordinates: [],
      pricing_type: 'percentage'
    });
  };

  const finishDrawing = () => {
    if (currentPath.length < 3) {
      toast.error('Necesitas al menos 3 puntos para crear una zona');
      return;
    }

    setIsDrawing(false);
    setEditingZone(prev => ({
      ...prev,
      coordinates: currentPath
    }));
  };

  const cancelDrawing = () => {
    setIsDrawing(false);
    setCurrentPath([]);
    setEditingZone(null);
    clearMarkers();
  };

  const undoLastPoint = () => {
    if (currentPath.length > 0) {
      const newPath = currentPath.slice(0, -1);
      setCurrentPath(newPath);
      
      // Remove last marker
      if (markers.length > 0) {
        const lastMarker = markers[markers.length - 1];
        lastMarker.remove();
        setMarkers(prev => prev.slice(0, -1));
      }
    }
  };

  const saveZone = async () => {
    if (!editingZone || !editingZone.name || !editingZone.coordinates?.length) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    try {
      const zoneData = {
        name: editingZone.name,
        multiplier: editingZone.multiplier || 1.0,
        description: editingZone.description || '',
        color: editingZone.color || '#3B82F6',
        coordinates: editingZone.coordinates,
        pricing_type: editingZone.pricing_type || 'percentage',
        fixed_price: editingZone.pricing_type === 'fixed' ? editingZone.fixed_price : null
      };

      if (isEditing && editingZone.id) {
        const { error } = await supabase
          .from('zones')
          .update(zoneData)
          .eq('id', editingZone.id);
        
        if (error) throw error;
        toast.success('Zona actualizada exitosamente');
      } else {
        const { error } = await supabase
          .from('zones')
          .insert([zoneData]);
        
        if (error) throw error;
        toast.success('Zona creada exitosamente');
      }

      // Refetch zones
      const { data: zonesData } = await supabase
        .from('zones')
        .select('*')
        .order('name');
      
      if (zonesData) {
        onZoneUpdate(zonesData);
      }

      setEditingZone(null);
      setIsEditing(false);
      clearMarkers();
    } catch (error) {
      console.error('Error saving zone:', error);
      toast.error('Error al guardar la zona');
    }
  };

  const deleteZone = async (zoneId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta zona?')) return;

    try {
      const { error } = await supabase
        .from('zones')
        .delete()
        .eq('id', zoneId);
      
      if (error) throw error;
      
      toast.success('Zona eliminada exitosamente');
      
      // Refetch zones
      const { data: zonesData } = await supabase
        .from('zones')
        .select('*')
        .order('name');
      
      if (zonesData) {
        onZoneUpdate(zonesData);
      }
    } catch (error) {
      console.error('Error deleting zone:', error);
      toast.error('Error al eliminar la zona');
    }
  };

  const editZone = (zone: Zone) => {
    setEditingZone(zone);
    setIsEditing(true);
    
    // Show existing zone points as markers
    if (zone.coordinates && Array.isArray(zone.coordinates)) {
      clearMarkers();
      const editMarkers = zone.coordinates.map(coord => {
        const marker = new mapboxgl.Marker({ 
          color: '#F59E0B',
          draggable: true 
        })
          .setLngLat(coord)
          .addTo(map.current!);
        
        marker.on('dragend', () => {
          updateZoneCoordinates();
        });
        
        return marker;
      });
      setMarkers(editMarkers);
      setCurrentPath(zone.coordinates);
    }
  };

  const updateZoneCoordinates = () => {
    const newCoordinates = markers.map(marker => {
      const lngLat = marker.getLngLat();
      return [lngLat.lng, lngLat.lat] as [number, number];
    });
    setCurrentPath(newCoordinates);
    setEditingZone(prev => ({
      ...prev,
      coordinates: newCoordinates
    }));
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
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Map Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Gestión Avanzada de Zonas</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Location Search */}
          <div className="flex gap-2 mb-4">
            <div className="flex-1">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar ubicación, ciudad o dirección..."
                onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
              />
            </div>
            <Button 
              onClick={searchLocation} 
              disabled={searching || !searchQuery.trim()}
              variant="outline"
            >
              <Search className="h-4 w-4 mr-2" />
              {searching ? 'Buscando...' : 'Buscar'}
            </Button>
          </div>

          {/* Drawing Controls */}
          <div className="flex gap-2 mb-4">
            {!isDrawing && !editingZone && (
              <Button onClick={startDrawing} className="bg-blue-600 hover:bg-blue-700">
                <MapPin className="h-4 w-4 mr-2" />
                Crear Nueva Zona
              </Button>
            )}
            
            {isDrawing && (
              <>
                <Button onClick={finishDrawing} variant="outline">
                  ✅ Terminar Dibujo ({currentPath.length} puntos)
                </Button>
                <Button onClick={undoLastPoint} variant="outline" disabled={currentPath.length === 0}>
                  <Undo className="h-4 w-4 mr-2" />
                  Deshacer
                </Button>
                <Button onClick={cancelDrawing} variant="outline">
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </>
            )}
            
            {isEditing && !isDrawing && (
              <>
                <div className="text-sm text-blue-600 flex items-center">
                  <Edit className="h-4 w-4 mr-2" />
                  Editando zona: arrastra los puntos naranjas para modificar
                </div>
              </>
            )}
          </div>

          <div ref={mapContainer} className="w-full h-96 rounded-lg border" />
          
          {isDrawing && (
            <div className="mt-2 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 Haz clic en el mapa para marcar puntos. Necesitas mínimo 3 puntos para crear una zona.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Zone Form */}
      {editingZone && (
        <Card>
          <CardHeader>
            <CardTitle>
              {isEditing ? 'Editar Zona' : 'Nueva Zona'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="zone-name">Nombre de la zona</Label>
                <Input
                  id="zone-name"
                  value={editingZone.name || ''}
                  onChange={(e) => setEditingZone(prev => ({...prev, name: e.target.value}))}
                  placeholder="Ej: Zona Centro"
                />
              </div>
              <div>
                <Label htmlFor="zone-pricing-type">Tipo de precio</Label>
                <select
                  id="zone-pricing-type"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={editingZone.pricing_type || 'percentage'}
                  onChange={(e) => setEditingZone(prev => ({...prev, pricing_type: e.target.value as 'percentage' | 'fixed'}))}
                >
                  <option value="percentage">Porcentaje</option>
                  <option value="fixed">Costo fijo</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {editingZone.pricing_type === 'percentage' ? (
                <div>
                  <Label htmlFor="zone-multiplier">Multiplicador de precio</Label>
                  <Input
                    id="zone-multiplier"
                    type="number"
                    step="0.05"
                    min="0.5"
                    max="3.0"
                    value={editingZone.multiplier || 1.0}
                    onChange={(e) => setEditingZone(prev => ({...prev, multiplier: parseFloat(e.target.value)}))}
                  />
                </div>
              ) : (
                <div>
                  <Label htmlFor="zone-fixed-price">Precio fijo adicional</Label>
                  <Input
                    id="zone-fixed-price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={editingZone.fixed_price || 0}
                    onChange={(e) => setEditingZone(prev => ({...prev, fixed_price: parseFloat(e.target.value)}))}
                  />
                </div>
              )}
              <div>
                <Label htmlFor="zone-color">Color</Label>
                <Input
                  id="zone-color"
                  type="color"
                  value={editingZone.color || '#3B82F6'}
                  onChange={(e) => setEditingZone(prev => ({...prev, color: e.target.value}))}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="zone-description">Descripción</Label>
              <Textarea
                id="zone-description"
                value={editingZone.description || ''}
                onChange={(e) => setEditingZone(prev => ({...prev, description: e.target.value}))}
                placeholder="Describe las características de esta zona..."
              />
            </div>

            {editingZone.coordinates && editingZone.coordinates.length > 0 && (
              <div>
                <Label>Coordenadas ({editingZone.coordinates.length} puntos)</Label>
                <div className="max-h-32 overflow-y-auto bg-gray-50 p-2 rounded text-xs">
                  {editingZone.coordinates.map((coord, index) => (
                    <div key={index} className="text-gray-600">
                      Punto {index + 1}: {coord[1].toFixed(6)}, {coord[0].toFixed(6)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={saveZone} className="bg-green-600 hover:bg-green-700">
                <Save className="h-4 w-4 mr-2" />
                Guardar Zona
              </Button>
              <Button onClick={() => {
                setEditingZone(null);
                setIsEditing(false);
                cancelDrawing();
              }} variant="outline">
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Zones List */}
      <Card>
        <CardHeader>
          <CardTitle>Zonas Existentes ({zones.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {zones.map(zone => (
              <div key={zone.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: zone.color || '#3B82F6' }}
                  />
                  <div>
                    <h4 className="font-semibold">{zone.name}</h4>
                    <p className="text-sm text-gray-600">{zone.description}</p>
                    <div className="text-xs text-gray-500">
                      {zone.coordinates ? `${zone.coordinates.length} puntos` : 'Sin coordenadas'}
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {zone.pricing_type === 'fixed' 
                      ? `+$${zone.fixed_price}` 
                      : `${zone.multiplier}x`
                    }
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => editZone(zone)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => deleteZone(zone.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedZoneMap;
