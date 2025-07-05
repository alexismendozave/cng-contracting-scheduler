import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Save, X } from "lucide-react";
import { toast } from "sonner";

interface Service {
  id: string;
  name: string;
  base_price: number;
}

interface Handyman {
  id: string;
  name: string;
}

interface NewBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBookingCreated: () => void;
}

export const NewBookingDialog = ({ 
  open, 
  onOpenChange, 
  onBookingCreated 
}: NewBookingDialogProps) => {
  const [services, setServices] = useState<Service[]>([]);
  const [handymen, setHandymen] = useState<Handyman[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    service_id: '',
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    address: '',
    scheduled_date: '',
    scheduled_time: '',
    total_amount: 0,
    notes: '',
    handyman_id: ''
  });

  useEffect(() => {
    if (open) {
      fetchServicesAndHandymen();
      resetForm();
    }
  }, [open]);

  const fetchServicesAndHandymen = async () => {
    try {
      const [servicesResult, handymenResult] = await Promise.all([
        supabase
          .from('services')
          .select('id, name, base_price')
          .eq('is_active', true)
          .order('name'),
        supabase
          .from('handymen')
          .select('id, name')
          .eq('is_active', true)
          .order('name')
      ]);

      if (servicesResult.error) throw servicesResult.error;
      if (handymenResult.error) throw handymenResult.error;

      setServices(servicesResult.data || []);
      setHandymen(handymenResult.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error al cargar datos');
    }
  };

  const resetForm = () => {
    setFormData({
      service_id: '',
      customer_name: '',
      customer_email: '',
      customer_phone: '',
      address: '',
      scheduled_date: '',
      scheduled_time: '',
      total_amount: 0,
      notes: '',
      handyman_id: ''
    });
  };

  const handleServiceChange = (serviceId: string) => {
    const selectedService = services.find(s => s.id === serviceId);
    setFormData({
      ...formData,
      service_id: serviceId,
      total_amount: selectedService?.base_price || 0
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.service_id || !formData.customer_name || !formData.customer_email) {
      toast.error('Servicio, nombre del cliente y email son requeridos');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          service_id: formData.service_id,
          customer_name: formData.customer_name,
          customer_email: formData.customer_email,
          customer_phone: formData.customer_phone || null,
          address: formData.address || null,
          scheduled_date: formData.scheduled_date || null,
          scheduled_time: formData.scheduled_time || null,
          total_amount: formData.total_amount,
          notes: formData.notes || null,
          handyman_id: formData.handyman_id || null,
          booking_status: 'confirmed',
          payment_status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Add to booking history
      await supabase
        .from('booking_history')
        .insert({
          booking_id: data.id,
          status_change: 'Reserva creada manualmente desde el panel de administración',
          timestamp: new Date().toISOString()
        });

      toast.success('Reserva creada exitosamente');
      onOpenChange(false);
      onBookingCreated();
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Error al crear la reserva');
    } finally {
      setLoading(false);
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Nueva Reserva
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Información del Servicio</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="service_id">Servicio *</Label>
                <Select
                  value={formData.service_id}
                  onValueChange={handleServiceChange}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar servicio" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name} - ${service.base_price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="total_amount">Monto Total *</Label>
                <Input
                  id="total_amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.total_amount}
                  onChange={(e) => setFormData({ ...formData, total_amount: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Información del Cliente</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customer_name">Nombre del Cliente *</Label>
                <Input
                  id="customer_name"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="customer_email">Email *</Label>
                <Input
                  id="customer_email"
                  type="email"
                  value={formData.customer_email}
                  onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="customer_phone">Teléfono</Label>
                <Input
                  id="customer_phone"
                  value={formData.customer_phone}
                  onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                  placeholder="Opcional"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Dirección</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={2}
                placeholder="Dirección del servicio (opcional)"
              />
            </div>
          </div>

          {/* Scheduling Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Programación</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="scheduled_date">Fecha Programada</Label>
                <Input
                  id="scheduled_date"
                  type="date"
                  min={today}
                  value={formData.scheduled_date}
                  onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="scheduled_time">Hora Programada</Label>
                <Input
                  id="scheduled_time"
                  type="time"
                  value={formData.scheduled_time}
                  onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="handyman_id">Técnico Asignado</Label>
                <Select
                  value={formData.handyman_id}
                  onValueChange={(value) => setFormData({ ...formData, handyman_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar técnico (opcional)" />
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
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Notas adicionales sobre la reserva..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Creando...' : 'Crear Reserva'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};