import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface StripeCheckoutProps {
  amount: number;
  currency?: string;
  description: string;
  bookingId?: string;
  paymentType?: 'reservation' | 'full' | 'balance';
  onSuccess?: (paymentId: string) => void;
  onError?: (error: string) => void;
}

export const StripeCheckout = ({
  amount,
  currency = 'USD',
  description,
  bookingId,
  paymentType = 'full',
  onSuccess,
  onError
}: StripeCheckoutProps) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!amount || amount <= 0) {
      toast.error('Monto inválido');
      return;
    }

    setLoading(true);
    try {
      // Call Supabase Edge Function to create Stripe checkout session
      const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
        body: {
          amount: Math.round(amount * 100), // Convert to cents
          currency: currency.toLowerCase(),
          description,
          booking_id: bookingId,
          payment_type: paymentType,
          success_url: `${window.location.origin}/booking-success`,
          cancel_url: `${window.location.origin}/booking-cancelled`
        }
      });

      if (error) throw error;

      if (data?.url) {
        // Open Stripe checkout in new tab
        window.open(data.url, '_blank');
      } else {
        throw new Error('No se pudo crear la sesión de pago');
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
          <CreditCard className="h-5 w-5" />
          Pago con Tarjeta
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
          <span>Pago seguro procesado por Stripe</span>
        </div>

        <Button
          onClick={handlePayment}
          disabled={loading}
          size="lg"
          className="w-full"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Procesando...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Pagar ${amount.toFixed(2)}
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Al hacer clic en "Pagar", serás redirigido a Stripe para completar el pago de forma segura.
        </p>
      </CardContent>
    </Card>
  );
};