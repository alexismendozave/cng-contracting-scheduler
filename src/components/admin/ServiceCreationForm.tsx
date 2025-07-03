
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Zone } from "./types";
import { useEffect } from "react";

interface ServiceCreationFormProps {
  onServiceCreated: () => void;
}

const ServiceCreationForm = ({ onServiceCreated }: ServiceCreationFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    base_price: '',
    duration_minutes: '',
    deposit_type: 'none',
    deposit_amount: ''
  });
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      const { data: zonesData } = await supabase
        .from('zones')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      setZones(zonesData || []);
    } catch (error) {
      console.error('Error fetching zones:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const serviceData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        base_price: parseFloat(formData.base_price),
        duration_minutes: parseInt(formData.duration_minutes),
        deposit_type: formData.deposit_type,
        deposit_amount: formData.deposit_type !== 'none' ? parseFloat(formData.deposit_amount) : 0
      };

      const { error } = await supabase
        .from('services')
        .insert([serviceData]);

      if (error) throw error;

      toast.success('Servicio creado exitosamente');
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        category: '',
        base_price: '',
        duration_minutes: '',
        deposit_type: 'none',
        deposit_amount: ''
      });
      
      onServiceCreated();
    } catch (error) {
      console.error('Error creating service:', error);
      toast.error('Error al crear el servicio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Service Creation Form */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Crear Nuevo Servicio</CardTitle>
            <CardDescription>Agrega un nuevo servicio al catálogo</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nombre del servicio</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ej: Reparación de plomería"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Categoría</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="plomeria">Plomería</SelectItem>
                      <SelectItem value="electricidad">Electricidad</SelectItem>
                      <SelectItem value="pintura">Pintura</SelectItem>
                      <SelectItem value="carpinteria">Carpintería</SelectItem>
                      <SelectItem value="limpieza">Limpieza</SelectItem>
                      <SelectItem value="jardineria">Jardinería</SelectItem>
                      <SelectItem value="otros">Otros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe el servicio que ofreces..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="base_price">Precio base ($)</Label>
                  <Input
                    id="base_price"
                    type="number"
                    step="0.01"
                    value={formData.base_price}
                    onChange={(e) => setFormData({...formData, base_price: e.target.value})}
                    placeholder="150.00"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="duration_minutes">Duración (minutos)</Label>
                  <Input
                    id="duration_minutes"
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({...formData, duration_minutes: e.target.value})}
                    placeholder="120"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="deposit_type">Tipo de depósito</Label>
                  <Select value={formData.deposit_type} onValueChange={(value) => setFormData({...formData, deposit_type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin depósito</SelectItem>
                      <SelectItem value="fixed">Monto fijo</SelectItem>
                      <SelectItem value="percentage">Porcentaje</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.deposit_type !== 'none' && (
                  <div>
                    <Label htmlFor="deposit_amount">
                      {formData.deposit_type === 'fixed' ? 'Monto del depósito ($)' : 'Porcentaje del depósito (%)'}
                    </Label>
                    <Input
                      id="deposit_amount"
                      type="number"
                      step={formData.deposit_type === 'fixed' ? '0.01' : '1'}
                      value={formData.deposit_amount}
                      onChange={(e) => setFormData({...formData, deposit_amount: e.target.value})}
                      placeholder={formData.deposit_type === 'fixed' ? '25.00' : '30'}
                      required
                    />
                  </div>
                )}
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Creando...' : 'Crear Servicio'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Available Zones Display */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Zonas Disponibles</CardTitle>
            <CardDescription>
              Estas son las zonas donde el servicio estará disponible
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {zones.length === 0 ? (
                <p className="text-gray-500 text-sm">No hay zonas configuradas aún</p>
              ) : (
                zones.map(zone => (
                  <div key={zone.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: zone.color || '#3B82F6' }}
                      />
                      <div>
                        <div className="font-medium text-sm">{zone.name}</div>
                        <div className="text-xs text-gray-600">
                          {zone.pricing_type === 'fixed' 
                            ? `+$${zone.fixed_price} fijo`
                            : `${zone.multiplier}x multiplicador`
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {zones.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-800">
                  💡 Los precios finales se calcularán automáticamente según la zona seleccionada por el cliente.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ServiceCreationForm;
