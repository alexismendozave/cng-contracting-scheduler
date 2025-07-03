import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { ArrowUp, ArrowDown, DollarSign, Calendar, Users, FileText } from "lucide-react";

interface DashboardStats {
  totalBookings: number;
  totalRevenue: number;
  monthlyBookings: number;
  activeServices: number;
  bookingGrowth: number;
  revenueGrowth: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    totalRevenue: 0,
    monthlyBookings: 0,
    activeServices: 0,
    bookingGrowth: 0,
    revenueGrowth: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch total bookings
      const { count: totalBookings } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true });

      // Fetch total revenue
      const { data: revenueData } = await supabase
        .from('bookings')
        .select('total_amount')
        .not('total_amount', 'is', null);

      const totalRevenue = revenueData?.reduce((sum, booking) => sum + (Number(booking.total_amount) || 0), 0) || 0;

      // Fetch monthly bookings (current month)
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: monthlyBookings } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString());

      // Fetch active services
      const { count: activeServices } = await supabase
        .from('services')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      setStats({
        totalBookings: totalBookings || 0,
        totalRevenue,
        monthlyBookings: monthlyBookings || 0,
        activeServices: activeServices || 0,
        bookingGrowth: 12, // Mock data for now
        revenueGrowth: 8,  // Mock data for now
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Ingresos Totales",
      value: `$${stats.totalRevenue.toLocaleString()}`,
      growth: stats.revenueGrowth,
      icon: DollarSign,
      color: "bg-gradient-to-r from-pink-500 to-rose-500",
    },
    {
      title: "Reservas del Mes",
      value: stats.monthlyBookings.toString(),
      growth: stats.bookingGrowth,
      icon: Calendar,
      color: "bg-gradient-to-r from-blue-500 to-cyan-500",
    },
    {
      title: "Total Reservas",
      value: stats.totalBookings.toString(),
      growth: 5,
      icon: Users,
      color: "bg-gradient-to-r from-green-500 to-emerald-500",
    },
    {
      title: "Servicios Activos",
      value: stats.activeServices.toString(),
      growth: 2,
      icon: FileText,
      color: "bg-gradient-to-r from-purple-500 to-violet-500",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Resumen general del sistema</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          const isPositive = card.growth > 0;
          
          return (
            <Card key={index} className="relative overflow-hidden">
              <div className={`absolute inset-0 ${card.color} opacity-10`} />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.color} bg-opacity-20`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{card.value}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {isPositive ? (
                    <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                  ) : (
                    <ArrowDown className="h-3 w-3 text-red-500 mr-1" />
                  )}
                  <span className={isPositive ? "text-green-500" : "text-red-500"}>
                    {Math.abs(card.growth)}%
                  </span>
                  <span className="ml-1">desde el mes pasado</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Reservas Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Juan Pérez</p>
                  <p className="text-sm text-muted-foreground">Limpieza Profunda</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">$150</p>
                  <p className="text-xs text-muted-foreground">Hoy</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">María García</p>
                  <p className="text-sm text-muted-foreground">Mantenimiento</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">$89</p>
                  <p className="text-xs text-muted-foreground">Ayer</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado del Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Base de Datos</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  Conectado
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">API External</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  Activo
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Pagos</span>
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                  Configurando
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}