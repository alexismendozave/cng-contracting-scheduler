import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Clock, User, Mail, Phone, MapPin, DollarSign, Edit, Save, X } from "lucide-react";
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
  notes?: string;
  services?: { name: string };
  handymen?: { name: string, id: string };
  handyman_id?: string;
}

interface Handyman {
  id: string;
  name: string;
}

interface BookingDetailsDialogProps {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBookingUpdated: () => void;
}

const statusOptions = [
  { value: 'pending_confirmation', label: 'Pendiente Confirmación' },
  { value: 'confirmed', label: 'Confirmada' },
  { value: 'in_progress', label: 'En Progreso' },
  { value: 'completed', label: 'Completada' },
  { value: 'cancelled', label: 'Cancelada' }
];

const statusColors = {
  pending_confirmation: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  in_progress: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800"
};

export const BookingDetailsDialog = ({ 
  booking, 
  open, 
  onOpenChange, 
  onBookingUpdated 
}: BookingDetailsDialogProps) => {
  const [editMode, setEditMode] = useState(false);
  const [handymen, setHandymen] = useState<Handyman[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    address: '',
    scheduled_date: '',
    scheduled_time: '',
    booking_status: '',
    total_amount: 0,
    notes: '',
    handyman_id: ''
  });

  useEffect(() => {
    if (booking) {
      setFormData({
        customer_name: booking.customer_name || '',
        customer_email: booking.customer_email || '',
        customer_phone: booking.customer_phone || '',
        address: booking.address || '',
        scheduled_date: booking.scheduled_date || '',
        scheduled_time: booking.scheduled_time || '',
        booking_status: booking.booking_status || '',
        total_amount: booking.total_amount || 0,
        notes: booking.notes || '',
        handyman_id: booking.handyman_id || ''
      });
    }
  }, [booking]);

  useEffect(() => {
    if (open) {
      fetchHandymen();
    }
  }, [open]);

  const fetchHandymen = async () => {
    try {
      const { data, error } = await supabase
        .from('handymen')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setHandymen(data || []);
    } catch (error) {
      console.error('Error fetching handymen:', error);
    }
  };

  const handleSave = async () => {
    if (!booking) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          customer_name: formData.customer_name,
          customer_email: formData.customer_email,
          customer_phone: formData.customer_phone || null,
          address: formData.address || null,
          scheduled_date: formData.scheduled_date || null,
          scheduled_time: formData.scheduled_time || null,
          booking_status: formData.booking_status,
          total_amount: formData.total_amount,
          notes: formData.notes || null,
          handyman_id: formData.handyman_id || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', booking.id);

      if (error) throw error;

      // Add to booking history
      await supabase
        .from('booking_history')
        .insert({
          booking_id: booking.id,
          status_change: `Reserva actualizada`,
          notes: 'Información de reserva modificada desde el panel de administración',
          timestamp: new Date().toISOString()
        });

      toast.success('Reserva actualizada exitosamente');
      setEditMode(false);
      onBookingUpdated();
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error('Error al actualizar la reserva');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return 'No programada';
    return new Date(date).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time?: string) => {
    if (!time) return 'No programada';
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!booking) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Detalles de la Reserva</DialogTitle>
            <div className="flex gap-2">
              {!editMode ? (
                <Button onClick={() => setEditMode(true)} size="sm" variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              ) : (
                <>
                  <Button onClick={handleSave} size="sm" disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar
                  </Button>
                  <Button onClick={() => setEditMode(false)} size="sm" variant="outline">
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5" />
              Información del Cliente
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customer_name">Nombre del Cliente</Label>
                {editMode ? (
                  <Input
                    id="customer_name"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  />
                ) : (
                  <p className="mt-1 text-sm">{booking.customer_name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="customer_email">Email</Label>
                {editMode ? (
                  <Input
                    id="customer_email"
                    type="email"
                    value={formData.customer_email}
                    onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                  />
                ) : (
                  <p className="mt-1 text-sm">{booking.customer_email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="customer_phone">Teléfono</Label>
                {editMode ? (
                  <Input
                    id="customer_phone"
                    value={formData.customer_phone}
                    onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                    placeholder="Opcional"
                  />
                ) : (
                  <p className="mt-1 text-sm">{booking.customer_phone || 'No proporcionado'}</p>
                )}
              </div>

              <div>
                <Label htmlFor="address">Dirección</Label>
                {editMode ? (
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={2}
                    placeholder="Opcional"
                  />
                ) : (
                  <p className="mt-1 text-sm">{booking.address || 'No proporcionada'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Booking Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Información de la Reserva
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="scheduled_date">Fecha Programada</Label>
                {editMode ? (
                  <Input
                    id="scheduled_date"
                    type="date"
                    value={formData.scheduled_date}
                    onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                  />
                ) : (
                  <p className="mt-1 text-sm">{formatDate(booking.scheduled_date)}</p>
                )}
              </div>

              <div>
                <Label htmlFor="scheduled_time">Hora Programada</Label>
                {editMode ? (
                  <Input
                    id="scheduled_time"
                    type="time"
                    value={formData.scheduled_time}
                    onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                  />
                ) : (
                  <p className="mt-1 text-sm">{formatTime(booking.scheduled_time)}</p>
                )}
              </div>

              <div>
                <Label htmlFor="booking_status">Estado</Label>
                {editMode ? (
                  <Select
                    value={formData.booking_status}
                    onValueChange={(value) => setFormData({ ...formData, booking_status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="mt-1">
                    <Badge className={statusColors[booking.booking_status as keyof typeof statusColors]}>
                      {statusOptions.find(s => s.value === booking.booking_status)?.label || booking.booking_status}
                    </Badge>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="handyman_id">Técnico Asignado</Label>
                {editMode ? (
                  <Select
                    value={formData.handyman_id}
                    onValueChange={(value) => setFormData({ ...formData, handyman_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar técnico" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Sin asignar</SelectItem>
                      {handymen.map((handyman) => (
                        <SelectItem key={handyman.id} value={handyman.id}>
                          {handyman.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="mt-1 text-sm">{booking.handymen?.name || 'Sin asignar'}</p>
                )}
              </div>

              <div>
                <Label htmlFor="total_amount">Monto Total</Label>
                {editMode ? (
                  <Input
                    id="total_amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.total_amount}
                    onChange={(e) => setFormData({ ...formData, total_amount: parseFloat(e.target.value) || 0 })}
                  />
                ) : (
                  <p className="mt-1 text-sm font-medium">${booking.total_amount}</p>
                )}
              </div>

              <div>
                <Label>Servicio</Label>
                <p className="mt-1 text-sm">{booking.services?.name || 'No especificado'}</p>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notas</Label>
              {editMode ? (
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  placeholder="Notas adicionales sobre la reserva..."
                />
              ) : (
                <p className="mt-1 text-sm">{booking.notes || 'Sin notas adicionales'}</p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};