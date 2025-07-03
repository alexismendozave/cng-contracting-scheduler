
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CreditCard, Banknote, Smartphone } from "lucide-react";

interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  is_active: boolean;
}

interface PaymentSelectionProps {
  totalAmount: number;
  onPaymentSelect: (paymentMethodId: string) => void;
}

const PaymentSelection = ({ totalAmount, onPaymentSelect }: PaymentSelectionProps) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setPaymentMethods(data || []);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPaymentIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'credit_card':
      case 'card':
        return <CreditCard className="h-6 w-6" />;
      case 'cash':
      case 'efectivo':
        return <Banknote className="h-6 w-6" />;
      case 'digital_wallet':
      case 'wallet':
        return <Smartphone className="h-6 w-6" />;
      default:
        return <CreditCard className="h-6 w-6" />;
    }
  };

  const getPaymentInstructions = (method: PaymentMethod) => {
    switch (method.type.toLowerCase()) {
      case 'cash':
      case 'efectivo':
        return 'El pago se realizará en efectivo al momento de la prestación del servicio.';
      case 'transfer':
      case 'transferencia':
        return 'Se te proporcionarán los detalles bancarios para realizar la transferencia.';
      case 'credit_card':
        return 'Pago seguro con tarjeta de crédito o débito.';
      default:
        return 'Método de pago seguro y confiable.';
    }
  };

  const handleContinue = () => {
    if (!selectedMethod) {
      return;
    }
    onPaymentSelect(selectedMethod);
  };

  if (loading) {
    return <div className="text-center py-8">Cargando métodos de pago...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Resumen del Pago</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Total a pagar:</span>
            <span className="text-green-600">${totalAmount}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Seleccionar Método de Pago</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod}>
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <Card key={method.id} className="p-4">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value={method.id} id={method.id} />
                    <div className="flex items-center gap-3 flex-1">
                      {getPaymentIcon(method.type)}
                      <div className="flex-1">
                        <Label htmlFor={method.id} className="text-base font-medium cursor-pointer">
                          {method.name}
                        </Label>
                        <p className="text-sm text-gray-600 mt-1">
                          {getPaymentInstructions(method)}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </RadioGroup>

          {paymentMethods.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No hay métodos de pago configurados
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={handleContinue} 
          disabled={!selectedMethod}
        >
          Continuar al resumen
        </Button>
      </div>
    </div>
  );
};

export default PaymentSelection;
