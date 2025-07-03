
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Search, Navigation } from "lucide-react";
import { toast } from "sonner";

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
  const [address, setAddress] = useState("");
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

  useEffect(() => {
    fetchGoogleApiKey();
  }, []);

  useEffect(() => {
    if (selectedLocation) {
      checkZone(selectedLocation.latitude, selectedLocation.longitude);
    }
  }, [selectedLocation]);

  const fetchGoogleApiKey = async () => {
    try {
      const { data } = await supabase
        .from('api_configs')
        .select('api_key')
        .eq('name', 'google_maps')
        .single();
      
      if (data?.api_key) {
        setGoogleApiKey(data.api_key);
      }
    } catch (error) {
      console.error('Error fetching Google API key:', error);
    }
  };

  const searchAddresses = async (query: string) => {
    if (!query.trim() || !googleApiKey) return;

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${googleApiKey}`
      );
      const data = await response.json();
      
      if (data.predictions) {
        setSuggestions(data.predictions);
      }
    } catch (error) {
      console.error('Error searching addresses:', error);
    }
  };

  const selectAddress = async (placeId: string, description: string) => {
    if (!googleApiKey) return;

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${googleApiKey}`
      );
      const data = await response.json();
      
      if (data.result?.geometry?.location) {
        const location = {
          address: description,
          latitude: data.result.geometry.location.lat,
          longitude: data.result.geometry.location.lng
        };
        
        setSelectedLocation(location);
        setAddress(description);
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Error getting place details:', error);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Reverse geocode to get address
          if (googleApiKey) {
            try {
              const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${googleApiKey}`
              );
              const data = await response.json();
              
              if (data.results?.[0]) {
                const location = {
                  address: data.results[0].formatted_address,
                  latitude,
                  longitude
                };
                
                setSelectedLocation(location);
                setAddress(location.address);
              }
            } catch (error) {
              console.error('Error reverse geocoding:', error);
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

      // This is a simplified zone check - in a real app you'd use proper geospatial queries
      // For now, we'll just check if there are any zones and assign the first one
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
    if (!selectedLocation) {
      toast.error('Por favor selecciona una dirección');
      return;
    }

    onAddressSelect({
      address: selectedLocation.address,
      latitude: selectedLocation.latitude,
      longitude: selectedLocation.longitude,
      zone: zone || undefined,
      finalPrice
    });
  };

  return (
    <div className="space-y-6">
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
              placeholder="Escribe tu dirección..."
              className="pr-10"
            />
            <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
          </div>
          
          {suggestions.length > 0 && (
            <Card className="mt-2">
              <CardContent className="p-2">
                {suggestions.map((suggestion) => (
                  <div
                    key={suggestion.place_id}
                    className="p-2 hover:bg-gray-100 cursor-pointer rounded"
                    onClick={() => selectAddress(suggestion.place_id, suggestion.description)}
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
              
              <Button onClick={handleContinue} className="w-full">
                Continuar con esta dirección
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AddressSelection;
