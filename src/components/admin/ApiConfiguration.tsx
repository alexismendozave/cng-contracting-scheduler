
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Key, Edit, Save, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ApiConfig } from "./types";

interface ApiConfigurationProps {
  apiConfigs: ApiConfig[];
  onDataRefresh: () => void;
}

const ApiConfiguration = ({ apiConfigs, onDataRefresh }: ApiConfigurationProps) => {
  const [editingApi, setEditingApi] = useState<string | null>(null);
  const [apiValues, setApiValues] = useState<Record<string, string>>({});

  // Ensure Google Maps API config exists
  const ensureGoogleMapsConfig = async () => {
    const googleMapsExists = apiConfigs.find(api => api.name === 'google_maps');
    
    if (!googleMapsExists) {
      try {
        const { error } = await supabase
          .from('api_configs')
          .insert({
            name: 'google_maps',
            is_active: true,
            config_data: {
              description: 'Google Maps API para búsqueda de direcciones y geocodificación'
            }
          });

        if (error) {
          console.error('Error creating Google Maps config:', error);
        } else {
          onDataRefresh();
        }
      } catch (error) {
        console.error('Error ensuring Google Maps config:', error);
      }
    }
  };

  // Check if Google Maps config exists on component mount
  useState(() => {
    ensureGoogleMapsConfig();
  });

  const handleUpdateApiKey = async (apiId: string, apiKey: string) => {
    if (!apiKey.trim()) {
      toast.error('Por favor ingresa un API key válido');
      return;
    }

    const { error } = await supabase
      .from('api_configs')
      .update({ api_key: apiKey })
      .eq('id', apiId);

    if (error) {
      toast.error('Error al actualizar API key: ' + error.message);
    } else {
      toast.success('API key actualizada exitosamente');
      setEditingApi(null);
      setApiValues({});
      onDataRefresh();
    }
  };

  const handleAddGoogleMaps = async () => {
    try {
      const { error } = await supabase
        .from('api_configs')
        .insert({
          name: 'google_maps',
          is_active: true,
          config_data: {
            description: 'Google Maps API para búsqueda de direcciones y geocodificación'
          }
        });

      if (error) {
        toast.error('Error al crear configuración: ' + error.message);
      } else {
        toast.success('Configuración de Google Maps creada');
        onDataRefresh();
      }
    } catch (error) {
      console.error('Error adding Google Maps config:', error);
      toast.error('Error al crear la configuración');
    }
  };

  const getApiKeyPlaceholder = (apiName: string) => {
    switch (apiName) {
      case 'google_maps':
        return 'AIzaSy...';
      case 'mapbox':
        return 'pk.eyJ1...';
      default:
        return 'Pegar API key aquí...';
    }
  };

  const getApiKeyHelp = (apiName: string) => {
    switch (apiName) {
      case 'google_maps':
        return (
          <p className="text-xs text-blue-600 mt-2">
            💡 Obtén tu API key en <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a>
            <br />
            Habilita: Places API, Geocoding API, Maps JavaScript API
          </p>
        );
      case 'mapbox':
        return (
          <p className="text-xs text-blue-600 mt-2">
            💡 Obtén tu token en <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="underline">mapbox.com</a>
          </p>
        );
      default:
        return null;
    }
  };

  // Check if Google Maps config is missing
  const googleMapsConfig = apiConfigs.find(api => api.name === 'google_maps');
  const showAddGoogleMaps = !googleMapsConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Configuración de APIs
        </CardTitle>
        <CardDescription>
          Gestiona las claves de API para servicios externos como Google Maps y Mapbox
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {showAddGoogleMaps && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <div className="text-center">
                <h4 className="font-semibold text-gray-900 mb-2">Google Maps API</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Añade Google Maps API para mejorar la búsqueda de direcciones y funciones de mapa
                </p>
                <Button onClick={handleAddGoogleMaps} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir Google Maps API
                </Button>
              </div>
            </div>
          )}

          {apiConfigs.map((api) => (
            <div key={api.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold capitalize flex items-center gap-2">
                    {api.name === 'google_maps' && '🗺️ '}
                    {api.name === 'mapbox' && '🌍 '}
                    {api.name.replace('_', ' ')}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {api.config_data?.description || `Configuración para ${api.name}`}
                  </p>
                </div>
                <Badge variant={api.is_active ? "default" : "secondary"}>
                  {api.is_active ? "Activo" : "Inactivo"}
                </Badge>
              </div>
              
              <div className="flex gap-2">
                {editingApi === api.id ? (
                  <>
                    <Input
                      type="text"
                      value={apiValues[api.id] || ''}
                      onChange={(e) => setApiValues({
                        ...apiValues,
                        [api.id]: e.target.value
                      })}
                      placeholder={getApiKeyPlaceholder(api.name)}
                      className="flex-1"
                    />
                    <Button 
                      onClick={() => handleUpdateApiKey(api.id, apiValues[api.id])}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button 
                      onClick={() => {
                        setEditingApi(null);
                        setApiValues({});
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Cancelar
                    </Button>
                  </>
                ) : (
                  <>
                    <Input
                      type="password"
                      value={api.api_key ? '••••••••••••••••' : ''}
                      placeholder={api.api_key ? 'API key configurada' : 'API key no configurada'}
                      className="flex-1"
                      disabled
                    />
                    <Button 
                      onClick={() => setEditingApi(api.id)}
                      variant="outline"
                      size="sm"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
              
              {getApiKeyHelp(api.name)}
            </div>
          ))}

          {apiConfigs.length === 0 && !showAddGoogleMaps && (
            <div className="text-center py-8 text-gray-500">
              <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay configuraciones de API disponibles</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiConfiguration;
