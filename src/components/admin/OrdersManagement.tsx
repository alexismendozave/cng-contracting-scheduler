import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileText, DollarSign, Package, TrendingUp, Download, Eye, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  tax_amount: number;
  discount_amount: number;
  status: 'draft' | 'pending' | 'paid' | 'cancelled' | 'refunded';
  created_at: string;
  booking_id?: string;
}

const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  refunded: "bg-orange-100 text-orange-800"
};

const statusLabels = {
  draft: "Borrador",
  pending: "Pendiente",
  paid: "Pagado",
  cancelled: "Cancelado",
  refunded: "Reembolsado"
};

export default function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    paidOrders: 0,
    pendingOrders: 0
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Mock data - en producción conectar con tabla orders
      const mockOrders: Order[] = [
        {
          id: '1',
          order_number: 'ORD-001',
          customer_name: 'Juan Pérez',
          customer_email: 'juan@email.com',
          total_amount: 150.00,
          tax_amount: 15.00,
          discount_amount: 0,
          status: 'paid',
          created_at: new Date().toISOString(),
          booking_id: 'booking-1'
        },
        {
          id: '2',
          order_number: 'ORD-002',
          customer_name: 'María García',
          customer_email: 'maria@email.com',
          total_amount: 200.00,
          tax_amount: 20.00,
          discount_amount: 10.00,
          status: 'pending',
          created_at: new Date().toISOString(),
          booking_id: 'booking-2'
        }
      ];

      setOrders(mockOrders);
      
      // Calculate stats
      const totalOrders = mockOrders.length;
      const totalRevenue = mockOrders.reduce((sum, order) => sum + order.total_amount, 0);
      const paidOrders = mockOrders.filter(order => order.status === 'paid').length;
      const pendingOrders = mockOrders.filter(order => order.status === 'pending').length;

      setStats({
        totalOrders,
        totalRevenue,
        paidOrders,
        pendingOrders
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const OrderCard = ({ order }: { order: Order }) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {order.order_number}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{order.customer_name}</p>
          </div>
          <Badge className={statusColors[order.status]}>
            {statusLabels[order.status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span>Total: ${order.total_amount}</span>
          </div>
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span>Impuestos: ${order.tax_amount}</span>
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <Button size="sm" variant="outline">
            <Eye className="h-4 w-4 mr-1" />
            Ver Factura
          </Button>
          <Button size="sm" variant="outline">
            <Download className="h-4 w-4 mr-1" />
            Descargar PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const StatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total Pedidos</p>
              <p className="text-2xl font-bold">{stats.totalOrders}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Ingresos Totales</p>
              <p className="text-2xl font-bold">${stats.totalRevenue}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Pedidos Pagados</p>
              <p className="text-2xl font-bold">{stats.paidOrders}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Pendientes</p>
              <p className="text-2xl font-bold">{stats.pendingOrders}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Pedidos</h1>
          <p className="text-muted-foreground">Sistema completo de facturación y control de pedidos</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Pedido
        </Button>
      </div>

      <StatsCards />

      <Tabs defaultValue="orders" className="w-full">
        <TabsList>
          <TabsTrigger value="orders">Pedidos</TabsTrigger>
          <TabsTrigger value="analytics">Analíticas</TabsTrigger>
          <TabsTrigger value="settings">Configuración</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Todos los Pedidos ({orders.length})</h3>
          </div>
          
          <div className="grid gap-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
            
            {orders.length === 0 && (
              <Card className="p-6 text-center">
                <p className="text-muted-foreground">No hay pedidos disponibles</p>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <Card className="p-6 text-center">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Analíticas de pedidos en desarrollo</p>
            <p className="text-sm">Aquí se mostrarán gráficos de ventas, tendencias y reportes detallados</p>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="p-6 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Configuración de facturación en desarrollo</p>
            <p className="text-sm">Configurar impuestos, numeración, plantillas de factura, etc.</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}