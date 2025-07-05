import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, List, Plus, Eye, Edit, Clock, DollarSign, User, Mail, MapPin } from "lucide-react";
import { toast } from "sonner";
import { InteractiveBookingCalendar } from "./InteractiveBookingCalendar";
import { BookingDetailsDialog } from "./BookingDetailsDialog";
import { NewBookingDialog } from "./NewBookingDialog";

interface Booking {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  address: string;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
  booking_status: string;
  total_amount: number;
  service_id: string;
  zone_id: string;
  created_at: string;
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800", 
  paid: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  completed: "bg-purple-100 text-purple-800"
};

const statusLabels = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  paid: "Pagada", 
  cancelled: "Cancelada",
  completed: "Completada"
};

export default function BookingsManagement() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("list");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('bookings')
        .select(`
          *,
          services(name, description),
          zones(name),
          handymen(name)
        `)
        .order('created_at', { ascending: false });
      
      // Map the data to ensure booking_status is set correctly
      const mappedData = data?.map(booking => ({
        ...booking,
        booking_status: booking.booking_status || booking.status || 'pending_confirmation'
      })) || [];
      
      setBookings(mappedData as Booking[]);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Error al cargar reservas');
    } finally {
      setLoading(false);
    }
  };

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [newBookingDialogOpen, setNewBookingDialogOpen] = useState(false);

  const handleViewBooking = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      setSelectedBooking(booking);
      setDetailsDialogOpen(true);
    }
  };

  const handleEditBooking = (bookingId: string) => {
    handleViewBooking(bookingId);
  };

  const BookingCard = ({ booking }: { booking: Booking }) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-4 w-4" />
              {booking.customer_name}
            </CardTitle>
            <p className="text-sm text-muted-foreground">Pedido #{booking.id.slice(0, 8)}</p>
          </div>
          <Badge className={statusColors[booking.status as keyof typeof statusColors]}>
            {statusLabels[booking.status as keyof typeof statusLabels]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{booking.customer_email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{booking.scheduled_date} {booking.scheduled_time}</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span>${booking.total_amount}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">{booking.address}</span>
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <Button size="sm" variant="outline" onClick={() => handleViewBooking(booking.id)}>
            <Eye className="h-4 w-4 mr-1" />
            Ver
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleEditBooking(booking.id)}>
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const CalendarView = () => {
    return <InteractiveBookingCalendar />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Reservas</h1>
          <p className="text-muted-foreground">Administra y visualiza todas las reservas</p>
        </div>
        <Button onClick={() => setNewBookingDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Reserva
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Listado
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Calendario
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Todas las Reservas ({bookings.length})</h3>
          </div>
          
          <div className="grid gap-4">
            {bookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
            
            {bookings.length === 0 && (
              <Card className="p-6 text-center">
                <p className="text-muted-foreground">No hay reservas disponibles</p>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="calendar">
          <CalendarView />
        </TabsContent>
      </Tabs>

      <BookingDetailsDialog 
        booking={selectedBooking}
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        onBookingUpdated={fetchBookings}
      />

      <NewBookingDialog
        open={newBookingDialogOpen}
        onOpenChange={setNewBookingDialogOpen}
        onBookingCreated={fetchBookings}
      />
    </div>
  );
}