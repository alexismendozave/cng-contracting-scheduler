
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { Service, Zone } from "./types";

interface AnalyticsProps {
  services: Service[];
  zones: Zone[];
}

const Analytics = ({ services, zones }: AnalyticsProps) => {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Ingresos por Mes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                <p>Gráfico de ingresos</p>
                <p className="text-sm">Integrar con Recharts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Servicios Más Populares</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {services.map((service, index) => (
                <div key={service.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                    <span className="font-medium">{service.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Distribución por Zonas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {zones.map((zone) => (
              <div key={zone.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: zone.color || '#3B82F6' }}
                  ></div>
                  <span className="font-medium">{zone.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full"
                      style={{ 
                        width: `${Math.min((zones.filter(z => z.id === zone.id).length / zones.length) * 100, 100)}%`,
                        backgroundColor: zone.color || '#3B82F6'
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">
                    {zone.pricing_type === 'fixed' 
                      ? `+$${zone.fixed_price}`
                      : `${zone.multiplier}x`
                    }
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
