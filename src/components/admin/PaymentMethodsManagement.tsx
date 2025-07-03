import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CreditCard, DollarSign, Building, Smartphone, Globe, Key, AlertCircle } from "lucide-react";

interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  is_active: boolean;
  config_data: any;
}

const paymentGateways = [
  {
    type: 'stripe',
    name: 'Stripe',
    icon: CreditCard,
    description: 'Tarjetas de crédito y débito',
    fields: ['public_key', 'secret_key', 'webhook_url'],
    color: 'bg-purple-500'
  },
  {
    type: 'paypal',
    name: 'PayPal',
    icon: DollarSign,
    description: 'Pagos con PayPal',
    fields: ['client_id', 'client_secret', 'webhook_url'],
    color: 'bg-blue-500'
  },
  {
    type: 'mercadopago',
    name: 'MercadoPago',
    icon: CreditCard,
    description: 'Pagos en Latinoamérica',
    fields: ['public_key', 'access_token', 'webhook_url'],
    color: 'bg-yellow-500'
  },
  {
    type: 'interac',
    name: 'Interac',
    icon: Building,
    description: 'Transferencias en Canadá',
    fields: ['merchant_id', 'api_key'],
    color: 'bg-red-500'
  },
  {
    type: 'wise',
    name: 'Wise (TransferWise)',
    icon: Globe,
    description: 'Transferencias internacionales',
    fields: ['api_key', 'profile_id'],
    color: 'bg-green-500'
  },
  {
    type: 'cash',
    name: 'Efectivo',
    icon: DollarSign,
    description: 'Pago en efectivo al momento del servicio',
    fields: [],
    color: 'bg-gray-500'
  },
  {
    type: 'bank_transfer',
    name: 'Transferencia Bancaria',
    icon: Building,
    description: 'Transferencia directa a cuenta bancaria',
    fields: ['bank_name', 'account_holder', 'account_number', 'routing_number', 'swift_code'],
    color: 'bg-indigo-500'
  }
];

export default function PaymentMethodsManagement() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMethod, setEditingMethod] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('payment_methods')
        .select('*')
        .order('name');
      
      setPaymentMethods(data || []);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      toast.error('Error al cargar métodos de pago');
    } finally {
      setLoading(false);
    }
  };

  const handleConfigureMethod = (gateway: any) => {
    const existingMethod = paymentMethods.find(pm => pm.type === gateway.type);
    setEditingMethod(gateway);
    
    if (existingMethod) {
      setFormData({
        ...existingMethod.config_data,
        is_active: existingMethod.is_active
      });
    } else {
      const initialData: any = { is_active: false };
      gateway.fields.forEach((field: string) => {
        initialData[field] = '';
      });
      setFormData(initialData);
    }
  };

  const handleSaveMethod = async () => {
    if (!editingMethod) return;

    try {
      const existingMethod = paymentMethods.find(pm => pm.type === editingMethod.type);
      
      const methodData = {
        name: editingMethod.name,
        type: editingMethod.type,
        is_active: formData.is_active,
        config_data: { ...formData }
      };

      if (existingMethod) {
        const { error } = await supabase
          .from('payment_methods')
          .update(methodData)
          .eq('id', existingMethod.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('payment_methods')
          .insert([methodData]);
        if (error) throw error;
      }

      toast.success('Método de pago configurado exitosamente');
      setEditingMethod(null);
      setFormData({});
      fetchPaymentMethods();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al guardar configuración');
    }
  };

  const getMethodStatus = (type: string) => {
    const method = paymentMethods.find(pm => pm.type === type);
    return method?.is_active || false;
  };

  const PaymentGatewayCard = ({ gateway }: { gateway: any }) => {
    const Icon = gateway.icon;
    const isConfigured = paymentMethods.some(pm => pm.type === gateway.type);
    const isActive = getMethodStatus(gateway.type);

    return (
      <Card className="relative">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${gateway.color} text-white`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">{gateway.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{gateway.description}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant={isActive ? "default" : "secondary"}>
                {isActive ? "Activo" : "Inactivo"}
              </Badge>
              {isConfigured && (
                <Badge variant="outline" className="text-xs">
                  Configurado
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => handleConfigureMethod(gateway)}
            variant={isConfigured ? "outline" : "default"}
            className="w-full"
          >
            {isConfigured ? "Editar Configuración" : "Configurar"}
          </Button>
        </CardContent>
      </Card>
    );
  };

  const ConfigurationForm = () => {
    if (!editingMethod) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <editingMethod.icon className="h-5 w-5" />
            Configurar {editingMethod.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="is_active">Habilitar método de pago</Label>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
            />
          </div>

          {editingMethod.type === 'bank_transfer' && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bank_name">Nombre del Banco</Label>
                  <Input
                    id="bank_name"
                    value={formData.bank_name || ''}
                    onChange={(e) => setFormData({...formData, bank_name: e.target.value})}
                    placeholder="Banco Nacional"
                  />
                </div>
                <div>
                  <Label htmlFor="account_holder">Titular de la Cuenta</Label>
                  <Input
                    id="account_holder"
                    value={formData.account_holder || ''}
                    onChange={(e) => setFormData({...formData, account_holder: e.target.value})}
                    placeholder="Mi Empresa S.A."
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="account_number">Número de Cuenta</Label>
                  <Input
                    id="account_number"
                    value={formData.account_number || ''}
                    onChange={(e) => setFormData({...formData, account_number: e.target.value})}
                    placeholder="1234567890"
                  />
                </div>
                <div>
                  <Label htmlFor="routing_number">Código de Routing</Label>
                  <Input
                    id="routing_number"
                    value={formData.routing_number || ''}
                    onChange={(e) => setFormData({...formData, routing_number: e.target.value})}
                    placeholder="021000021"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="swift_code">Código SWIFT (Internacional)</Label>
                <Input
                  id="swift_code"
                  value={formData.swift_code || ''}
                  onChange={(e) => setFormData({...formData, swift_code: e.target.value})}
                  placeholder="BOFAUS3N"
                />
              </div>
              <div>
                <Label htmlFor="transfer_instructions">Instrucciones Adicionales</Label>
                <Textarea
                  id="transfer_instructions"
                  value={formData.transfer_instructions || ''}
                  onChange={(e) => setFormData({...formData, transfer_instructions: e.target.value})}
                  placeholder="Instrucciones especiales para la transferencia..."
                />
              </div>
            </div>
          )}

          {editingMethod.fields.map((field: string) => (
            <div key={field}>
              <Label htmlFor={field} className="flex items-center gap-2">
                {field.includes('secret') || field.includes('key') ? (
                  <Key className="h-4 w-4" />
                ) : null}
                {field.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                {field.includes('secret') || field.includes('key') ? (
                  <Badge variant="outline" className="text-xs">Seguro</Badge>
                ) : null}
              </Label>
              <Input
                id={field}
                type={field.includes('secret') || field.includes('key') ? 'password' : 'text'}
                value={formData[field] || ''}
                onChange={(e) => setFormData({...formData, [field]: e.target.value})}
                placeholder={`Ingresa tu ${field.replace(/_/g, ' ')}`}
              />
            </div>
          ))}

          {editingMethod.type === 'stripe' && (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800">Configuración de Stripe</p>
                  <p className="text-yellow-700">
                    Necesitas obtener tus claves de API desde el dashboard de Stripe. 
                    Las claves secretas se almacenan de forma segura.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSaveMethod} className="flex-1">
              Guardar Configuración
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setEditingMethod(null);
                setFormData({});
              }}
            >
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

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
        <h1 className="text-3xl font-bold">Métodos de Pago</h1>
        <p className="text-muted-foreground">Configura las pasarelas de pago para tu negocio</p>
      </div>

      {editingMethod && <ConfigurationForm />}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {paymentGateways.map((gateway) => (
          <PaymentGatewayCard key={gateway.type} gateway={gateway} />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Métodos Configurados</CardTitle>
        </CardHeader>
        <CardContent>
          {paymentMethods.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No hay métodos de pago configurados aún
            </p>
          ) : (
            <div className="space-y-2">
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{method.name}</p>
                    <p className="text-sm text-muted-foreground">{method.type}</p>
                  </div>
                  <Badge variant={method.is_active ? "default" : "secondary"}>
                    {method.is_active ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}