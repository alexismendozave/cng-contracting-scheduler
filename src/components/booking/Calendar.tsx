import { useState, useEffect } from "react";
import { NewAvailabilityCalendar } from "./NewAvailabilityCalendar";

interface CalendarProps {
  selectedDate?: string;
  selectedTime?: string;
  onDateTimeSelect: (date: string, time: string, slotId: string) => void;
}

export const Calendar = ({ 
  selectedDate, 
  selectedTime, 
  onDateTimeSelect 
}: CalendarProps) => {
  return (
    <NewAvailabilityCalendar 
      selectedDate={selectedDate}
      selectedTime={selectedTime}
      onDateTimeSelect={onDateTimeSelect}
    />
  );
};