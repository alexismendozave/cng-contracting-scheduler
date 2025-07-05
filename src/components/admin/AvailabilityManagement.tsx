import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Calendar, Clock, User, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Handyman {
  id: string;
  name: string;
}

interface AvailabilitySlot {
  id: string;
  handyman_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
  handymen?: { name: string };
}

export const AvailabilityManagement = () => {
  const [handymen, setHandymen] = useState<Handyman[]>([]);
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedHandyman, setSelectedHandyman] = useState<string>("");
  const [formData, setFormData] = useState({
    date: "",
    start_time: "",
    end_time: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch handymen
      const { data: handymenData, error: handymenError } = await supabase
        .from('handymen')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (handymenError) throw handymenError;

      // Fetch availability slots
      const { data: slotsData, error: slotsError } = await supabase
        .from('availability_slots')
        .select(`
          *,
          handymen(name)
        `)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      if (slotsError) throw slotsError;

      setHandymen(handymenData || []);
      setAvailabilitySlots(slotsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedHandyman || !formData.date || !formData.start_time || !formData.end_time) {
      toast.error('Todos los campos son requeridos');
      return;
    }

    if (formData.start_time >= formData.end_time) {
      toast.error('La hora de inicio debe ser anterior a la hora de fin');
      return;
    }

    try {
      const { error } = await supabase
        .from('availability_slots')
        .insert({
          handyman_id: selectedHandyman,
          date: formData.date,
          start_time: formData.start_time,
          end_time: formData.end_time,
          is_booked: false
        });

      if (error) throw error;

      toast.success('Disponibilidad añadida exitosamente');
      setDialogOpen(false);
      setSelectedHandyman("");
      setFormData({ date: "", start_time: "", end_time: "" });
      fetchData();
    } catch (error) {
      console.error('Error saving availability:', error);
      toast.error('Error al guardar disponibilidad');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta disponibilidad?')) return;

    try {
      const { error } = await supabase
        .from('availability_slots')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Disponibilidad eliminada exitosamente');
      fetchData();
    } catch (error) {
      console.error('Error deleting availability:', error);
      toast.error('Error al eliminar disponibilidad');
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const formatTime = (time: string) => {
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

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (handymen.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">No hay técnicos disponibles</p>
        <p className="text-sm text-muted-foreground mt-1">
          Primero debes crear técnicos antes de gestionar disponibilidad
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Disponibilidad</h1>
          <p className="text-muted-foreground">Configura los horarios disponibles de cada técnico</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Añadir Disponibilidad
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nueva Disponibilidad</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="handyman">Técnico *</Label>
                <Select value={selectedHandyman} onValueChange={setSelectedHandyman}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar técnico" />
                  </SelectTrigger>
                  <SelectContent>
                    {handymen.map((handyman) => (
                      <SelectItem key={handyman.id} value={handyman.id}>
                        {handyman.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="date">Fecha *</Label>
                <Input
                  id="date"
                  type="date"
                  min={today}
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_time">Hora Inicio *</Label>
                  <Select 
                    value={formData.start_time} 
                    onValueChange={(value) => setFormData({ ...formData, start_time: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Inicio" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {formatTime(time)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="end_time">Hora Fin *</Label>
                  <Select 
                    value={formData.end_time} 
                    onValueChange={(value) => setFormData({ ...formData, end_time: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Fin" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {formatTime(time)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setDialogOpen(false);
                    setSelectedHandyman("");
                    setFormData({ date: "", start_time: "", end_time: "" });
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">Guardar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {availabilitySlots.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">No hay disponibilidad configurada</p>
            <p className="text-sm text-muted-foreground mt-1">
              Añade horarios disponibles para que los clientes puedan reservar
            </p>
          </Card>
        ) : (
          availabilitySlots.map((slot) => (
            <Card key={slot.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{slot.handymen?.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(slot.date)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={slot.is_booked ? "destructive" : "default"}
                      className={!slot.is_booked ? "bg-green-100 text-green-800" : ""}
                    >
                      {slot.is_booked ? 'Reservado' : 'Disponible'}
                    </Badge>
                    {!slot.is_booked && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDelete(slot.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};