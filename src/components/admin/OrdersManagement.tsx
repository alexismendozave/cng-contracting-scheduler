import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FileText, DollarSign, Package, TrendingUp, Download, Eye, Plus, Settings, BarChart3, Receipt, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

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

  const handleViewInvoice = (orderId: string) => {
    // Aquí se implementaría la lógica para ver la factura
    toast.info(`Abriendo factura para pedido ${orderId}`);
  };

  const handleDownloadInvoice = (orderId: string) => {
    // Aquí se implementaría la lógica para descargar la factura en PDF
    toast.info(`Descargando factura para pedido ${orderId}`);
  };

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
          <Button size="sm" variant="outline" onClick={() => handleViewInvoice(order.id)}>
            <Eye className="h-4 w-4 mr-1" />
            Ver Factura
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleDownloadInvoice(order.id)}>
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
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Ventas por Mes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={[
                      { name: 'Ene', ventas: 1200 },
                      { name: 'Feb', ventas: 1800 },
                      { name: 'Mar', ventas: 2200 },
                      { name: 'Abr', ventas: 1900 },
                      { name: 'May', ventas: 2500 },
                      { name: 'Jun', ventas: 2800 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="ventas" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Estado de Pedidos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Pagados', value: 65, fill: '#22c55e' },
                          { name: 'Pendientes', value: 20, fill: '#eab308' },
                          { name: 'Cancelados', value: 10, fill: '#ef4444' },
                          { name: 'Reembolsados', value: 5, fill: '#f97316' }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Ingresos Mensuales</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { mes: 'Ene', ingresos: 15000 },
                    { mes: 'Feb', ingresos: 22000 },
                    { mes: 'Mar', ingresos: 28000 },
                    { mes: 'Abr', ingresos: 19000 },
                    { mes: 'May', ingresos: 31000 },
                    { mes: 'Jun', ingresos: 35000 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Ingresos']} />
                    <Bar dataKey="ingresos" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configuración de Facturación
                </CardTitle>
                <CardDescription>
                  Configura impuestos, numeración y plantillas de factura
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Configuración de Impuestos</h3>
                    <div className="space-y-2">
                      <Label htmlFor="tax-rate">Tasa de Impuesto (%)</Label>
                      <Input id="tax-rate" type="number" defaultValue="16" min="0" max="100" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tax-name">Nombre del Impuesto</Label>
                      <Input id="tax-name" defaultValue="IVA" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tax-number">Número de Identificación Fiscal</Label>
                      <Input id="tax-number" placeholder="RFC, NIT, etc." />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Numeración de Facturas</h3>
                    <div className="space-y-2">
                      <Label htmlFor="invoice-prefix">Prefijo de Factura</Label>
                      <Input id="invoice-prefix" defaultValue="FAC-" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="invoice-start">Número Inicial</Label>
                      <Input id="invoice-start" type="number" defaultValue="1000" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="invoice-digits">Dígitos Mínimos</Label>
                      <Select defaultValue="4">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 dígitos (001)</SelectItem>
                          <SelectItem value="4">4 dígitos (0001)</SelectItem>
                          <SelectItem value="5">5 dígitos (00001)</SelectItem>
                          <SelectItem value="6">6 dígitos (000001)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Plantilla de Factura</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company-name">Nombre de la Empresa</Label>
                      <Input id="company-name" placeholder="Mi Empresa S.A." />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company-address">Dirección</Label>
                      <Input id="company-address" placeholder="Calle 123, Ciudad" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company-phone">Teléfono</Label>
                      <Input id="company-phone" placeholder="+1 234 567 8900" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company-email">Email</Label>
                      <Input id="company-email" type="email" placeholder="info@empresa.com" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="footer-text">Texto del Pie de Página</Label>
                    <Textarea 
                      id="footer-text" 
                      placeholder="Gracias por su compra. Términos y condiciones aplican."
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button>
                    <Receipt className="h-4 w-4 mr-2" />
                    Guardar Configuración
                  </Button>
                  <Button variant="outline">
                    Vista Previa de Factura
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}