
import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Calendar, MapPin, Clock, Mail, Phone } from "lucide-react";

const Thanks = () => {
  const [searchParams] = useSearchParams();
  
  // Parámetros que vendrían de Stripe después del pago exitoso
  const sessionId = searchParams.get('session_id');
  const serviceId = searchParams.get('service_id');
  const date = searchParams.get('date');
  const time = searchParams.get('time');
  const zone = searchParams.get('zone');
  const total = searchParams.get('total');

  useEffect(() => {
    // Aquí podrías hacer una llamada a tu backend para confirmar el pago
    // y crear la reserva en tu sistema/WooCommerce
    if (sessionId) {
      console.log('Payment confirmed with session:', sessionId);
      // Llamar API para confirmar reserva
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ¡Reserva Confirmada!
            </h1>
            <p className="text-xl text-gray-600">
              Tu pago ha sido procesado exitosamente
            </p>
          </div>

          {/* Booking Details */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Detalles de tu Reserva
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-700">Número de Confirmación</h4>
                  <p className="text-gray-900">{sessionId?.substring(0, 8).toUpperCase() || 'CNG-12345'}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700">Total Pagado</h4>
                  <p className="text-2xl font-bold text-green-600">${total || '150'}</p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>Fecha: {date || 'Por confirmar'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>Hora: {time || 'Por confirmar'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>Zona: {zone || 'Por confirmar'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Próximos Pasos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Mail className="h-3 w-3 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Confirmación por Email</h4>
                    <p className="text-sm text-gray-600">
                      Recibirás un email con todos los detalles de tu reserva en los próximos minutos.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Phone className="h-3 w-3 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Contacto del Técnico</h4>
                    <p className="text-sm text-gray-600">
                      Nuestro técnico te contactará 24 horas antes del servicio para confirmar los detalles.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="h-3 w-3 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Día del Servicio</h4>
                    <p className="text-sm text-gray-600">
                      Nuestro técnico llegará puntual con todas las herramientas necesarias para realizar el trabajo.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>¿Necesitas ayuda?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-gray-600">
                  Si tienes preguntas sobre tu reserva, no dudes en contactarnos:
                </p>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="font-semibold">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="font-semibold">info@cngcontracting.ca</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button className="flex-1 bg-blue-600 hover:bg-blue-700" asChild>
              <Link to="/">
                Reservar Otro Servicio
              </Link>
            </Button>
            <Button variant="outline" className="flex-1" asChild>
              <Link to="/">
                Volver al Inicio
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Thanks;
