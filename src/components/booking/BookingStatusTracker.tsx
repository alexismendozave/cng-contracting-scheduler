import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle, 
  Clock, 
  User, 
  Calendar, 
  FileText, 
  CreditCard, 
  CheckCircle2,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BOOKING_STATUS, BOOKING_STATUS_LABELS } from "@/utils/constants";
import { toast } from "sonner";

interface BookingStatusTrackerProps {
  bookingId: string;
}

interface BookingWithHistory {
  id: string;
  booking_status: string;
  payment_status: string;
  customer_name: string;
  service_name: string;
  scheduled_date?: string;
  scheduled_time?: string;
  total_amount?: number;
  final_price?: number;
  reservation_price_paid?: number;
  handyman_name?: string;
  created_at: string;
  updated_at: string;
}

interface BookingHistoryEntry {
  id: string;
  status_change: string;
  notes?: string;
  timestamp: string;
  changed_by_user_id?: string;
}

export const BookingStatusTracker = ({ bookingId }: BookingStatusTrackerProps) => {
  const [booking, setBooking] = useState<BookingWithHistory | null>(null);
  const [history, setHistory] = useState<BookingHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    setLoading(true);
    try {
      // Fetch booking details
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select(`
          *,
          services(name),
          handymen(name)
        `)
        .eq('id', bookingId)
        .single();

      if (bookingError) throw bookingError;

      // Fetch booking history
      const { data: historyData, error: historyError } = await supabase
        .from('booking_history')
        .select('*')
        .eq('booking_id', bookingId)
        .order('timestamp', { ascending: false });

      if (historyError) throw historyError;

      setBooking({
        ...bookingData,
        service_name: bookingData.services?.name,
        handyman_name: bookingData.handymen?.name
      });
      setHistory(historyData || []);
    } catch (error) {
      console.error('Error fetching booking details:', error);
      toast.error('Error al cargar detalles de la reserva');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case BOOKING_STATUS.PENDING_CONFIRMATION:
        return <Clock className="h-4 w-4 text-amber-500" />;
      case BOOKING_STATUS.RESERVATION_PAID:
        return <CreditCard className="h-4 w-4 text-blue-500" />;
      case BOOKING_STATUS.HANDYMAN_ASSIGNED:
        return <User className="h-4 w-4 text-purple-500" />;
      case BOOKING_STATUS.VISIT_SCHEDULED:
        return <Calendar className="h-4 w-4 text-indigo-500" />;
      case BOOKING_STATUS.SERVICE_COMPLETED:
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case BOOKING_STATUS.CANCELLED:
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case BOOKING_STATUS.PENDING_CONFIRMATION:
        return "bg-amber-100 text-amber-800";
      case BOOKING_STATUS.RESERVATION_PAID:
        return "bg-blue-100 text-blue-800";
      case BOOKING_STATUS.HANDYMAN_ASSIGNED:
        return "bg-purple-100 text-purple-800";
      case BOOKING_STATUS.VISIT_SCHEDULED:
        return "bg-indigo-100 text-indigo-800";
      case BOOKING_STATUS.SERVICE_COMPLETED:
        return "bg-green-100 text-green-800";
      case BOOKING_STATUS.CANCELLED:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Estado de la Reserva</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!booking) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Estado de la Reserva</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            No se encontraron detalles de la reserva
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>Estado de la Reserva</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchBookingDetails}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status */}
        <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
          {getStatusIcon(booking.booking_status)}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">Estado Actual:</span>
              <Badge className={getStatusColor(booking.booking_status)}>
                {BOOKING_STATUS_LABELS[booking.booking_status as keyof typeof BOOKING_STATUS_LABELS] || booking.booking_status}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Última actualización: {formatDateTime(booking.updated_at)}
            </div>
          </div>
        </div>

        {/* Booking Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Servicio:</span>
            <div className="font-medium">{booking.service_name}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Cliente:</span>
            <div className="font-medium">{booking.customer_name}</div>
          </div>
          {booking.scheduled_date && (
            <div>
              <span className="text-muted-foreground">Fecha programada:</span>
              <div className="font-medium">
                {new Date(booking.scheduled_date).toLocaleDateString('es-ES')}
                {booking.scheduled_time && ` a las ${booking.scheduled_time}`}
              </div>
            </div>
          )}
          {booking.handyman_name && (
            <div>
              <span className="text-muted-foreground">Técnico asignado:</span>
              <div className="font-medium">{booking.handyman_name}</div>
            </div>
          )}
          {booking.total_amount && (
            <div>
              <span className="text-muted-foreground">Monto total:</span>
              <div className="font-medium">${booking.total_amount}</div>
            </div>
          )}
          {booking.reservation_price_paid && booking.reservation_price_paid > 0 && (
            <div>
              <span className="text-muted-foreground">Reserva pagada:</span>
              <div className="font-medium text-green-600">${booking.reservation_price_paid}</div>
            </div>
          )}
        </div>

        <Separator />

        {/* History Timeline */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Historial de Estados
          </h4>
          <div className="space-y-3">
            {history.map((entry, index) => (
              <div key={entry.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-primary' : 'bg-muted-foreground'}`} />
                  {index < history.length - 1 && (
                    <div className="w-px h-8 bg-border mt-2" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="font-medium text-sm">{entry.status_change}</div>
                  {entry.notes && (
                    <div className="text-sm text-muted-foreground mt-1">{entry.notes}</div>
                  )}
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatDateTime(entry.timestamp)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};