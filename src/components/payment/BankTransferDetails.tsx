import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Building2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BankTransferDetailsProps {
  amount: number;
  currency?: string;
  description: string;
  bookingId?: string;
  paymentType?: 'reservation' | 'full' | 'balance';
  onConfirmTransfer?: () => void;
}

interface BankDetails {
  bank_name: string;
  account_holder: string;
  account_number: string;
  routing_number?: string;
  swift_code?: string;
  reference_format: string;
}

export const BankTransferDetails = ({
  amount,
  currency = 'USD',
  description,
  bookingId,
  paymentType = 'full',
  onConfirmTransfer
}: BankTransferDetailsProps) => {
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [copiedField, setCopiedField] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBankDetails();
  }, []);

  const fetchBankDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('config_data')
        .eq('type', 'bank_transfer')
        .eq('is_active', true)
        .single();

      if (error) throw error;

      if (data?.config_data) {
        setBankDetails(data.config_data as unknown as BankDetails);
      }
    } catch (error) {
      console.error('Error fetching bank details:', error);
      toast.error('Error al cargar detalles bancarios');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success('Copiado al portapapeles');
      setTimeout(() => setCopiedField(""), 2000);
    } catch (error) {
      toast.error('Error al copiar');
    }
  };

  const generateReference = () => {
    if (!bankDetails?.reference_format || !bookingId) return bookingId || 'N/A';
    
    return bankDetails.reference_format
      .replace('{booking_id}', bookingId.substring(0, 8))
      .replace('{amount}', amount.toString())
      .replace('{type}', paymentType.toUpperCase());
  };

  const handleConfirmTransfer = async () => {
    try {
      // Create payment record
      const { error } = await supabase
        .from('payments')
        .insert({
          booking_id: bookingId,
          amount,
          currency,
          status: 'pending',
          gateway: 'bank_transfer',
          payment_type: paymentType
        });

      if (error) throw error;

      toast.success('Transferencia registrada. Procesaremos tu pago una vez confirmemos la transferencia.');
      onConfirmTransfer?.();
    } catch (error) {
      console.error('Error confirming transfer:', error);
      toast.error('Error al confirmar transferencia');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Transferencia Bancaria
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!bankDetails) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Transferencia Bancaria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-amber-600">
            <AlertCircle className="h-4 w-4" />
            <span>Detalles bancarios no disponibles</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const CopyableField = ({ label, value, fieldKey }: { label: string; value: string; fieldKey: string }) => (
    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
      <div>
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="font-mono font-medium">{value}</div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => copyToClipboard(value, fieldKey)}
        className="ml-2"
      >
        {copiedField === fieldKey ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Transferencia Bancaria
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-blue-900">Instrucciones Importantes</span>
          </div>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Realiza la transferencia por el monto exacto</li>
            <li>• Usa la referencia proporcionada</li>
            <li>• El pago será verificado manualmente</li>
            <li>• Tiempo de procesamiento: 1-2 días hábiles</li>
          </ul>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Monto a transferir:</span>
            <Badge variant="default" className="text-lg px-3 py-1">
              ${amount.toFixed(2)} {currency}
            </Badge>
          </div>

          <CopyableField
            label="Banco"
            value={bankDetails.bank_name}
            fieldKey="bank_name"
          />

          <CopyableField
            label="Titular de la cuenta"
            value={bankDetails.account_holder}
            fieldKey="account_holder"
          />

          <CopyableField
            label="Número de cuenta"
            value={bankDetails.account_number}
            fieldKey="account_number"
          />

          {bankDetails.routing_number && (
            <CopyableField
              label="Número de ruta"
              value={bankDetails.routing_number}
              fieldKey="routing_number"
            />
          )}

          {bankDetails.swift_code && (
            <CopyableField
              label="Código SWIFT"
              value={bankDetails.swift_code}
              fieldKey="swift_code"
            />
          )}

          <CopyableField
            label="Referencia (OBLIGATORIA)"
            value={generateReference()}
            fieldKey="reference"
          />
        </div>

        <div className="pt-4 border-t">
          <Button
            onClick={handleConfirmTransfer}
            size="lg"
            className="w-full"
            variant="outline"
          >
            Confirmar que realizaré la transferencia
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Una vez realizada la transferencia, tu reserva será confirmada después de la verificación.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};