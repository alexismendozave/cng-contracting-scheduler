
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Calendar, 
  Users, 
  Wrench, 
  DollarSign, 
  MapPin, 
  BarChart3,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  LogOut,
  Key,
  CreditCard,
  Save
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AdminZoneMap from "@/components/AdminZoneMap";

// Update Zone interface to match database schema
interface Zone {
  id: string;
  name: string;
  multiplier: number;
  description: string | null;
  color: string | null;
  coordinates: any; // Using any for now since coordinates can be various JSON formats
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Service {
  id: string;
  name: string;
  category: string;
  base_price: number;
  description: string;
  duration_minutes: number;
  is_active: boolean;
}

interface ApiConfig {
  id: string;
  name: string;
  api_key: string;
  config_data: any;
  is_active: boolean;
}

interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  config_data: any;
  is_active: boolean;
}

const Admin = () => {
  const { user, profile, signOut } = useAuth();
  const [zones, setZones] = useState<Zone[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [apiConfigs, setApiConfigs] = useState<ApiConfig[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  // New service form
  const [newService, setNewService] = useState({
    name: '',
    category: '',
    description: '',
    base_price: '',
    duration_minutes: ''
  });

  // API Configuration states
  const [editingApi, setEditingApi] = useState<string | null>(null);
  const [apiValues, setApiValues] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch zones
    const { data: zonesData } = await supabase
      .from('zones')
      .select('*')
      .order('name');
    
    // Fetch services
    const { data: servicesData } = await supabase
      .from('services')
      .select('*')
      .order('name');
    
    // Fetch API configs
    const { data: apiData } = await supabase
      .from('api_configs')
      .select('*')
      .order('name');
    
    // Fetch payment methods
    const { data: paymentData } = await supabase
      .from('payment_methods')
      .select('*')
      .order('name');

    setZones(zonesData || []);
    setServices(servicesData || []);
    setApiConfigs(apiData || []);
    setPaymentMethods(paymentData || []);
    
    // Initialize API values
    const initialApiValues: Record<string, string> = {};
    apiData?.forEach(api => {
      initialApiValues[api.id] = api.api_key || '';
    });
    setApiValues(initialApiValues);
    
    setLoading(false);
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase
      .from('services')
      .insert([{
        name: newService.name,
        category: newService.category,
        description: newService.description,
        base_price: parseFloat(newService.base_price),
        duration_minutes: parseInt(newService.duration_minutes) || null
      }]);

    if (error) {
      toast.error('Error al crear servicio: ' + error.message);
    } else {
      toast.success('Servicio creado exitosamente');
      setNewService({
        name: '',
        category: '',
        description: '',
        base_price: '',
        duration_minutes: ''
      });
      fetchData();
    }
  };

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
      fetchData();
    }
  };

  const handleZoneUpdate = (updatedZones: Zone[]) => {
    setZones(updatedZones);
  };

  // Mock data for dashboard stats
  const stats = {
    totalBookings: 45,
    totalRevenue: 8750,
    activeCustomers: 32,
    completedServices: 38
  };

  const recentBookings = [
    {
      id: 1,
      customer: "Juan Pérez",
      service: "Reparación de Plomería",
      date: "2024-07-05",
      time: "10:00",
      status: "confirmed",
      price: 89,
      zone: "Zona Centro"
    },
    {
      id: 2,
      customer: "María González",
      service: "Instalación Eléctrica", 
      date: "2024-07-06",
      time: "14:00",
      status: "pending",
      price: 95,
      zone: "Zona Norte"
    },
    {
      id: 3,
      customer: "Carlos Silva",
      service: "Pintura Interior",
      date: "2024-07-07",
      time: "09:00",
      status: "completed",
      price: 150,
      zone: "Zona Sur"
    }
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: "secondary" as const, text: "Pendiente" },
      confirmed: { variant: "default" as const, text: "Confirmado" },
      completed: { variant: "outline" as const, text: "Completado" },
      cancelled: { variant: "destructive" as const, text: "Cancelado" }
    };
    
    const config = variants[status as keyof typeof variants] || variants.pending;
    
    return (
      <Badge variant={config.variant}>
        {config.text}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando panel administrativo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Panel Administrativo</h1>
              <p className="text-gray-600">
                Bienvenido, {profile?.full_name} ({profile?.role})
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={signOut} variant="outline">
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="px-6 py-6">
        {/* Main Content */}
        <Tabs defaultValue="services" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="services">Servicios</TabsTrigger>
            <TabsTrigger value="zones">Zonas</TabsTrigger>
            <TabsTrigger value="apis">APIs</TabsTrigger>
            <TabsTrigger value="payments">Pagos</TabsTrigger>
            <TabsTrigger value="analytics">Análisis</TabsTrigger>
          </TabsList>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Create Service */}
              <Card>
                <CardHeader>
                  <CardTitle>Crear Nuevo Servicio</CardTitle>
                  <CardDescription>Agrega servicios desde el panel</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateService} className="space-y-4">
                    <div>
                      <Label htmlFor="serviceName">Nombre del Servicio</Label>
                      <Input
                        id="serviceName"
                        value={newService.name}
                        onChange={(e) => setNewService({...newService, name: e.target.value})}
                        placeholder="Reparación de Plomería"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="serviceCategory">Categoría</Label>
                      <Input
                        id="serviceCategory"
                        value={newService.category}
                        onChange={(e) => setNewService({...newService, category: e.target.value})}
                        placeholder="Plomería"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="serviceDescription">Descripción</Label>
                      <Textarea
                        id="serviceDescription"
                        value={newService.description}
                        onChange={(e) => setNewService({...newService, description: e.target.value})}
                        placeholder="Descripción del servicio..."
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="servicePrice">Precio Base ($)</Label>
                      <Input
                        id="servicePrice"
                        type="number"
                        step="0.01"
                        value={newService.base_price}
                        onChange={(e) => setNewService({...newService, base_price: e.target.value})}
                        placeholder="89.99"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="serviceDuration">Duración (minutos)</Label>
                      <Input
                        id="serviceDuration"
                        type="number"
                        value={newService.duration_minutes}
                        onChange={(e) => setNewService({...newService, duration_minutes: e.target.value})}
                        placeholder="120"
                      />
                    </div>
                    
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Servicio
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Services List */}
              <Card>
                <CardHeader>
                  <CardTitle>Servicios Existentes</CardTitle>
                  <CardDescription>Gestiona los servicios disponibles</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {services.map((service) => (
                      <div key={service.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{service.name}</h4>
                          <Badge variant={service.is_active ? "default" : "secondary"}>
                            {service.is_active ? "Activo" : "Inactivo"}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-green-600 font-medium">${service.base_price}</span>
                          <span className="text-gray-500">{service.category}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Zones Tab */}
          <TabsContent value="zones" className="space-y-6">
            <AdminZoneMap 
              zones={zones}
              onZoneUpdate={handleZoneUpdate}
            />
          </TabsContent>

          {/* APIs Tab */}
          <TabsContent value="apis" className="space-y-6">
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
                              type="password"
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
          </TabsContent>

          {/* Payment Methods Tab */}
          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Métodos de Pago
                </CardTitle>
                <CardDescription>
                  Configura los métodos de pago disponibles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{method.name}</h4>
                        <Badge variant={method.is_active ? "default" : "secondary"}>
                          {method.is_active ? "Activo" : "Inactivo"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Tipo: {method.type}
                      </p>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Configurar
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Ingresos por Mes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                      <p>Gráfico de ingresos</p>
                      <p className="text-sm">Integrar con Recharts</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Servicios Más Populares</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {services.map((service, index) => (
                      <div key={service.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                          <span className="font-medium">{service.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Distribución por Zonas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {zones.map((zone) => (
                    <div key={zone.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: zone.color || '#3B82F6' }}
                        ></div>
                        <span className="font-medium">{zone.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full"
                            style={{ 
                              width: `${Math.min((zones.filter(z => z.id === zone.id).length / zones.length) * 100, 100)}%`,
                              backgroundColor: zone.color || '#3B82F6'
                            }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{zone.multiplier}x</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
