
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, MapPin, Clock, CreditCard, ArrowLeft, User, Mail, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Booking = () => {
  const { serviceId } = useParams();
  const { toast } = useToast();
  const [step, setStep] = useState(1); // 1: Service Details, 2: Date/Time, 3: Address, 4: Payment
  const [bookingData, setBookingData] = useState({
    service: null,
    date: "",
    time: "",
    customerInfo: {
      name: "",
      email: "",
      phone: "",
    },
    address: {
      street: "",
      city: "",
      province: "",
      postalCode: "",
      notes: "",
    },
    zone: null,
    finalPrice: 0,
  });

  // Mock service data
  const services = [
    {
      id: 1,
      name: "Reparación de Plomería",
      category: "plumbing",
      description: "Reparación de fugas, instalación de grifos, destapado de tuberías",
      basePrice: 89,
      duration: "1-2 horas",
    },
    {
      id: 2,
      name: "Instalación Eléctrica",
      category: "electrical",
      description: "Instalación de tomacorrientes, luces, reparación de circuitos",
      basePrice: 95,
      duration: "1-3 horas",
    },
    {
      id: 3,
      name: "Pintura Interior",
      category: "painting",
      description: "Pintura de habitaciones, acabados profesionales",
      basePrice: 150,
      duration: "4-8 horas",
    },
    {
      id: 4,
      name: "Paquete Renovación Baño",
      category: "plumbing",
      description: "Plomería + Electricidad + Pintura para baño completo",
      basePrice: 299,
      duration: "1-2 días",
    },
    {
      id: 5,
      name: "Reparaciones Generales",
      category: "general",
      description: "Montaje de muebles, reparaciones menores, mantenimiento",
      basePrice: 75,
      duration: "1-2 horas",
    }
  ];

  // Mock zones with pricing
  const zones = [
    { id: 1, name: "Zona Centro", multiplier: 1.0 },
    { id: 2, name: "Zona Norte", multiplier: 1.15 },
    { id: 3, name: "Zona Sur", multiplier: 1.1 },
    { id: 4, name: "Zona Este", multiplier: 1.2 },
    { id: 5, name: "Zona Oeste", multiplier: 1.25 },
  ];

  // Available time slots
  const timeSlots = [
    "08:00", "09:00", "10:00", "11:00", "12:00", 
    "13:00", "14:00", "15:00", "16:00", "17:00"
  ];

  useEffect(() => {
    const service = services.find(s => s.id === parseInt(serviceId));
    if (service) {
      setBookingData(prev => ({
        ...prev,
        service,
        finalPrice: service.basePrice
      }));
    }
  }, [serviceId]);

  const calculateZonePrice = (postalCode) => {
    // Mock zone detection based on postal code
    const firstLetter = postalCode.charAt(0).toUpperCase();
    let zone;
    
    switch (firstLetter) {
      case 'M': zone = zones[0]; break; // Centro
      case 'L': zone = zones[1]; break; // Norte
      case 'K': zone = zones[2]; break; // Sur
      case 'N': zone = zones[3]; break; // Este
      default: zone = zones[4]; break; // Oeste
    }

    const finalPrice = Math.round(bookingData.service.basePrice * zone.multiplier);
    
    setBookingData(prev => ({
      ...prev,
      zone,
      finalPrice
    }));
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = () => {
    toast({
      title: "¡Reserva confirmada!",
      description: "Recibirás un email de confirmación en breve.",
    });
    // Here would integrate with Stripe payment and booking system
  };

  if (!bookingData.service) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
              <ArrowLeft className="h-5 w-5" />
              <span>Volver a servicios</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">CNG Contracting</h1>
            <div className="w-24"></div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3, 4].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNum ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                }`}>
                  {stepNum}
                </div>
                {stepNum < 4 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step > stepNum ? "bg-blue-600" : "bg-gray-200"
                  }`} />
                )}
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Step 1: Service Details */}
              {step === 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Detalles del Servicio
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{bookingData.service.name}</h3>
                      <p className="text-gray-600 mb-4">{bookingData.service.description}</p>
                      <div className="flex items-center gap-4">
                        <span className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-1" />
                          {bookingData.service.duration}
                        </span>
                        <span className="text-2xl font-bold text-blue-600">
                          ${bookingData.service.basePrice}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="notes">Notas adicionales (opcional)</Label>
                      <Textarea 
                        id="notes"
                        placeholder="Describe detalles específicos del trabajo que necesitas..."
                        className="mt-1"
                      />
                    </div>

                    <Button onClick={handleNext} className="w-full bg-blue-600 hover:bg-blue-700">
                      Continuar
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Date & Time */}
              {step === 2 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Fecha y Hora
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label htmlFor="date">Fecha preferida</Label>
                      <Input 
                        id="date"
                        type="date"
                        value={bookingData.date}
                        onChange={(e) => setBookingData(prev => ({...prev, date: e.target.value}))}
                        min={new Date().toISOString().split('T')[0]}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Hora preferida</Label>
                      <Select onValueChange={(value) => setBookingData(prev => ({...prev, time: value}))}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Selecciona una hora" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" onClick={handleBack} className="flex-1">
                        Atrás
                      </Button>
                      <Button 
                        onClick={handleNext} 
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                        disabled={!bookingData.date || !bookingData.time}
                      >
                        Continuar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Address */}
              {step === 3 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Información del Cliente y Dirección
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Nombre completo</Label>
                        <Input 
                          id="name"
                          value={bookingData.customerInfo.name}
                          onChange={(e) => setBookingData(prev => ({
                            ...prev, 
                            customerInfo: {...prev.customerInfo, name: e.target.value}
                          }))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email"
                          type="email"
                          value={bookingData.customerInfo.email}
                          onChange={(e) => setBookingData(prev => ({
                            ...prev, 
                            customerInfo: {...prev.customerInfo, email: e.target.value}
                          }))}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input 
                        id="phone"
                        value={bookingData.customerInfo.phone}
                        onChange={(e) => setBookingData(prev => ({
                          ...prev, 
                          customerInfo: {...prev.customerInfo, phone: e.target.value}
                        }))}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="street">Dirección</Label>
                      <Input 
                        id="street"
                        value={bookingData.address.street}
                        onChange={(e) => setBookingData(prev => ({
                          ...prev, 
                          address: {...prev.address, street: e.target.value}
                        }))}
                        placeholder="123 Main Street"
                        className="mt-1"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">Ciudad</Label>
                        <Input 
                          id="city"
                          value={bookingData.address.city}
                          onChange={(e) => setBookingData(prev => ({
                            ...prev, 
                            address: {...prev.address, city: e.target.value}
                          }))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="province">Provincia</Label>
                        <Select onValueChange={(value) => setBookingData(prev => ({
                          ...prev, 
                          address: {...prev.address, province: value}
                        }))}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Selecciona provincia" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ON">Ontario</SelectItem>
                            <SelectItem value="BC">British Columbia</SelectItem>
                            <SelectItem value="AB">Alberta</SelectItem>
                            <SelectItem value="QC">Quebec</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="postalCode">Código Postal</Label>
                      <Input 
                        id="postalCode"
                        value={bookingData.address.postalCode}
                        onChange={(e) => {
                          const value = e.target.value;
                          setBookingData(prev => ({
                            ...prev, 
                            address: {...prev.address, postalCode: value}
                          }));
                          if (value.length >= 3) {
                            calculateZonePrice(value);
                          }
                        }}
                        placeholder="M5V 3A3"
                        className="mt-1"
                      />
                      {bookingData.zone && (
                        <p className="text-sm text-blue-600 mt-1">
                          {bookingData.zone.name} - Precio actualizado: ${bookingData.finalPrice}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" onClick={handleBack} className="flex-1">
                        Atrás
                      </Button>
                      <Button 
                        onClick={handleNext} 
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                        disabled={!bookingData.customerInfo.name || !bookingData.customerInfo.email || !bookingData.address.street}
                      >
                        Continuar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 4: Payment */}
              {step === 4 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Pago y Confirmación
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Resumen de la reserva</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Servicio:</span>
                          <span>{bookingData.service.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fecha:</span>
                          <span>{bookingData.date} a las {bookingData.time}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Zona:</span>
                          <span>{bookingData.zone?.name || "Por determinar"}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-lg border-t pt-2">
                          <span>Total:</span>
                          <span>${bookingData.finalPrice}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        • El pago se procesará de forma segura con Stripe
                      </p>
                      <p className="text-sm text-gray-600">
                        • Recibirás confirmación por email
                      </p>
                      <p className="text-sm text-gray-600">
                        • Nuestro técnico te contactará 24h antes del servicio
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" onClick={handleBack} className="flex-1">
                        Atrás
                      </Button>
                      <Button 
                        onClick={handleSubmit} 
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        Confirmar y Pagar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="text-lg">Resumen</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">{bookingData.service.name}</h4>
                      <p className="text-sm text-gray-600">{bookingData.service.duration}</p>
                    </div>
                    
                    {bookingData.date && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>{bookingData.date} - {bookingData.time}</span>
                      </div>
                    )}

                    {bookingData.zone && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>{bookingData.zone.name}</span>
                      </div>
                    )}

                    <div className="border-t pt-4">
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Total:</span>
                        <span className="text-blue-600">${bookingData.finalPrice}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
