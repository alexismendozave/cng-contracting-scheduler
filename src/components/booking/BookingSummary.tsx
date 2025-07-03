
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MapPin, User, CreditCard, Package } from "lucide-react";

interface BookingData {
  service?: {
    id: string;  
    name: string;
    description: string;
    base_price: number;
    duration_minutes: number;
  };
  address?: string;
  zone?: {
    name: string;
    pricing_type: string;
    multiplier: number;
    fixed_price: number;
  };
  finalPrice?: number;
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

interface BookingSummaryProps {
  bookingData: BookingData;
  onConfirm: () => void;
  loading: boolean;
}

const BookingSummary = ({ bookingData, onConfirm, loading }: BookingSummaryProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Servicio Seleccionado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">{bookingData.service?.name}</h3>
            <p className="text-gray-600">{bookingData.service?.description}</p>
            {bookingData.service?.duration_minutes && (
              <p className="text-sm text-gray-500">
                Duración estimada: {bookingData.service.duration_minutes} minutos
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Dirección del Servicio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">{bookingData.address}</p>
          {bookingData.zone && (
            <p className="text-sm text-blue-600 mt-2">
              Zona: {bookingData.zone.name}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Información del Cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Nombre:</strong> {bookingData.customerData?.firstName} {bookingData.customerData?.lastName}</p>
            <p><strong>Email:</strong> {bookingData.customerData?.email}</p>
            <p><strong>Teléfono:</strong> {bookingData.customerData?.phone}</p>
            <p><strong>Tipo:</strong> {bookingData.customerData?.customerType === 'company' ? 'Empresa' : 'Persona'}</p>
            {bookingData.customerData?.customerType === 'company' && bookingData.customerData?.companyRegistration && (
              <p><strong>Registro Mercantil:</strong> {bookingData.customerData.companyRegistration}</p>
            )}
          </div>
          
          <Separator className="my-4" />
          
          <div>
            <h4 className="font-medium mb-2">Dirección de Facturación:</h4>
            <p className="text-sm text-gray-600">
              {bookingData.customerData?.billingAddress.address}<br />
              {bookingData.customerData?.billingAddress.city}, {bookingData.customerData?.billingAddress.province}<br />
              {bookingData.customerData?.billingAddress.country}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resumen de Precios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Precio base del servicio:</span>
              <span>${bookingData.service?.base_price}</span>
            </div>
            {bookingData.zone && (
              <div className="flex justify-between">
                <span>Ajuste por zona ({bookingData.zone.name}):</span>
                <span>
                  {bookingData.zone.pricing_type === 'fixed' 
                    ? `+$${bookingData.zone.fixed_price}`
                    : `x${bookingData.zone.multiplier}`
                  }
                </span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span className="text-green-600">${bookingData.finalPrice}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold text-green-800">
              ¡Confirma tu reserva!
            </h3>
            <p className="text-green-700">
              Al confirmar, recibirás un email con los detalles de tu reserva y las instrucciones de pago.
            </p>
            <Button 
              onClick={onConfirm}
              disabled={loading}
              size="lg"
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Procesando...' : 'Confirmar Reserva'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingSummary;
