import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Clock, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
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
  date: string;
  reason: string | null;
}

interface BookingCount {
  date: string;
  time_slot: string;
  count: number;
}

interface CalendarProps {
  selectedDate?: string;
  selectedTime?: string;
  onDateTimeSelect: (date: string, time: string, slotId: string) => void;
}

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: string;
  selectedTime: string;
  onConfirm: () => void;
}

const ConfirmationDialog = ({ open, onOpenChange, selectedDate, selectedTime, onConfirm }: ConfirmationDialogProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Confirmar Fecha y Hora</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-center space-y-2">
            <div className="text-lg font-semibold">
              📅 {formatDate(selectedDate)}
            </div>
            <div className="text-lg font-semibold text-primary">
              🕐 {formatTime(selectedTime)}
            </div>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            ¿Confirmas esta fecha y hora para tu reserva?
          </p>
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              <X className="h-4 w-4 mr-2" />
              Cambiar
            </Button>
            <Button onClick={onConfirm} className="flex-1">
              <Check className="h-4 w-4 mr-2" />
              Confirmar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const NewAvailabilityCalendar = ({ 
  selectedDate, 
  selectedTime, 
  onDateTimeSelect
}: CalendarProps) => {
  const [weeklyAvailability, setWeeklyAvailability] = useState<WeeklyAvailability[]>([]);
  const [nonWorkingDays, setNonWorkingDays] = useState<NonWorkingDay[]>([]);
  const [bookingCounts, setBookingCounts] = useState<BookingCount[]>([]);
  const [maxBookingsPerSlot, setMaxBookingsPerSlot] = useState<number>(5);
  const [maxBookingsPerDay, setMaxBookingsPerDay] = useState<number>(20);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tempSelectedDate, setTempSelectedDate] = useState<string>("");
  const [tempSelectedTime, setTempSelectedTime] = useState<string>("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    fetchAvailabilityData();
  }, [currentMonth]);

  const fetchAvailabilityData = async () => {
    setLoading(true);
    try {
      // Fetch weekly availability
      const { data: weeklyData, error: weeklyError } = await supabase
        .from('weekly_availability')
        .select('*')
        .eq('is_active', true)
        .order('day_of_week');

      if (weeklyError) throw weeklyError;

      // Fetch non-working days
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      
      const { data: nonWorkingData, error: nonWorkingError } = await supabase
        .from('non_working_days')
        .select('date, reason')
        .eq('is_active', true)
        .gte('date', startOfMonth.toISOString().split('T')[0])
        .lte('date', endOfMonth.toISOString().split('T')[0]);

      if (nonWorkingError) throw nonWorkingError;

      // Fetch booking settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('booking_settings')
        .select('*')
        .in('setting_key', ['max_bookings_per_time_slot', 'max_bookings_per_day']);

      if (settingsError) throw settingsError;

      // Fetch existing bookings count
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('scheduled_date, scheduled_time')
        .gte('scheduled_date', startOfMonth.toISOString().split('T')[0])
        .lte('scheduled_date', endOfMonth.toISOString().split('T')[0])
        .not('booking_status', 'eq', 'cancelled');

      if (bookingsError) throw bookingsError;

      // Process booking counts
      const counts: { [key: string]: number } = {};
      bookingsData?.forEach(booking => {
        if (booking.scheduled_date && booking.scheduled_time) {
          const key = `${booking.scheduled_date}-${booking.scheduled_time}`;
          counts[key] = (counts[key] || 0) + 1;
        }
      });

      const bookingCountsArray = Object.entries(counts).map(([key, count]) => {
        const [date, time_slot] = key.split('-');
        return { date, time_slot, count };
      });

      setWeeklyAvailability(weeklyData || []);
      setNonWorkingDays(nonWorkingData || []);
      setBookingCounts(bookingCountsArray);
      
      // Set booking limits
      const maxPerSlot = typeof settingsData?.find(s => s.setting_key === 'max_bookings_per_time_slot')?.setting_value === 'number' 
        ? Number(settingsData.find(s => s.setting_key === 'max_bookings_per_time_slot')?.setting_value) 
        : 5;
      const maxPerDay = typeof settingsData?.find(s => s.setting_key === 'max_bookings_per_day')?.setting_value === 'number'
        ? Number(settingsData.find(s => s.setting_key === 'max_bookings_per_day')?.setting_value)
        : 20;
      setMaxBookingsPerSlot(maxPerSlot);
      setMaxBookingsPerDay(maxPerDay);

    } catch (error) {
      console.error('Error fetching availability data:', error);
      toast.error('Error al cargar disponibilidad');
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
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
    const dayOfWeek = date.getDay();
    const dateString = date.toISOString().split('T')[0];
    
    // Check if it's a non-working day
    const isNonWorkingDay = nonWorkingDays.some(nwd => nwd.date === dateString);
    if (isNonWorkingDay) return [];
    
    // Get weekly availability for this day
    const dayAvailability = weeklyAvailability.find(wa => wa.day_of_week === dayOfWeek);
    if (!dayAvailability || !dayAvailability.is_active) return [];
    
    const slots = [];
    
    // Time slot 1
    if (dayAvailability.time_slot_1_start && dayAvailability.time_slot_1_end) {
      slots.push({
        start: dayAvailability.time_slot_1_start,
        end: dayAvailability.time_slot_1_end,
        id: `${dateString}-${dayAvailability.time_slot_1_start}`
      });
    }
    
    // Time slot 2
    if (dayAvailability.time_slot_2_start && dayAvailability.time_slot_2_end) {
      slots.push({
        start: dayAvailability.time_slot_2_start,
        end: dayAvailability.time_slot_2_end,
        id: `${dateString}-${dayAvailability.time_slot_2_start}`
      });
    }
    
    // Time slot 3
    if (dayAvailability.time_slot_3_start && dayAvailability.time_slot_3_end) {
      slots.push({
        start: dayAvailability.time_slot_3_start,
        end: dayAvailability.time_slot_3_end,
        id: `${dateString}-${dayAvailability.time_slot_3_start}`
      });
    }
    
    return slots;
  };

  const getBookingCountForSlot = (date: string, time: string) => {
    const booking = bookingCounts.find(bc => bc.date === date && bc.time_slot === time);
    return booking?.count || 0;
  };

  const getDayBookingCount = (date: string) => {
    return bookingCounts
      .filter(bc => bc.date === date)
      .reduce((sum, bc) => sum + bc.count, 0);
  };

  const isSlotAvailable = (date: string, time: string) => {
    const slotCount = getBookingCountForSlot(date, time);
    const dayCount = getDayBookingCount(date);
    return slotCount < maxBookingsPerSlot && dayCount < maxBookingsPerDay;
  };

  const handleSlotSelect = (date: string, time: string) => {
    if (isSlotAvailable(date, time)) {
      setTempSelectedDate(date);
      setTempSelectedTime(time);
      setShowConfirmation(true);
    } else {
      toast.error('Este horario ya no está disponible');
    }
  };

  const handleConfirmSelection = () => {
    if (tempSelectedDate && tempSelectedTime) {
      onDateTimeSelect(tempSelectedDate, tempSelectedTime, `${tempSelectedDate}-${tempSelectedTime}`);
      setShowConfirmation(false);
      setTempSelectedDate("");
      setTempSelectedTime("");
    }
  };

  const handleDayClick = (dateString: string) => {
    setTempSelectedDate(dateString);
    // Scroll to time slots
    setTimeout(() => {
      const slotsElement = document.querySelector('[data-time-slots]');
      if (slotsElement) {
        slotsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
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

            const dateString = day.toISOString().split('T')[0];
            const slots = getAvailableSlotsForDate(day);
            const hasSlots = slots.length > 0;
            const isSelected = tempSelectedDate === dateString || selectedDate === dateString;
            const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));
            const isNonWorkingDay = nonWorkingDays.some(nwd => nwd.date === dateString);
            const dayBookingCount = getDayBookingCount(dateString);
            
            let dayStatus = '';
            let statusColor = '';
            
            if (isPast) {
              dayStatus = 'Pasado';
              statusColor = 'bg-gray-100 text-gray-400';
            } else if (isNonWorkingDay) {
              dayStatus = 'No laborable';
              statusColor = 'bg-red-100 text-red-600';
            } else if (!hasSlots) {
              dayStatus = 'Cerrado';
              statusColor = 'bg-gray-100 text-gray-500';
            } else if (dayBookingCount >= maxBookingsPerDay) {
              dayStatus = 'Completo';
              statusColor = 'bg-orange-100 text-orange-600';
            } else {
              dayStatus = `${slots.length} horarios`;
              statusColor = 'bg-green-100 text-green-600';
            }

            return (
              <div
                key={index}
                className={`p-2 min-h-[80px] border rounded transition-colors ${
                  hasSlots && !isPast && !isNonWorkingDay && dayBookingCount < maxBookingsPerDay
                    ? 'hover:bg-primary/10 border-primary/20 cursor-pointer' 
                    : 'border-border cursor-not-allowed opacity-75'
                } ${isSelected ? 'bg-primary/20 border-primary' : ''}`}
                onClick={hasSlots && !isPast && !isNonWorkingDay ? () => handleDayClick(dateString) : undefined}
              >
                <div className="text-sm font-medium">{day.getDate()}</div>
                <Badge variant="secondary" className={`text-xs mt-1 ${statusColor}`}>
                  {dayStatus}
                </Badge>
              </div>
            );
          })}
        </div>

        {/* Available Time Slots */}
        {(tempSelectedDate || selectedDate) && (
          <div className="mt-6" data-time-slots>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Horas Disponibles {tempSelectedDate && !tempSelectedTime && (
                <Badge variant="destructive" className="ml-2">Obligatorio</Badge>
              )}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {(() => {
                const targetDate = tempSelectedDate || selectedDate;
                const selectedDateObj = new Date(targetDate!);
                const slots = getAvailableSlotsForDate(selectedDateObj);
                
                if (slots.length === 0) {
                  return (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                      No hay horarios disponibles para esta fecha
                    </div>
                  );
                }
                
                return slots.map(slot => {
                  const bookingCount = getBookingCountForSlot(targetDate!, slot.start);
                  const isAvailable = isSlotAvailable(targetDate!, slot.start);
                  const isCurrentlySelected = (tempSelectedTime === slot.start) || (selectedTime === slot.start && !tempSelectedDate);
                  
                  return (
                    <Button
                      key={slot.id}
                      variant={isCurrentlySelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleSlotSelect(targetDate!, slot.start)}
                      disabled={!isAvailable}
                      className="text-sm flex flex-col p-3 h-auto"
                    >
                      <div>{formatTime(slot.start)} - {formatTime(slot.end)}</div>
                      <div className="text-xs opacity-75">
                        {bookingCount}/{maxBookingsPerSlot} reservas
                      </div>
                    </Button>
                  );
                });
              })()}
            </div>
            {tempSelectedDate && !tempSelectedTime && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  ⚠️ <strong>Debes seleccionar una hora</strong> para continuar con tu reserva.
                </p>
              </div>
            )}
          </div>
        )}

        <ConfirmationDialog
          open={showConfirmation}
          onOpenChange={setShowConfirmation}
          selectedDate={tempSelectedDate}
          selectedTime={tempSelectedTime}
          onConfirm={handleConfirmSelection}
        />
      </CardContent>
    </Card>
  );
};