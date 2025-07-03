
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, MapPin, Clock, CreditCard, ArrowLeft, User, Mail, Phone, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Booking = () => {
  const { serviceId } = useParams();
  const { toast } = useToast();
  const [step, setStep] = useState(1); // 1: Service, 2: Details, 3: Zone, 4: DateTime, 5: Payment
  const [bookingData, setBookingData] = useState({
    service: null,
    selectedZone: null,
    finalPrice: 0,
    priceExplanation: "",
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
  });

  // Mock services data (vendría de WooCommerce API)
  const services = [
    {
      id: 1,
      woocommerce_id: 123,
      name: "Reparación de Plomería",
      category: "plumbing",
      description: "Reparación de fugas, instalación de grifos, destapado de tuberías",
      basePrice: 89,
      duration: "1-2 horas",
      detailedDescription: "Nuestro servicio de plomería incluye diagnóstico completo, reparación de fugas, instalación y reemplazo de grifos, destapado profesional de tuberías, y garantía de 30 días en todos los trabajos.",
      inclusions: ["Diagnóstico gratuito", "Materiales básicos incluidos", "Garantía 30 días", "Limpieza del área de trabajo"]
    },
    // ... otros servicios
  ];

  // Mock zones data (vendría de la base de datos)
  const zones = [
    { 
      id: 1, 
      name: "Zona Centro", 
      multiplier: 1.0, 
      description: "Área metropolitana central - Sin recargo" 
    },
    { 
      id: 2, 
      name: "Zona Norte", 
      multiplier: 1.15, 
      description: "Área norte de la ciudad - 15% recargo por distancia" 
    },
    { 
      id: 3, 
      name: "Zona Sur", 
      multiplier: 1.1, 
      description: "Área sur de la ciudad - 10% recargo por distancia" 
    },
    { 
      id: 4, 
      name: "Zona Este", 
      multiplier: 1.2, 
      description: "Área este de la ciudad - 20% recargo por distancia y tráfico" 
    },
    { 
      id: 5, 
      name: "Zona Oeste", 
      multiplier: 1.25, 
      description: "Área oeste de la ciudad - 25% recargo por distancia extendida" 
    },
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

  const handleZoneSelection = (zoneId) => {
    const zone = zones.find(z => z.id === parseInt(zoneId));
    const newPrice = Math.round(bookingData.service.basePrice * zone.multiplier);
    const priceDifference = newPrice - bookingData.service.basePrice;
    
    let explanation = "";
    if (priceDifference > 0) {
      explanation = `Precio ajustado por ${zone.name}: +$${priceDifference} (${zone.description})`;
    } else {
      explanation = `Precio base para ${zone.name} - ${zone.description}`;
    }

    setBookingData(prev => ({
      ...prev,
      selectedZone: zone,
      finalPrice: newPrice,
      priceExplanation: explanation
    }));
  };

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleStripePayment = () => {
    // Integración con WooCommerce y Stripe
    const stripeUrl = `https://tu-wordpress.com/checkout/?add-to-cart=${bookingData.service.woocommerce_id}&zone=${bookingData.selectedZone?.id}&date=${bookingData.date}&time=${bookingData.time}&customer_data=${encodeURIComponent(JSON.stringify(bookingData.customerInfo))}`;
    
    // Abrir Stripe en nueva pestaña
    window.open(stripeUrl, '_blank');
    
    toast({
      title: "Redirigiendo a pago...",
      description: "Te hemos redirigido a la página de pago seguro.",
    });
  };

  if (!bookingData.service) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  const stepTitles = {
    1: "Servicio Seleccionado",
    2: "Detalles del Servicio",
    3: "Selecciona tu Zona",
    4: "Fecha y Hora",
    5: "Datos y Pago"
  };

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
            {[1, 2, 3, 4, 5].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNum ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                }`}>
                  {step > stepNum ? <CheckCircle className="h-4 w-4" /> : stepNum}
                </div>
                {stepNum < 5 && (
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
              {/* Step 1: Service Selected */}
              {step === 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Paso 1: {stepTitles[1]}</CardTitle>
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
                          Desde ${bookingData.service.basePrice}
                        </span>
                      </div>
                    </div>
                    
                    <Button onClick={handleNext} className="w-full bg-blue-600 hover:bg-blue-700">
                      Continuar con este servicio
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Service Details */}
              {step === 2 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Paso 2: {stepTitles[2]}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-4">{bookingData.service.name}</h3>
                      <p className="text-gray-700 mb-4">{bookingData.service.detailedDescription}</p>
                      
                      <h4 className="font-semibold mb-2">Incluye:</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-600 mb-4">
                        {bookingData.service.inclusions?.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <Label htmlFor="notes">Notas adicionales (opcional)</Label>
                      <Textarea 
                        id="notes"
                        placeholder="Describe detalles específicos del trabajo que necesitas..."
                        className="mt-1"
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" onClick={handleBack} className="flex-1">
                        Atrás
                      </Button>
                      <Button onClick={handleNext} className="flex-1 bg-blue-600 hover:bg-blue-700">
                        Continuar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Zone Selection */}
              {step === 3 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Paso 3: {stepTitles[3]}</CardTitle>
                    <CardDescription>
                      El precio puede variar según tu ubicación
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-3">
                      {zones.map((zone) => (
                        <div
                          key={zone.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            bookingData.selectedZone?.id === zone.id 
                              ? "border-blue-500 bg-blue-50" 
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => handleZoneSelection(zone.id)}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold">{zone.name}</h4>
                            <span className="text-lg font-bold text-blue-600">
                              ${Math.round(bookingData.service.basePrice * zone.multiplier)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{zone.description}</p>
                          {zone.multiplier !== 1.0 && (
                            <span className="text-xs text-orange-600">
                              +${Math.round(bookingData.service.basePrice * zone.multiplier) - bookingData.service.basePrice} sobre precio base
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    {bookingData.priceExplanation && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                          <strong>Explicación del precio:</strong> {bookingData.priceExplanation}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button variant="outline" onClick={handleBack} className="flex-1">
                        Atrás
                      </Button>
                      <Button 
                        onClick={handleNext} 
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                        disabled={!bookingData.selectedZone}
                      >
                        Continuar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 4: Date & Time */}
              {step === 4 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Paso 4: {stepTitles[4]}</CardTitle>
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

              {/* Step 5: Customer Info & Payment */}
              {step === 5 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Paso 5: {stepTitles[5]}</CardTitle>
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
                      <Label htmlFor="street">Dirección completa</Label>
                      <Input 
                        id="street"
                        value={bookingData.address.street}
                        onChange={(e) => setBookingData(prev => ({
                          ...prev, 
                          address: {...prev.address, street: e.target.value}
                        }))}
                        placeholder="123 Main Street, Ciudad, Provincia, Código Postal"
                        className="mt-1"
                      />
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Resumen de la reserva</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Servicio:</span>
                          <span>{bookingData.service.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Zona:</span>
                          <span>{bookingData.selectedZone?.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fecha:</span>
                          <span>{bookingData.date} a las {bookingData.time}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-lg border-t pt-2">
                          <span>Total:</span>
                          <span>${bookingData.finalPrice}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" onClick={handleBack} className="flex-1">
                        Atrás
                      </Button>
                      <Button 
                        onClick={handleStripePayment} 
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        disabled={!bookingData.customerInfo.name || !bookingData.customerInfo.email || !bookingData.address.street}
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Pagar con Tarjeta
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
                    
                    {bookingData.selectedZone && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>{bookingData.selectedZone.name}</span>
                      </div>
                    )}
                    
                    {bookingData.date && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>{bookingData.date} - {bookingData.time}</span>
                      </div>
                    )}

                    <div className="border-t pt-4">
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Total:</span>
                        <span className="text-blue-600">${bookingData.finalPrice}</span>
                      </div>
                      {bookingData.priceExplanation && (
                        <p className="text-xs text-gray-500 mt-1">
                          {bookingData.priceExplanation}
                        </p>
                      )}
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
