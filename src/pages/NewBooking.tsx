
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, MapPin, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import ServiceSelection from "@/components/booking/ServiceSelection";
import AddressSelection from "@/components/booking/AddressSelection";
import CustomerDetails from "@/components/booking/CustomerDetails";
import PaymentSelection from "@/components/booking/PaymentSelection";
import BookingSummary from "@/components/booking/BookingSummary";
import { Calendar } from "@/components/booking/Calendar";

interface Service {
  id: string;
  name: string;
  description: string;
  base_price: number;
  category: string;
  duration_minutes: number;
}

interface Zone {
  id: string;
  name: string;
  multiplier: number;
  fixed_price: number;
  pricing_type: string;
}

interface BookingData {
  service?: Service;
  address?: string;
  latitude?: number;
  longitude?: number;
  zone?: Zone;
  finalPrice?: number;
  selectedDate?: string;
  selectedTime?: string;
  slotId?: string;
  customerData?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    customerType: 'person' | 'company';
    companyRegistration?: string;
    billingAddress: {
      address: string;
      country: string;
      province: string;
      city: string;
    };
  };
  paymentMethod?: string;
}

const NewBooking = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState<BookingData>({});
  const [loading, setLoading] = useState(false);

  const steps = [
    { number: 1, title: "Seleccionar Servicio", icon: "🔧" },
    { number: 2, title: "Dirección", icon: "📍" },
    { number: 3, title: "Fecha y Hora", icon: "📅" },
    { number: 4, title: "Datos del Cliente", icon: "👤" },
    { number: 5, title: "Método de Pago", icon: "💳" },
    { number: 6, title: "Resumen", icon: "📋" }
  ];

  useEffect(() => {
    if (serviceId) {
      fetchService();
    }
  }, [serviceId]);

  const fetchService = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', serviceId)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      setBookingData(prev => ({ ...prev, service: data }));
    } catch (error) {
      console.error('Error fetching service:', error);
      toast.error('Error al cargar el servicio');
      navigate('/');
    }
  };

  const handleStepComplete = (stepData: any) => {
    switch (currentStep) {
      case 1:
        setBookingData(prev => ({ ...prev, service: stepData }));
        break;
      case 2:
        setBookingData(prev => ({ 
          ...prev, 
          address: stepData.address,
          latitude: stepData.latitude,
          longitude: stepData.longitude,
          zone: stepData.zone,
          finalPrice: stepData.finalPrice
        }));
        break;
      case 3:
        // Validar que se hayan seleccionado tanto fecha como hora
        if (!stepData.date || !stepData.time) {
          toast.error('Debes seleccionar fecha y hora para continuar');
          return;
        }
        setBookingData(prev => ({ 
          ...prev, 
          selectedDate: stepData.date,
          selectedTime: stepData.time,
          slotId: stepData.slotId
        }));
        break;
      case 4:
        setBookingData(prev => ({ ...prev, customerData: stepData }));
        break;
      case 5:
        setBookingData(prev => ({ ...prev, paymentMethod: stepData }));
        break;
    }
    
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/');
    }
  };

  const handleSubmitBooking = async () => {
    setLoading(true);
    try {
      const booking = {
        service_id: bookingData.service?.id,
        customer_name: `${bookingData.customerData?.firstName} ${bookingData.customerData?.lastName}`,
        customer_email: bookingData.customerData?.email,
        customer_phone: bookingData.customerData?.phone,
        address: bookingData.address,
        latitude: bookingData.latitude,
        longitude: bookingData.longitude,
        zone_id: bookingData.zone?.id,
        total_amount: bookingData.finalPrice,
        scheduled_date: bookingData.selectedDate,
        scheduled_time: bookingData.selectedTime,
        status: 'pending',
        booking_status: 'pending_confirmation'
      };

      const { error } = await supabase
        .from('bookings')
        .insert([booking]);

      if (error) throw error;

      toast.success('Reserva creada exitosamente');
      navigate('/thanks');
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Error al crear la reserva');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <ServiceSelection
            selectedService={bookingData.service}
            onServiceSelect={handleStepComplete}
          />
        );
      case 2:
        return (
          <AddressSelection
            service={bookingData.service!}
            onAddressSelect={handleStepComplete}
          />
        );
      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold">Selecciona fecha y hora</h3>
              <p className="text-muted-foreground">Elige el día y horario que mejor te convenga</p>
            </div>
            <Calendar
              selectedDate={bookingData.selectedDate}
              selectedTime={bookingData.selectedTime}
              onDateTimeSelect={(date: string, time: string, slotId: string) => {
                // No auto-advance, just update the booking data
                setBookingData(prev => ({
                  ...prev,
                  selectedDate: date,
                  selectedTime: time,
                  slotId: slotId
                }));
              }}
            />
            
            {/* Continue Button - Only show when both date and time are selected */}
            {bookingData.selectedDate && bookingData.selectedTime && (
              <div className="mt-6 flex justify-center">
                <Button 
                  onClick={() => handleStepComplete({ 
                    date: bookingData.selectedDate, 
                    time: bookingData.selectedTime, 
                    slotId: bookingData.slotId 
                  })}
                  size="lg"
                  className="px-8"
                >
                  Continuar con los Datos del Cliente
                </Button>
              </div>
            )}
          </div>
        );
      case 4:
        return (
          <CustomerDetails
            initialData={bookingData.customerData}
            defaultAddress={bookingData.address}
            onComplete={handleStepComplete}
          />
        );
      case 5:
        return (
          <PaymentSelection
            totalAmount={bookingData.finalPrice || 0}
            onPaymentSelect={handleStepComplete}
          />
        );
      case 6:
        return (
          <BookingSummary
            bookingData={bookingData}
            onConfirm={handleSubmitBooking}
            loading={loading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Steps Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.number 
                    ? 'border-blue-500 bg-blue-500 text-white' 
                    : 'border-gray-300 bg-white text-gray-400'
                }`}>
                  {currentStep > step.number ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-semibold">{step.number}</span>
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.number ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    currentStep > step.number ? 'bg-blue-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">{steps[currentStep - 1].icon}</span>
                {steps[currentStep - 1].title}
              </CardTitle>
              <Button variant="ghost" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {currentStep === 1 ? 'Volver' : 'Anterior'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewBooking;
