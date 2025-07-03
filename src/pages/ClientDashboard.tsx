
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Calendar, MapPin, Clock, DollarSign, LogOut, User, Plus } from "lucide-react";

interface Booking {
  id: string;
  service_id: string;
  customer_name: string;
  customer_email: string;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
  total_amount: number;
  address: string;
  services: {
    name: string;
    category: string;
  };
  zones: {
    name: string;
  };
}

const ClientDashboard = () => {
  const { user, profile, signOut } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        services(name, category),
        zones(name)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bookings:', error);
    } else {
      setBookings(data || []);
    }

    setLoading(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando panel...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Mi Panel</h1>
              <p className="text-gray-600">Bienvenido, {profile?.full_name || user?.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/">
                <Button variant="outline" size="sm">
                  Ir al sitio web
                </Button>
              </Link>
              <Button onClick={signOut} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="px-6 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reservas</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bookings.length}</div>
              <p className="text-xs text-muted-foreground">Servicios solicitados</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Servicios Activos</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length}
              </div>
              <p className="text-xs text-muted-foreground">En proceso</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Gastado</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${bookings.reduce((sum, booking) => sum + (booking.total_amount || 0), 0).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">En servicios</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Link to="/booking">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Reserva
                  </Button>
                </Link>
                <Link to="/">
                  <Button variant="outline">
                    Ver Servicios Disponibles
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bookings List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Mis Reservas</CardTitle>
                <CardDescription>Historial de servicios solicitados</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes reservas</h3>
                <p className="text-gray-600 mb-4">¡Haz tu primera reserva para comenzar!</p>
                <Link to="/booking">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primera Reserva
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold">{booking.services?.name}</h4>
                        {getStatusBadge(booking.status)}
                      </div>
                      <div className="text-lg font-bold text-green-600">
                        ${booking.total_amount}
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {booking.scheduled_date} - {booking.scheduled_time}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {booking.zones?.name || 'Zona no especificada'}
                      </div>
                      {booking.address && (
                        <div className="flex items-center gap-2 md:col-span-2">
                          <MapPin className="h-4 w-4" />
                          {booking.address}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientDashboard;
