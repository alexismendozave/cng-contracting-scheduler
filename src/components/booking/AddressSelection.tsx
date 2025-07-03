
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Search, Navigation } from "lucide-react";
import { toast } from "sonner";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface Service {
  id: string;
  name: string;
  base_price: number;
}

interface Zone {
  id: string;
  name: string;
  multiplier: number;
  fixed_price: number;
  pricing_type: string;
}

interface AddressSelectionProps {
  service: Service;
  onAddressSelect: (data: {
    address: string;
    latitude: number;
    longitude: number;
    zone?: Zone;
    finalPrice: number;
  }) => void;
}

const AddressSelection = ({ service, onAddressSelect }: AddressSelectionProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{
    address: string;
    latitude: number;
    longitude: number;
  } | null>(null);
  const [zone, setZone] = useState<Zone | null>(null);
  const [finalPrice, setFinalPrice] = useState(service.base_price);
  const [loading, setLoading] = useState(false);
  const [googleApiKey, setGoogleApiKey] = useState("");
  const [mapboxToken, setMapboxToken] = useState("");
  const [mapLoading, setMapLoading] = useState(true);
  const [canContinue, setCanContinue] = useState(false);

  useEffect(() => {
    fetchApiKeys();
  }, []);

  useEffect(() => {
    if (selectedLocation) {
      checkZone(selectedLocation.latitude, selectedLocation.longitude);
    }
  }, [selectedLocation]);

  useEffect(() => {
    // Allow continue if user has typed an address, even without map confirmation
    setCanContinue(address.trim().length > 0 || selectedLocation !== null);
  }, [address, selectedLocation]);

  const fetchApiKeys = async () => {
    try {
      // Fetch Google Maps API key
      const { data: googleData } = await supabase
        .from('api_configs')
        .select('api_key')
        .eq('name', 'google_maps')
        .maybeSingle();
      
      if (googleData?.api_key) {
        setGoogleApiKey(googleData.api_key);
      }

      // Fetch Mapbox token
      const { data: mapboxData } = await supabase
        .from('api_configs')
        .select('api_key')
        .eq('name', 'mapbox')
        .maybeSingle();
      
      if (mapboxData?.api_key) {
        setMapboxToken(mapboxData.api_key);
      } else {
        // Fallback token
        setMapboxToken('pk.eyJ1IjoiYWxleGlzbWVuZG96YXZlIiwiYSI6ImNtY21vMmpydTBuZ2QybG9uMmRud3VqZW8ifQ.QuPR_Yee1i2pPqm2MMajLA');
      }
    } catch (error) {
      console.error('Error fetching API keys:', error);
      setMapboxToken('pk.eyJ1IjoiYWxleGlzbWVuZG96YXZlIiwiYSI6ImNtY21vMmpydTBuZ2QybG9uMmRud3VqZW8ifQ.QuPR_Yee1i2pPqm2MMajLA');
    } finally {
      setMapLoading(false);
    }
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || mapLoading) return;

    try {
      mapboxgl.accessToken = mapboxToken;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-99.1332, 19.4326], // Default to Mexico City
        zoom: 10,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Handle map click
      map.current.on('click', async (e) => {
        const location = {
          address: `${e.lngLat.lat.toFixed(6)}, ${e.lngLat.lng.toFixed(6)}`,
          latitude: e.lngLat.lat,
          longitude: e.lngLat.lng
        };

        // Try to get readable address
        try {
          const readableAddress = await reverseGeocode(e.lngLat.lng, e.lngLat.lat);
          location.address = readableAddress;
        } catch (error) {
          console.error('Error getting readable address:', error);
        }
        
        setSelectedLocation(location);
        setAddress(location.address);
        setSuggestions([]);
        
        // Add or update marker
        if (marker.current) {
          marker.current.setLngLat(e.lngLat);
        } else {
          marker.current = new mapboxgl.Marker({
            color: '#DC2626',
            draggable: true
          })
            .setLngLat(e.lngLat)
            .addTo(map.current!);

          // Handle marker drag
          marker.current.on('dragend', async () => {
            if (!marker.current) return;
            
            const lngLat = marker.current.getLngLat();
            const address = await reverseGeocode(lngLat.lng, lngLat.lat);
            const newLocation = {
              address,
              latitude: lngLat.lat,
              longitude: lngLat.lng
            };
            setSelectedLocation(newLocation);
            setAddress(address);
          });
        }
      });

      return () => {
        map.current?.remove();
      };
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }, [mapboxToken, mapLoading]);

  const reverseGeocode = async (lng: number, lat: number): Promise<string> => {
    if (!mapboxToken) return 'Ubicación seleccionada';
    
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleApiKey}`
      );
      
      if (response.ok && googleApiKey) {
        const data = await response.json();
        if (data.results?.[0]) {
          return data.results[0].formatted_address;
        }
      }

      // Fallback to Mapbox
      const mapboxResponse = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxToken}&language=es`
      );
      const mapboxData = await mapboxResponse.json();
      return mapboxData.features?.[0]?.place_name || 'Ubicación seleccionada';
    } catch (error) {
      console.error('Error en geocoding:', error);
      return 'Ubicación seleccionada';
    }
  };

  const searchAddresses = async (query: string) => {
    if (!query.trim()) return;

    try {
      let searchResults = [];

      // Try Google Places first if API key is available
      if (googleApiKey) {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${googleApiKey}&language=es`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.predictions) {
            searchResults = data.predictions;
          }
        }
      }

      // Fallback to Mapbox if no Google results
      if (searchResults.length === 0 && mapboxToken) {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxToken}&language=es&limit=5`
        );
        const data = await response.json();
        
        if (data.features) {
          searchResults = data.features.map((feature: any) => ({
            place_id: feature.id,
            description: feature.place_name,
            geometry: {
              location: {
                lat: feature.center[1],
                lng: feature.center[0]
              }
            }
          }));
        }
      }

      setSuggestions(searchResults);
    } catch (error) {
      console.error('Error searching addresses:', error);
    }
  };

  const searchByPostalCode = async () => {
    if (!postalCode.trim()) {
      toast.error('Por favor ingresa un código postal');
      return;
    }

    setLoading(true);
    try {
      let location = null;

      // Try Google first
      if (googleApiKey) {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(postalCode)}&key=${googleApiKey}`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.results?.[0]) {
            const result = data.results[0];
            location = {
              address: result.formatted_address,
              latitude: result.geometry.location.lat,
              longitude: result.geometry.location.lng
            };
          }
        }
      }

      // Fallback to Mapbox
      if (!location && mapboxToken) {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(postalCode)}.json?access_token=${mapboxToken}&language=es&limit=1`
        );
        const data = await response.json();
        
        if (data.features?.[0]) {
          const feature = data.features[0];
          location = {
            address: feature.place_name,
            latitude: feature.center[1],
            longitude: feature.center[0]
          };
        }
      }

      if (location) {
        setSelectedLocation(location);
        setAddress(location.address);
        setSuggestions([]);
        
        // Update map
        if (map.current) {
          map.current.flyTo({
            center: [location.longitude, location.latitude],
            zoom: 14
          });
          
          if (marker.current) {
            marker.current.setLngLat([location.longitude, location.latitude]);
          } else {
            marker.current = new mapboxgl.Marker({
              color: '#DC2626',
              draggable: true
            })
              .setLngLat([location.longitude, location.latitude])
              .addTo(map.current!);
          }
        }
        
        toast.success('Ubicación encontrada');
      } else {
        toast.error('No se pudo encontrar el código postal');
      }
    } catch (error) {
      console.error('Error searching postal code:', error);
      toast.error('Error al buscar el código postal');
    } finally {
      setLoading(false);
    }
  };

  const selectAddress = async (suggestion: any) => {
    try {
      let location = null;

      // Handle Google Places result
      if (suggestion.place_id && googleApiKey) {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/details/json?place_id=${suggestion.place_id}&key=${googleApiKey}`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.result?.geometry?.location) {
            location = {
              address: suggestion.description,
              latitude: data.result.geometry.location.lat,
              longitude: data.result.geometry.location.lng
            };
          }
        }
      }

      // Handle Mapbox result or fallback
      if (!location && suggestion.geometry?.location) {
        location = {
          address: suggestion.description,
          latitude: suggestion.geometry.location.lat,
          longitude: suggestion.geometry.location.lng
        };
      }

      if (location) {
        setSelectedLocation(location);
        setAddress(location.address);
        setSuggestions([]);
        
        // Update map
        if (map.current) {
          map.current.flyTo({
            center: [location.longitude, location.latitude],
            zoom: 14
          });
          
          if (marker.current) {
            marker.current.setLngLat([location.longitude, location.latitude]);
          } else {
            marker.current = new mapboxgl.Marker({
              color: '#DC2626',
              draggable: true
            })
              .setLngLat([location.longitude, location.latitude])
              .addTo(map.current!);
          }
        }
      }
    } catch (error) {
      console.error('Error selecting address:', error);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          const address = await reverseGeocode(longitude, latitude);
          const location = {
            address,
            latitude,
            longitude
          };
          
          setSelectedLocation(location);
          setAddress(location.address);
          
          // Update map
          if (map.current) {
            map.current.flyTo({
              center: [longitude, latitude],
              zoom: 14
            });
            
            if (marker.current) {
              marker.current.setLngLat([longitude, latitude]);
            } else {
              marker.current = new mapboxgl.Marker({
                color: '#DC2626',
                draggable: true
              })
                .setLngLat([longitude, latitude])
                .addTo(map.current!);
            }
          }
          
          setLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('No se pudo obtener la ubicación');
          setLoading(false);
        }
      );
    }
  };

  const checkZone = async (lat: number, lng: number) => {
    try {
      const { data: zones } = await supabase
        .from('zones')
        .select('*')
        .eq('is_active', true);

      if (zones && zones.length > 0) {
        const selectedZone = zones[0];
        setZone(selectedZone);
        
        const price = selectedZone.pricing_type === 'fixed' 
          ? service.base_price + (selectedZone.fixed_price || 0)
          : service.base_price * (selectedZone.multiplier || 1);
          
        setFinalPrice(price);
      } else {
        setZone(null);
        setFinalPrice(service.base_price);
      }
    } catch (error) {
      console.error('Error checking zones:', error);
    }
  };

  const handleContinue = () => {
    if (!canContinue) {
      toast.error('Por favor ingresa una dirección');
      return;
    }

    // Use selected location if available, otherwise use manual address
    const locationData = selectedLocation || {
      address: address,
      latitude: 0,
      longitude: 0
    };

    onAddressSelect({
      address: locationData.address,
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      zone: zone || undefined,
      finalPrice
    });
  };

  return (
    <div className="space-y-6">
      {/* Address Search */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="address">Buscar dirección</Label>
          <div className="relative">
            <Input
              id="address"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                searchAddresses(e.target.value);
              }}
              placeholder="Escribe tu dirección completa..."
              className="pr-10"
            />
            <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
          </div>
          
          {suggestions.length > 0 && (
            <Card className="mt-2 max-h-48 overflow-y-auto">
              <CardContent className="p-2">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={suggestion.place_id || index}
                    className="p-2 hover:bg-gray-100 cursor-pointer rounded"
                    onClick={() => selectAddress(suggestion)}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{suggestion.description}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Postal Code Search */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="postal-code">Código Postal</Label>
            <Input
              id="postal-code"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="Ej: 06100"
              onKeyPress={(e) => e.key === 'Enter' && searchByPostalCode()}
            />
          </div>
          <div className="flex items-end">
            <Button 
              onClick={searchByPostalCode} 
              variant="outline"
              disabled={loading}
            >
              {loading ? 'Buscando...' : 'Buscar CP'}
            </Button>
          </div>
        </div>

        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={getCurrentLocation}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <Navigation className="h-4 w-4" />
            {loading ? 'Obteniendo ubicación...' : 'Usar mi ubicación actual'}
          </Button>
        </div>
      </div>

      {/* Map */}
      {!mapLoading && mapboxToken && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Mapa</CardTitle>
            <p className="text-sm text-gray-600">
              Haz clic en el mapa para seleccionar tu ubicación exacta
            </p>
          </CardHeader>
          <CardContent>
            <div ref={mapContainer} className="w-full h-64 rounded-lg border" />
          </CardContent>
        </Card>
      )}

      {/* Selected Location Display */}
      {selectedLocation && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ubicación seleccionada</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{selectedLocation.address}</span>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Precio del servicio:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Precio base:</span>
                    <span>${service.base_price}</span>
                  </div>
                  {zone && (
                    <div className="flex justify-between">
                      <span>Zona {zone.name}:</span>
                      <span>
                        {zone.pricing_type === 'fixed' 
                          ? `+$${zone.fixed_price}`
                          : `x${zone.multiplier}`
                        }
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span className="text-green-600">${finalPrice}</span>
                  </div>
                </div>
                
                {!zone && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-yellow-800 text-sm">
                      ⚠️ Esta dirección no está dentro de nuestras áreas de servicio regulares. 
                      Puedes continuar para agendar una cita de evaluación.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Continue Button */}
      <div className="flex flex-col gap-3">
        <Button 
          onClick={handleContinue} 
          className="w-full"
          disabled={!canContinue}
        >
          Continuar {selectedLocation ? 'con ubicación confirmada' : 'con dirección ingresada'}
        </Button>
        
        {!selectedLocation && address.trim().length > 0 && (
          <p className="text-sm text-gray-600 text-center">
            Puedes continuar con la dirección que escribiste, aunque no la hayas confirmado en el mapa
          </p>
        )}
      </div>
    </div>
  );
};

export default AddressSelection;
