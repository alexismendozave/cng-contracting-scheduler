
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Service {
  id: string;
  name: string;
  description: string;
  base_price: number;
  category: string;
  duration_minutes: number;
}

interface ServiceSelectionProps {
  selectedService?: Service;
  onServiceSelect: (service: Service) => void;
}

const ServiceSelection = ({ selectedService, onServiceSelect }: ServiceSelectionProps) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando servicios...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {services.map((service) => (
          <Card 
            key={service.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedService?.id === service.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
            }`}
            onClick={() => onServiceSelect(service)}
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{service.name}</CardTitle>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    ${service.base_price}
                  </div>
                  {service.duration_minutes && (
                    <div className="text-sm text-gray-500">
                      {service.duration_minutes} min
                    </div>
                  )}
                </div>
              </div>
              {service.category && (
                <Badge variant="secondary" className="w-fit">
                  {service.category}
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              <CardDescription>{service.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedService && (
        <div className="flex justify-end pt-4">
          <Button onClick={() => onServiceSelect(selectedService)}>
            Continuar con {selectedService.name}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ServiceSelection;
