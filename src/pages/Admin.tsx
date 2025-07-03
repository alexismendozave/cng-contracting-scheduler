
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Eye
} from "lucide-react";
import { Link } from "react-router-dom";
import AdminZoneMap from "@/components/AdminZoneMap";

interface Zone {
  id: number;
  name: string;
  multiplier: number;
  description: string;
  color: string;
  coordinates: [number, number][];
}

const Admin = () => {
  // Mock data
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

  const services = [
    {
      id: 1,
      name: "Reparación de Plomería",
      category: "Plomería",
      basePrice: 89,
      active: true,
      bookings: 12
    },
    {
      id: 2,
      name: "Instalación Eléctrica",
      category: "Electricidad",
      basePrice: 95,
      active: true,
      bookings: 8
    },
    {
      id: 3,
      name: "Pintura Interior",
      category: "Pintura",
      basePrice: 150,
      active: true,
      bookings: 15
    }
  ];

  // State for zones management
  const [zones, setZones] = useState<Zone[]>([
    { 
      id: 1, 
      name: "Zona Centro", 
      multiplier: 1.0, 
      color: "#3B82F6", 
      description: "Área central de la ciudad",
      coordinates: [[-99.1332, 19.4326], [-99.1300, 19.4350], [-99.1280, 19.4310], [-99.1320, 19.4300]]
    },
    { 
      id: 2, 
      name: "Zona Norte", 
      multiplier: 1.15, 
      color: "#10B981", 
      description: "Zona norte residencial",
      coordinates: [[-99.1400, 19.4400], [-99.1350, 19.4450], [-99.1300, 19.4420], [-99.1370, 19.4380]]
    }
  ]);

  const [mapboxToken, setMapboxToken] = useState('');

  const handleZoneUpdate = (updatedZones: Zone[]) => {
    setZones(updatedZones);
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Panel Administrativo</h1>
              <p className="text-gray-600">CNG Contracting</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" asChild>
                <Link to="/">Ver Sitio Web</Link>
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Reserva
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="px-6 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reservas</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBookings}</div>
              <p className="text-xs text-muted-foreground">+12% desde el mes pasado</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+18% desde el mes pasado</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeCustomers}</div>
              <p className="text-xs text-muted-foreground">+5% desde el mes pasado</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Servicios Completados</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedServices}</div>
              <p className="text-xs text-muted-foreground">+22% desde el mes pasado</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="bookings">Reservas</TabsTrigger>
            <TabsTrigger value="services">Servicios</TabsTrigger>
            <TabsTrigger value="zones">Zonas</TabsTrigger>
            <TabsTrigger value="analytics">Análisis</TabsTrigger>
          </TabsList>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Reservas Recientes</CardTitle>
                    <CardDescription>Gestiona las reservas de servicios</CardDescription>
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Reserva
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h4 className="font-semibold">{booking.customer}</h4>
                          {getStatusBadge(booking.status)}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{booking.service}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {booking.date} - {booking.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {booking.zone}
                          </span>
                          <span className="font-medium text-green-600">
                            ${booking.price}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Gestión de Servicios</CardTitle>
                    <CardDescription>Administra los servicios disponibles</CardDescription>
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Servicio
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {services.map((service) => (
                    <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h4 className="font-semibold">{service.name}</h4>
                          <Badge variant="secondary">{service.category}</Badge>
                          {service.active && (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              Activo
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Precio base: ${service.basePrice}</span>
                          <span>{service.bookings} reservas</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Zones Tab - Now with Interactive Map */}
          <TabsContent value="zones" className="space-y-6">
            <AdminZoneMap 
              zones={zones}
              onZoneUpdate={handleZoneUpdate}
              mapboxToken={mapboxToken}
            />
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
                        <span className="text-sm text-gray-600">{service.bookings} reservas</span>
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
                          style={{ backgroundColor: zone.color }}
                        ></div>
                        <span className="font-medium">{zone.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full"
                            style={{ 
                              width: `${Math.min((zones.filter(z => z.id === zone.id).length / zones.length) * 100, 100)}%`,
                              backgroundColor: zone.color 
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
