import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Banknote, CheckCircle, AlertTriangle, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CashOnSiteInfoProps {
  amount: number;
  currency?: string;
  description: string;
  bookingId?: string;
  paymentType?: 'reservation' | 'full' | 'balance';
  onConfirmCashPayment?: () => void;
}

export const CashOnSiteInfo = ({
  amount,
  currency = 'USD',
  description,
  bookingId,
  paymentType = 'full',
  onConfirmCashPayment
}: CashOnSiteInfoProps) => {

  const handleConfirmCashPayment = async () => {
    try {
      // Create payment record with cash payment
      const { error } = await supabase
        .from('payments')
        .insert({
          booking_id: bookingId,
          amount,
          currency,
          status: 'pending',
          gateway: 'cash',
          payment_type: paymentType
        });

      if (error) throw error;

      toast.success('Pago en efectivo confirmado. El técnico cobrará al completar el servicio.');
      onConfirmCashPayment?.();
    } catch (error) {
      console.error('Error confirming cash payment:', error);
      toast.error('Error al confirmar pago en efectivo');
    }
  };

  const isReservation = paymentType === 'reservation';
  const isBalance = paymentType === 'balance';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Banknote className="h-5 w-5" />
          Pago en Efectivo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <Badge variant="outline" className="text-lg px-4 py-2 mb-4">
            ${amount.toFixed(2)} {currency}
          </Badge>
          <p className="text-sm text-muted-foreground">
            {isReservation ? 'Pago de reserva' : isBalance ? 'Pago de saldo' : 'Pago completo'} en efectivo
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-green-900">Ventajas del pago en efectivo</div>
              <ul className="text-sm text-green-800 mt-1 space-y-1">
                <li>• Sin comisiones adicionales</li>
                <li>• Pago directo al técnico</li>
                <li>• Mayor flexibilidad</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-amber-900">Importante</div>
              <ul className="text-sm text-amber-800 mt-1 space-y-1">
                <li>• Tenga el monto exacto disponible</li>
                <li>• El pago se realiza {isReservation ? 'como reserva' : 'al completar el servicio'}</li>
                <li>• Solicite su comprobante de pago</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-blue-900">Proceso de pago</div>
              <div className="text-sm text-blue-800 mt-1">
                {isReservation ? (
                  "El técnico cobrará la reserva al llegar al sitio antes de comenzar el trabajo."
                ) : isBalance ? (
                  "El técnico cobrará el saldo restante al completar el servicio."
                ) : (
                  "El técnico cobrará el monto completo al finalizar el servicio a su satisfacción."
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button
            onClick={handleConfirmCashPayment}
            size="lg"
            className="w-full"
            variant="default"
          >
            <Banknote className="h-4 w-4 mr-2" />
            Confirmar Pago en Efectivo
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Su reserva será confirmada y el técnico cobrará en efectivo según lo acordado.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};