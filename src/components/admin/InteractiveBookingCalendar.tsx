import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, ChevronLeft, ChevronRight, Clock, User, MapPin, Phone, Mail } from "lucide-react";
import { toast } from "sonner";

interface Booking {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  address?: string;
  scheduled_date?: string;
  scheduled_time?: string;
  booking_status: string;
  total_amount: number;
  services?: { name: string };
  handymen?: { name: string };
}

interface CalendarDay {
  date: Date;
  bookings: Booking[];
  isCurrentMonth: boolean;
}

const statusColors = {
  pending_confirmation: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  in_progress: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800"
};

const statusLabels = {
  pending_confirmation: "Pendiente",
  confirmed: "Confirmada",
  in_progress: "En Progreso",
  completed: "Completada",
  cancelled: "Cancelada"
};

export const InteractiveBookingCalendar = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, [currentMonth]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          services(name),
          handymen(name)
        `)
        .gte('scheduled_date', startOfMonth.toISOString().split('T')[0])
        .lte('scheduled_date', endOfMonth.toISOString().split('T')[0])
        .order('scheduled_date')
        .order('scheduled_time');

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Error al cargar reservas');
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (): CalendarDay[] => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: CalendarDay[] = [];
    const currentDate = new Date(startDate);

    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      const dateString = currentDate.toISOString().split('T')[0];
      const dayBookings = bookings.filter(booking => 
        booking.scheduled_date === dateString
      );

      days.push({
        date: new Date(currentDate),
        bookings: dayBookings,
        isCurrentMonth: currentDate.getMonth() === month
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setDialogOpen(true);
  };

  const formatTime = (time?: string) => {
    if (!time) return '';
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const days = getDaysInMonth();
  const monthYear = currentMonth.toLocaleDateString('es-ES', { 
    month: 'long', 
    year: 'numeric' 
  });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Calendario de Reservas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Calendario de Reservas
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="text-lg font-semibold capitalize min-w-[200px] text-center">
                {monthYear}
              </h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigateMonth('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => (
              <div
                key={index}
                className={`min-h-[100px] p-2 border rounded-lg ${
                  day.isCurrentMonth 
                    ? 'bg-background border-border' 
                    : 'bg-muted/50 border-muted'
                } ${day.date.toDateString() === new Date().toDateString() 
                    ? 'ring-2 ring-primary/20 bg-primary/5' 
                    : ''
                }`}
              >
                <div className={`text-sm font-medium mb-1 ${
                  day.isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {day.date.getDate()}
                </div>
                
                <div className="space-y-1">
                  {day.bookings.slice(0, 3).map((booking, bookingIndex) => (
                    <div
                      key={bookingIndex}
                      className="text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity"
                      style={{
                        backgroundColor: statusColors[booking.booking_status as keyof typeof statusColors]?.replace('text-', 'bg-').split(' ')[0] || '#f3f4f6'
                      }}
                      onClick={() => handleBookingClick(booking)}
                    >
                      <div className="font-medium truncate">
                        {booking.customer_name}
                      </div>
                      {booking.scheduled_time && (
                        <div className="opacity-75">
                          {formatTime(booking.scheduled_time)}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {day.bookings.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center">
                      +{day.bookings.length - 3} más
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
            <span className="text-sm font-medium">Estados:</span>
            {Object.entries(statusLabels).map(([status, label]) => (
              <Badge 
                key={status} 
                className={statusColors[status as keyof typeof statusColors]}
                variant="secondary"
              >
                {label}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Booking Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalles de la Reserva</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{selectedBooking.customer_name}</h3>
                  <Badge className={statusColors[selectedBooking.booking_status as keyof typeof statusColors]}>
                    {statusLabels[selectedBooking.booking_status as keyof typeof statusLabels]}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                {selectedBooking.services?.name && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Servicio:</span>
                    <span>{selectedBooking.services.name}</span>
                  </div>
                )}

                {selectedBooking.scheduled_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span>{formatDate(selectedBooking.scheduled_date)}</span>
                  </div>
                )}

                {selectedBooking.scheduled_time && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span>{formatTime(selectedBooking.scheduled_time)}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span>{selectedBooking.customer_email}</span>
                </div>

                {selectedBooking.customer_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span>{selectedBooking.customer_phone}</span>
                  </div>
                )}

                {selectedBooking.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <span>{selectedBooking.address}</span>
                  </div>
                )}

                {selectedBooking.handymen?.name && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span>Técnico: {selectedBooking.handymen.name}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2 border-t">
                  <span className="font-medium">Total:</span>
                  <span className="text-lg font-bold text-primary">
                    ${selectedBooking.total_amount}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" size="sm" className="flex-1">
                  Editar
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Cambiar Estado
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};