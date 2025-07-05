import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Clock, Save, Plus, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface WeeklyAvailability {
  id: string;
  day_of_week: number;
  time_slot_1_start: string | null;
  time_slot_1_end: string | null;
  time_slot_2_start: string | null;
  time_slot_2_end: string | null;
  time_slot_3_start: string | null;
  time_slot_3_end: string | null;
  is_active: boolean;
}

interface NonWorkingDay {
  id: string;
  date: string;
  reason: string | null;
  is_active: boolean;
}

interface BookingSetting {
  id: string;
  setting_key: string;
  setting_value: any;
}

const dayNames = [
  'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
];

export const WeeklyAvailabilityManagement = () => {
  const [weeklyAvailability, setWeeklyAvailability] = useState<WeeklyAvailability[]>([]);
  const [nonWorkingDays, setNonWorkingDays] = useState<NonWorkingDay[]>([]);
  const [bookingSettings, setBookingSettings] = useState<BookingSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNonWorkingDay, setNewNonWorkingDay] = useState({ date: '', reason: '' });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch weekly availability
      const { data: weeklyData, error: weeklyError } = await supabase
        .from('weekly_availability')
        .select('*')
        .order('day_of_week');

      if (weeklyError) throw weeklyError;

      // Fetch non-working days
      const { data: nonWorkingData, error: nonWorkingError } = await supabase
        .from('non_working_days')
        .select('*')
        .eq('is_active', true)
        .order('date');

      if (nonWorkingError) throw nonWorkingError;

      // Fetch booking settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('booking_settings')
        .select('*')
        .in('setting_key', ['max_bookings_per_time_slot', 'max_bookings_per_day']);

      if (settingsError) throw settingsError;

      setWeeklyAvailability(weeklyData || []);
      setNonWorkingDays(nonWorkingData || []);
      setBookingSettings(settingsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error al cargar configuración');
    } finally {
      setLoading(false);
    }
  };

  const updateWeeklyAvailability = async (dayData: WeeklyAvailability) => {
    try {
      const { error } = await supabase
        .from('weekly_availability')
        .update({
          time_slot_1_start: dayData.time_slot_1_start || null,
          time_slot_1_end: dayData.time_slot_1_end || null,
          time_slot_2_start: dayData.time_slot_2_start || null,
          time_slot_2_end: dayData.time_slot_2_end || null,
          time_slot_3_start: dayData.time_slot_3_start || null,
          time_slot_3_end: dayData.time_slot_3_end || null,
          is_active: dayData.is_active
        })
        .eq('id', dayData.id);

      if (error) throw error;
      toast.success('Disponibilidad actualizada');
      fetchAllData();
    } catch (error) {
      console.error('Error updating availability:', error);
      toast.error('Error al actualizar disponibilidad');
    }
  };

  const addNonWorkingDay = async () => {
    if (!newNonWorkingDay.date) {
      toast.error('La fecha es requerida');
      return;
    }

    try {
      const { error } = await supabase
        .from('non_working_days')
        .insert({
          date: newNonWorkingDay.date,
          reason: newNonWorkingDay.reason || null
        });

      if (error) throw error;
      toast.success('Día no laborable añadido');
      setNewNonWorkingDay({ date: '', reason: '' });
      fetchAllData();
    } catch (error) {
      console.error('Error adding non-working day:', error);
      toast.error('Error al añadir día no laborable');
    }
  };

  const removeNonWorkingDay = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este día no laborable?')) return;

    try {
      const { error } = await supabase
        .from('non_working_days')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      toast.success('Día no laborable eliminado');
      fetchAllData();
    } catch (error) {
      console.error('Error removing non-working day:', error);
      toast.error('Error al eliminar día no laborable');
    }
  };

  const updateBookingSetting = async (settingKey: string, value: number) => {
    try {
      const { error } = await supabase
        .from('booking_settings')
        .update({ setting_value: { value } })
        .eq('setting_key', settingKey);

      if (error) throw error;
      toast.success('Configuración actualizada');
      fetchAllData();
    } catch (error) {
      console.error('Error updating setting:', error);
      toast.error('Error al actualizar configuración');
    }
  };

  const formatTime = (time: string | null) => {
    if (!time) return '';
    return time.slice(0, 5); // HH:MM format
  };

  const handleTimeSlotChange = (dayId: string, field: keyof WeeklyAvailability, value: string) => {
    const updatedAvailability = weeklyAvailability.map(day => {
      if (day.id === dayId) {
        return { ...day, [field]: value || null };
      }
      return day;
    });
    setWeeklyAvailability(updatedAvailability);
  };

  const getSettingValue = (key: string) => {
    const setting = bookingSettings.find(s => s.setting_key === key);
    return setting?.setting_value?.value || 0;
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
          <h1 className="text-3xl font-bold">Configuración de Disponibilidad</h1>
          <p className="text-muted-foreground">Gestiona horarios semanales y días no laborables</p>
        </div>
      </div>

      <Tabs defaultValue="weekly" className="space-y-4">
        <TabsList>
          <TabsTrigger value="weekly" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Horarios Semanales
          </TabsTrigger>
          <TabsTrigger value="non-working" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Días No Laborables
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Configuración
          </TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Disponibilidad por Día de la Semana</CardTitle>
              <p className="text-sm text-muted-foreground">
                Configura hasta 3 bloques horarios por día. Deja vacío o escribe "N/A" para horarios no disponibles.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {weeklyAvailability.map((day) => (
                <div key={day.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">{dayNames[day.day_of_week]}</h3>
                    <Switch
                      checked={day.is_active}
                      onCheckedChange={(checked) => 
                        handleTimeSlotChange(day.id, 'is_active', checked.toString())
                      }
                    />
                  </div>
                  
                  {day.is_active && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Turno 1 */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Turno 1</Label>
                        <div className="flex gap-2">
                          <Input
                            type="time"
                            value={formatTime(day.time_slot_1_start)}
                            onChange={(e) => handleTimeSlotChange(day.id, 'time_slot_1_start', e.target.value)}
                            className="flex-1"
                          />
                          <Input
                            type="time"
                            value={formatTime(day.time_slot_1_end)}
                            onChange={(e) => handleTimeSlotChange(day.id, 'time_slot_1_end', e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>

                      {/* Turno 2 */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Turno 2</Label>
                        <div className="flex gap-2">
                          <Input
                            type="time"
                            value={formatTime(day.time_slot_2_start)}
                            onChange={(e) => handleTimeSlotChange(day.id, 'time_slot_2_start', e.target.value)}
                            className="flex-1"
                          />
                          <Input
                            type="time"
                            value={formatTime(day.time_slot_2_end)}
                            onChange={(e) => handleTimeSlotChange(day.id, 'time_slot_2_end', e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>

                      {/* Turno 3 */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Turno 3</Label>
                        <div className="flex gap-2">
                          <Input
                            type="time"
                            value={formatTime(day.time_slot_3_start)}
                            onChange={(e) => handleTimeSlotChange(day.id, 'time_slot_3_start', e.target.value)}
                            className="flex-1"
                          />
                          <Input
                            type="time"
                            value={formatTime(day.time_slot_3_end)}
                            onChange={(e) => handleTimeSlotChange(day.id, 'time_slot_3_end', e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-end mt-4">
                    <Button onClick={() => updateWeeklyAvailability(day)} size="sm">
                      <Save className="h-4 w-4 mr-2" />
                      Guardar
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="non-working" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Días No Laborables</CardTitle>
              <p className="text-sm text-muted-foreground">
                Configura fechas específicas en las que la empresa no trabaja (vacaciones, feriados, etc.)
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={newNonWorkingDay.date}
                  onChange={(e) => setNewNonWorkingDay({ ...newNonWorkingDay, date: e.target.value })}
                  className="flex-1"
                  min={new Date().toISOString().split('T')[0]}
                />
                <Input
                  placeholder="Motivo (opcional)"
                  value={newNonWorkingDay.reason}
                  onChange={(e) => setNewNonWorkingDay({ ...newNonWorkingDay, reason: e.target.value })}
                  className="flex-1"
                />
                <Button onClick={addNonWorkingDay}>
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir
                </Button>
              </div>

              <div className="space-y-2">
                {nonWorkingDays.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    No hay días no laborables configurados
                  </p>
                ) : (
                  nonWorkingDays.map((day) => (
                    <div key={day.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">
                          {new Date(day.date).toLocaleDateString('es-ES', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                        {day.reason && <p className="text-sm text-muted-foreground">{day.reason}</p>}
                      </div>
                      <Button
                        onClick={() => removeNonWorkingDay(day.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Reservas</CardTitle>
              <p className="text-sm text-muted-foreground">
                Establece límites máximos de reservas para controlar la capacidad
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="max-per-slot">Máximo de Reservas por Bloque Horario</Label>
                <div className="flex gap-2">
                  <Input
                    id="max-per-slot"
                    type="number"
                    min="1"
                    max="50"
                    defaultValue={getSettingValue('max_bookings_per_time_slot')}
                    onBlur={(e) => updateBookingSetting('max_bookings_per_time_slot', parseInt(e.target.value))}
                  />
                  <Button
                    onClick={() => {
                      const input = document.getElementById('max-per-slot') as HTMLInputElement;
                      updateBookingSetting('max_bookings_per_time_slot', parseInt(input.value));
                    }}
                    size="sm"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Guardar
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-per-day">Máximo de Reservas por Día</Label>
                <div className="flex gap-2">
                  <Input
                    id="max-per-day"
                    type="number"
                    min="1"
                    max="100"
                    defaultValue={getSettingValue('max_bookings_per_day')}
                    onBlur={(e) => updateBookingSetting('max_bookings_per_day', parseInt(e.target.value))}
                  />
                  <Button
                    onClick={() => {
                      const input = document.getElementById('max-per-day') as HTMLInputElement;
                      updateBookingSetting('max_bookings_per_day', parseInt(input.value));
                    }}
                    size="sm"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Guardar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};