import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AvailabilitySlot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
  handyman_id: string;
}

interface CalendarProps {
  selectedDate?: string;
  selectedTime?: string;
  onDateTimeSelect: (date: string, time: string, slotId: string) => void;
  handymanId?: string;
}

export const Calendar = ({ 
  selectedDate, 
  selectedTime, 
  onDateTimeSelect, 
  handymanId 
}: CalendarProps) => {
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetchAvailableSlots();
  }, [handymanId, currentMonth]);

  const fetchAvailableSlots = async () => {
    setLoading(true);
    try {
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      let query = supabase
        .from('availability_slots')
        .select('*')
        .eq('is_booked', false)
        .gte('date', startOfMonth.toISOString().split('T')[0])
        .lte('date', endOfMonth.toISOString().split('T')[0])
        .order('date')
        .order('start_time');

      if (handymanId) {
        query = query.eq('handyman_id', handymanId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAvailableSlots(data || []);
    } catch (error) {
      console.error('Error fetching available slots:', error);
      toast.error('Error al cargar disponibilidad');
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getAvailableSlotsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return availableSlots.filter(slot => slot.date === dateString);
  };

  const handleSlotSelect = (slot: AvailabilitySlot) => {
    onDateTimeSelect(slot.date, slot.start_time, slot.id);
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
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

  const days = getDaysInMonth(currentMonth);
  const monthYear = currentMonth.toLocaleDateString('es-ES', { 
    month: 'long', 
    year: 'numeric' 
  });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Calendario de Disponibilidad
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Seleccionar Fecha y Hora
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigateMonth('prev')}
          >
            ← Anterior
          </Button>
          <h3 className="text-lg font-semibold capitalize">{monthYear}</h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigateMonth('next')}
          >
            Siguiente →
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
            <div key={day} className="p-2 text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
          
          {days.map((day, index) => {
            if (!day) {
              return <div key={index} className="p-2"></div>;
            }

            const slots = getAvailableSlotsForDate(day);
            const hasSlots = slots.length > 0;
            const isSelected = selectedDate === day.toISOString().split('T')[0];

            return (
              <div
                key={index}
                className={`p-2 min-h-[60px] border rounded cursor-pointer transition-colors ${
                  hasSlots 
                    ? 'hover:bg-primary/10 border-primary/20' 
                    : 'border-border cursor-not-allowed opacity-50'
                } ${isSelected ? 'bg-primary/20 border-primary' : ''}`}
              >
                <div className="text-sm font-medium">{day.getDate()}</div>
                {hasSlots && (
                  <Badge variant="secondary" className="text-xs mt-1">
                    {slots.length} slot{slots.length !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
            );
          })}
        </div>

        {/* Available Time Slots */}
        {selectedDate && (
          <div className="mt-6">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Horas Disponibles
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {availableSlots
                .filter(slot => slot.date === selectedDate)
                .map(slot => (
                  <Button
                    key={slot.id}
                    variant={selectedTime === slot.start_time ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSlotSelect(slot)}
                    className="text-sm"
                  >
                    {formatTime(slot.start_time)}
                  </Button>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};