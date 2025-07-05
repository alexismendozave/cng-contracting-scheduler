import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PayPalCheckoutProps {
  amount: number;
  currency?: string;
  description: string;
  bookingId?: string;
  paymentType?: 'reservation' | 'full' | 'balance';
  onSuccess?: (paymentId: string) => void;
  onError?: (error: string) => void;
}

export const PayPalCheckout = ({
  amount,
  currency = 'USD',
  description,
  bookingId,
  paymentType = 'full',
  onSuccess,
  onError
}: PayPalCheckoutProps) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!amount || amount <= 0) {
      toast.error('Monto inválido');
      return;
    }

    setLoading(true);
    try {
      // Call Supabase Edge Function to create PayPal order
      const { data, error } = await supabase.functions.invoke('create-paypal-order', {
        body: {
          amount: amount.toFixed(2),
          currency: currency.toUpperCase(),
          description,
          booking_id: bookingId,
          payment_type: paymentType,
          return_url: `${window.location.origin}/booking-success`,
          cancel_url: `${window.location.origin}/booking-cancelled`
        }
      });

      if (error) throw error;

      if (data?.approval_url) {
        // Open PayPal checkout in new tab
        window.open(data.approval_url, '_blank');
      } else {
        throw new Error('No se pudo crear la orden de PayPal');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error procesando el pago';
      toast.error(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="h-5 w-5 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
            P
          </div>
          Pago con PayPal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Descripción:</span>
            <span className="font-medium">{description}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Tipo de pago:</span>
            <span className="font-medium">
              {paymentType === 'reservation' ? 'Reserva' : 
               paymentType === 'balance' ? 'Saldo' : 'Completo'}
            </span>
          </div>
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total:</span>
            <span className="text-primary">${amount.toFixed(2)} {currency}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Lock className="h-4 w-4" />
          <span>Pago seguro procesado por PayPal</span>
        </div>

        <Button
          onClick={handlePayment}
          disabled={loading}
          size="lg"
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Procesando...
            </>
          ) : (
            <>
              Pagar con PayPal ${amount.toFixed(2)}
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Al hacer clic en "Pagar con PayPal", serás redirigido a PayPal para completar el pago.
        </p>
      </CardContent>
    </Card>
  );
};