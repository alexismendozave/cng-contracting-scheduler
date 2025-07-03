
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CreditCard, Settings, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PaymentMethod } from "./types";

interface PaymentMethodsProps {
  paymentMethods: PaymentMethod[];
  onDataRefresh: () => void;
}

const PaymentMethods = ({ paymentMethods, onDataRefresh }: PaymentMethodsProps) => {
  const [editingPayment, setEditingPayment] = useState<string | null>(null);
  const [paymentValues, setPaymentValues] = useState<Record<string, any>>({});

  const handleUpdatePaymentMethod = async (paymentId: string, values: any) => {
    const { error } = await supabase
      .from('payment_methods')
      .update(values)
      .eq('id', paymentId);

    if (error) {
      toast.error('Error al actualizar método de pago: ' + error.message);
    } else {
      toast.success('Método de pago actualizado exitosamente');
      setEditingPayment(null);
      onDataRefresh();
    }
  };

  return (
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
        <div className="space-y-6">
          {paymentMethods.map((method) => (
            <div key={method.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-semibold">{method.name}</h4>
                  <p className="text-sm text-gray-600">Tipo: {method.type}</p>
                </div>
                <Badge variant={method.is_active ? "default" : "secondary"}>
                  {method.is_active ? "Activo" : "Inactivo"}
                </Badge>
              </div>

              {editingPayment === method.id ? (
                <div className="space-y-3">
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <Label>Public Key</Label>
                      <Input
                        type="text"
                        value={paymentValues[method.id]?.public_key || ''}
                        onChange={(e) => setPaymentValues({
                          ...paymentValues,
                          [method.id]: {
                            ...paymentValues[method.id],
                            public_key: e.target.value
                          }
                        })}
                        placeholder="pk_test_..."
                      />
                    </div>
                    <div>
                      <Label>Secret Key</Label>
                      <Input
                        type="password"
                        value={paymentValues[method.id]?.secret_key || ''}
                        onChange={(e) => setPaymentValues({
                          ...paymentValues,
                          [method.id]: {
                            ...paymentValues[method.id],
                            secret_key: e.target.value
                          }
                        })}
                        placeholder="sk_test_..."
                      />
                    </div>
                  </div>

                  {method.type === 'paypal' && (
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <Label>Client ID</Label>
                        <Input
                          type="text"
                          value={paymentValues[method.id]?.client_id || ''}
                          onChange={(e) => setPaymentValues({
                            ...paymentValues,
                            [method.id]: {
                              ...paymentValues[method.id],
                              client_id: e.target.value
                            }
                          })}
                          placeholder="PayPal Client ID"
                        />
                      </div>
                      <div>
                        <Label>Client Secret</Label>
                        <Input
                          type="password"
                          value={paymentValues[method.id]?.client_secret || ''}
                          onChange={(e) => setPaymentValues({
                            ...paymentValues,
                            [method.id]: {
                              ...paymentValues[method.id],
                              client_secret: e.target.value
                            }
                          })}
                          placeholder="PayPal Client Secret"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <Label>Webhook URL</Label>
                    <Input
                      type="url"
                      value={paymentValues[method.id]?.webhook_url || ''}
                      onChange={(e) => setPaymentValues({
                        ...paymentValues,
                        [method.id]: {
                          ...paymentValues[method.id],
                          webhook_url: e.target.value
                        }
                      })}
                      placeholder="https://tu-dominio.com/webhook"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => handleUpdatePaymentMethod(method.id, paymentValues[method.id])}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Guardar
                    </Button>
                    <Button
                      onClick={() => setEditingPayment(null)}
                      variant="outline"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Public Key:</span>
                      <span className="ml-2">{method.public_key ? '••••••••••••••••' : 'No configurado'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Secret Key:</span>
                      <span className="ml-2">{method.secret_key ? '••••••••••••••••' : 'No configurado'}</span>
                    </div>
                    {method.type === 'paypal' && (
                      <>
                        <div>
                          <span className="text-gray-600">Client ID:</span>
                          <span className="ml-2">{method.client_id ? '••••••••••••••••' : 'No configurado'}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Client Secret:</span>
                          <span className="ml-2">{method.client_secret ? '••••••••••••••••' : 'No configurado'}</span>
                        </div>
                      </>
                    )}
                    <div className="md:col-span-2">
                      <span className="text-gray-600">Webhook:</span>
                      <span className="ml-2">{method.webhook_url || 'No configurado'}</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => setEditingPayment(method.id)}
                    variant="outline"
                    size="sm"
                    className="mt-3"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Configurar
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentMethods;
