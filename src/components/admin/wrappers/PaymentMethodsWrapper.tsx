import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import PaymentMethods from "@/components/admin/PaymentMethods";
import { PaymentMethod } from "@/components/admin/types";

export default function PaymentMethodsWrapper() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: paymentData } = await supabase
        .from('payment_methods')
        .select('*')
        .order('name');

      setPaymentMethods(paymentData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <PaymentMethods 
      paymentMethods={paymentMethods}
      onDataRefresh={fetchData}
    />
  );
}