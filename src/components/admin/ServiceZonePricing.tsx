
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Service, Zone, ServiceZonePrice } from "./types";

interface ServiceZonePricingProps {
  services: Service[];
  zones: Zone[];
  serviceZonePrices: ServiceZonePrice[];
  onDataRefresh: () => void;
}

const ServiceZonePricing = ({ services, zones, serviceZonePrices, onDataRefresh }: ServiceZonePricingProps) => {
  const [zonePricing, setZonePricing] = useState<Record<string, string>>({});

  const getServiceZonePrice = (serviceId: string, zoneId: string) => {
    const customPrice = serviceZonePrices.find(
      szp => szp.service_id === serviceId && szp.zone_id === zoneId
    );
    return customPrice?.custom_price || null;
  };

  const calculateFinalPrice = (service: Service, zone: Zone) => {
    const customPrice = getServiceZonePrice(service.id, zone.id);
    if (customPrice) {
      return customPrice;
    }

    if (zone.pricing_type === 'fixed' && zone.fixed_price) {
      return service.base_price + zone.fixed_price;
    } else {
      return service.base_price * (zone.multiplier || 1);
    }
  };

  const handleSaveZonePricing = async (serviceId: string, zoneId: string, price: string) => {
    const customPrice = parseFloat(price);
    if (isNaN(customPrice)) {
      toast.error('Precio inválido');
      return;
    }

    const existing = serviceZonePrices.find(
      szp => szp.service_id === serviceId && szp.zone_id === zoneId
    );

    if (existing) {
      const { error } = await supabase
        .from('service_zone_prices')
        .update({ custom_price: customPrice })
        .eq('id', existing.id);

      if (error) {
        toast.error('Error al actualizar precio: ' + error.message);
      } else {
        toast.success('Precio actualizado exitosamente');
      }
    } else {
      const { error } = await supabase
        .from('service_zone_prices')
        .insert([{
          service_id: serviceId,
          zone_id: zoneId,
          custom_price: customPrice
        }]);

      if (error) {
        toast.error('Error al crear precio: ' + error.message);
      } else {
        toast.success('Precio creado exitosamente');
      }
    }

    onDataRefresh();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Servicios y Precios por Zona</CardTitle>
        <CardDescription>Gestiona los servicios y sus precios por zona</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {services.map((service) => (
            <div key={service.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold">{service.name}</h4>
                  <p className="text-sm text-gray-600">{service.description}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-green-600 font-medium">${service.base_price}</span>
                    <span className="text-gray-500">{service.category}</span>
                    {service.deposit_type !== 'none' && (
                      <span className="text-blue-600 text-sm">
                        Depósito: {service.deposit_type === 'percentage' ? `${service.deposit_amount}%` : `$${service.deposit_amount}`}
                      </span>
                    )}
                  </div>
                </div>
                <Badge variant={service.is_active ? "default" : "secondary"}>
                  {service.is_active ? "Activo" : "Inactivo"}
                </Badge>
              </div>

              <div className="mt-4">
                <h5 className="font-medium mb-2">Precios por Zona</h5>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {zones.map((zone) => (
                    <div key={zone.id} className="border rounded p-3 bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{zone.name}</span>
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: zone.color || '#3B82F6' }}
                        ></div>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        {zone.pricing_type === 'fixed' 
                          ? `+$${zone.fixed_price} fijo`
                          : `${zone.multiplier}x multiplicador`
                        }
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          step="0.01"
                          placeholder={`$${calculateFinalPrice(service, zone)}`}
                          value={zonePricing[`${service.id}-${zone.id}`] || ''}
                          onChange={(e) => setZonePricing({
                            ...zonePricing,
                            [`${service.id}-${zone.id}`]: e.target.value
                          })}
                          className="text-sm"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleSaveZonePricing(
                            service.id, 
                            zone.id, 
                            zonePricing[`${service.id}-${zone.id}`]
                          )}
                          disabled={!zonePricing[`${service.id}-${zone.id}`]}
                        >
                          <Save className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      {getServiceZonePrice(service.id, zone.id) && (
                        <div className="text-xs text-green-600 mt-1">
                          Precio personalizado: ${getServiceZonePrice(service.id, zone.id)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceZonePricing;
