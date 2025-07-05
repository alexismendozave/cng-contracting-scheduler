import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BookingData {
  service_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  zone_id?: string;
  scheduled_date?: string;
  scheduled_time?: string;
  total_amount: number;
  final_price?: number;
  reservation_price_paid?: number;
  payment_method?: string;
  payment_status?: string;
  booking_status?: string;
  notes?: string;
}

export const useBookingManagement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBooking = useCallback(async (bookingData: BookingData) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          ...bookingData,
          booking_status: bookingData.booking_status || 'pending_confirmation',
          payment_status: bookingData.payment_status || 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Create initial booking history entry
      await supabase
        .from('booking_history')
        .insert({
          booking_id: data.id,
          status_change: 'Reserva creada',
          timestamp: new Date().toISOString()
        });

      toast.success('Reserva creada exitosamente');
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creating booking';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBookingStatus = useCallback(async (
    bookingId: string, 
    newStatus: string, 
    notes?: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('bookings')
        .update({
          booking_status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (updateError) throw updateError;

      // Add to booking history
      await supabase
        .from('booking_history')
        .insert({
          booking_id: bookingId,
          status_change: `Estado cambiado a: ${newStatus}`,
          notes,
          timestamp: new Date().toISOString()
        });

      toast.success('Estado actualizado correctamente');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error updating booking status';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const getBookingHistory = useCallback(async (bookingId: string) => {
    try {
      const { data, error } = await supabase
        .from('booking_history')
        .select('*')
        .eq('booking_id', bookingId)
        .order('timestamp', { ascending: false });

      if (error) throw error;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching booking history');
      return [];
    }
  }, []);

  const getUserBookings = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          services(name, description, base_price),
          zones(name)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching user bookings');
      return [];
    }
  }, []);

  return {
    createBooking,
    updateBookingStatus,
    getBookingHistory,
    getUserBookings,
    loading,
    error
  };
};