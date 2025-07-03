
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Service {
  id: string;
  name: string;
  description: string;
  base_price: number;
  category: string;
  duration_minutes: number;
  deposit_type: string;
  deposit_amount: number;
}

interface Zone {
  id: string;
  name: string;
  multiplier: number;
  fixed_price: number;
  pricing_type: string;
}

const Booking = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    address: '',
    notes: '',
    zone_id: '',
    scheduled_date: null as Date | null,
    scheduled_time: '',
    requires_call: false
  });

  useEffect(() => {
    if (serviceId) {
      fetchServiceAndZones();
    }
  }, [serviceId]);

  const fetchServiceAndZones = async () => {
    setLoading(true);
    try {
      // Fetch service
      const { data: serviceData, error: serviceError } = await supabase
        .from('services')
        .select('*')
        .eq('id', serviceId)
        .eq('is_active', true)
        .single();

      if (serviceError) {
        console.error('Service error:', serviceError);
        toast.error('Servicio no encontrado');
        navigate('/');
        return;
      }

      setService(serviceData);

      // Fetch zones
      const { data: zonesData, error: zonesError } = await supabase
        .from('zones')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (zonesError) {
        console.error('Zones error:', zonesError);
      } else {
        setZones(zonesData || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error al cargar los datos');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const calculateFinalPrice = () => {
    if (!service || !formData.zone_id) return service?.base_price || 0;

    const selectedZone = zones.find(z => z.id === formData.zone_id);
    if (!selectedZone) return service.base_price;

    if (selectedZone.pricing_type === 'fixed') {
      return service.base_price + (selectedZone.fixed_price || 0);
    } else {
      return service.base_price * (selectedZone.multiplier || 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const bookingData = {
        service_id: serviceId,
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        address: formData.address,
        notes: formData.notes,
        zone_id: formData.zone_id,
        scheduled_date: formData.scheduled_date?.toISOString().split('T')[0],
        scheduled_time: formData.scheduled_time,
        requires_call: formData.requires_call,
        total_amount: calculateFinalPrice(),
        status: 'pending'
      };

      const { error } = await supabase
        .from('bookings')
        .insert([bookingData]);

      if (error) throw error;

      toast.success('Reserva creada exitosamente');
      navigate('/thanks');
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Error al crear la reserva');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando servicio...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Servicio no encontrado</h1>
          <p className="text-gray-600 mb-4">El servicio que buscas no existe o no está disponible.</p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Reservar: {service.name}</CardTitle>
            <CardDescription>
              {service.description}
            </CardDescription>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-2xl font-bold text-green-600">${service.base_price}</span>
              {service.duration_minutes && (
                <span className="text-gray-500">{service.duration_minutes} minutos</span>
              )}
              {service.category && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">{service.category}</span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer_name">Nombre completo *</Label>
                  <Input
                    id="customer_name"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="customer_email">Email *</Label>
                  <Input
                    id="customer_email"
                    type="email"
                    value={formData.customer_email}
                    onChange={(e) => setFormData({...formData, customer_email: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer_phone">Teléfono</Label>
                  <Input
                    id="customer_phone"
                    type="tel"
                    value={formData.customer_phone}
                    onChange={(e) => setFormData({...formData, customer_phone: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="zone">Zona de servicio *</Label>
                  <Select value={formData.zone_id} onValueChange={(value) => setFormData({...formData, zone_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una zona" />
                    </SelectTrigger>
                    <SelectContent>
                      {zones.map(zone => (
                        <SelectItem key={zone.id} value={zone.id}>
                          {zone.name} - {zone.pricing_type === 'fixed' 
                            ? `+$${zone.fixed_price}` 
                            : `${zone.multiplier}x`
                          }
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="address">Dirección completa *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Calle, número, colonia, ciudad..."
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Fecha preferida</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.scheduled_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.scheduled_date ? (
                          format(formData.scheduled_date, "PPP", { locale: es })
                        ) : (
                          <span>Seleccionar fecha</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.scheduled_date || undefined}
                        onSelect={(date) => setFormData({...formData, scheduled_date: date || null})}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label htmlFor="scheduled_time">Hora preferida</Label>
                  <Input
                    id="scheduled_time"
                    type="time"
                    value={formData.scheduled_time}
                    onChange={(e) => setFormData({...formData, scheduled_time: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notas adicionales</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Detalles específicos, instrucciones especiales..."
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="requires_call"
                  checked={formData.requires_call}
                  onCheckedChange={(checked) => setFormData({...formData, requires_call: !!checked})}
                />
                <Label htmlFor="requires_call" className="text-sm">
                  Prefiero que me llamen para confirmar los detalles
                </Label>
              </div>

              {formData.zone_id && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium mb-2">Resumen del precio:</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Precio base:</span>
                      <span>${service.base_price}</span>
                    </div>
                    {zones.find(z => z.id === formData.zone_id) && (
                      <div className="flex justify-between">
                        <span>Zona {zones.find(z => z.id === formData.zone_id)?.name}:</span>
                        <span>
                          {zones.find(z => z.id === formData.zone_id)?.pricing_type === 'fixed' 
                            ? `+$${zones.find(z => z.id === formData.zone_id)?.fixed_price}`
                            : `x${zones.find(z => z.id === formData.zone_id)?.multiplier}`
                          }
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span className="text-green-600">${calculateFinalPrice()}</span>
                    </div>
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={submitting}
              >
                {submitting ? 'Procesando...' : 'Confirmar Reserva'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Booking;
