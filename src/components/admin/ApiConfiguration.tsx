
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Key, Edit, Save } from "lucide-react";
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

  const handleUpdateApiKey = async (apiId: string, apiKey: string) => {
    const { error } = await supabase
      .from('api_configs')
      .update({ api_key: apiKey })
      .eq('id', apiId);

    if (error) {
      toast.error('Error al actualizar API key: ' + error.message);
    } else {
      toast.success('API key actualizada exitosamente');
      setEditingApi(null);
      onDataRefresh();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Configuración de APIs
        </CardTitle>
        <CardDescription>
          Gestiona las claves de API para servicios externos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {apiConfigs.map((api) => (
            <div key={api.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold capitalize">{api.name}</h4>
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
                      placeholder="Pegar API key aquí..."
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
                      onClick={() => setEditingApi(null)}
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
                      placeholder="API key no configurada"
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
              
              {api.name === 'mapbox' && (
                <p className="text-xs text-blue-600 mt-2">
                  💡 Obtén tu token en <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="underline">mapbox.com</a>
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiConfiguration;
