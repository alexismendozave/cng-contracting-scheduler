
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Save, X } from 'lucide-react';

interface Zone {
  id: number;
  name: string;
  multiplier: number;
  description: string;
  color: string;
  coordinates: [number, number][];
}

interface AdminZoneMapProps {
  zones: Zone[];
  onZoneUpdate: (zones: Zone[]) => void;
  mapboxToken: string;
}

const AdminZoneMap: React.FC<AdminZoneMapProps> = ({
  zones,
  onZoneUpdate,
  mapboxToken
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<[number, number][]>([]);
  const [editingZone, setEditingZone] = useState<Partial<Zone> | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-99.1332, 19.4326],
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
          new mapboxgl.Marker({ color: '#ff0000' })
            .setLngLat(newPoint)
            .addTo(map.current!);
        }
      });
    });

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, zones, isDrawing]);

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
      if (zone.coordinates && zone.coordinates.length > 2) {
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
            'fill-color': zone.color,
            'fill-opacity': 0.4
          }
        });

        map.current?.addLayer({
          id: `zone-border-${zone.id}`,
          type: 'line',
          source: `zone-${zone.id}`,
          paint: {
            'line-color': zone.color,
            'line-width': 2
          }
        });
      }
    });
  };

  const startDrawing = () => {
    setIsDrawing(true);
    setCurrentPath([]);
    setEditingZone({
      name: '',
      multiplier: 1.0,
      description: '',
      color: '#3B82F6',
      coordinates: []
    });
  };

  const finishDrawing = () => {
    if (currentPath.length < 3) {
      alert('Necesitas al menos 3 puntos para crear una zona');
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
    
    // Clear markers
    const markers = document.querySelectorAll('.mapboxgl-marker');
    markers.forEach(marker => marker.remove());
  };

  const saveZone = () => {
    if (!editingZone || !editingZone.name || !editingZone.coordinates?.length) {
      alert('Por favor completa todos los campos');
      return;
    }

    const newZone: Zone = {
      id: isEditing ? (editingZone as Zone).id : Date.now(),
      name: editingZone.name,
      multiplier: editingZone.multiplier || 1.0,
      description: editingZone.description || '',
      color: editingZone.color || '#3B82F6',
      coordinates: editingZone.coordinates
    };

    let updatedZones;
    if (isEditing) {
      updatedZones = zones.map(z => z.id === newZone.id ? newZone : z);
    } else {
      updatedZones = [...zones, newZone];
    }

    onZoneUpdate(updatedZones);
    setEditingZone(null);
    setIsEditing(false);
    
    // Clear markers
    const markers = document.querySelectorAll('.mapboxgl-marker');
    markers.forEach(marker => marker.remove());
  };

  const deleteZone = (zoneId: number) => {
    if (confirm('¿Estás seguro de eliminar esta zona?')) {
      const updatedZones = zones.filter(z => z.id !== zoneId);
      onZoneUpdate(updatedZones);
    }
  };

  const editZone = (zone: Zone) => {
    setEditingZone(zone);
    setIsEditing(true);
  };

  return (
    <div className="space-y-6">
      {/* Map Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Zonas - Mapa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            {!isDrawing && !editingZone && (
              <Button onClick={startDrawing} className="bg-blue-600 hover:bg-blue-700">
                📍 Crear Nueva Zona
              </Button>
            )}
            
            {isDrawing && (
              <>
                <Button onClick={finishDrawing} variant="outline">
                  ✅ Terminar Dibujo
                </Button>
                <Button onClick={cancelDrawing} variant="outline">
                  ❌ Cancelar
                </Button>
                <div className="text-sm text-gray-600 flex items-center">
                  Puntos: {currentPath.length} (mínimo 3)
                </div>
              </>
            )}
          </div>

          <div ref={mapContainer} className="w-full h-96 rounded-lg border" />
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

            <div>
              <Label htmlFor="zone-color">Color</Label>
              <Input
                id="zone-color"
                type="color"
                value={editingZone.color || '#3B82F6'}
                onChange={(e) => setEditingZone(prev => ({...prev, color: e.target.value}))}
              />
            </div>

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
          <CardTitle>Zonas Existentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {zones.map(zone => (
              <div key={zone.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: zone.color }}
                  />
                  <div>
                    <h4 className="font-semibold">{zone.name}</h4>
                    <p className="text-sm text-gray-600">{zone.description}</p>
                  </div>
                  <Badge variant="secondary">
                    {zone.multiplier}x
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

export default AdminZoneMap;
