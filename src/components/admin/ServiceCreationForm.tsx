
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ServiceCreationFormProps {
  onServiceCreated: () => void;
}

const ServiceCreationForm = ({ onServiceCreated }: ServiceCreationFormProps) => {
  const [newService, setNewService] = useState({
    name: '',
    category: '',
    description: '',
    base_price: '',
    duration_minutes: '',
    deposit_type: 'none',
    deposit_amount: ''
  });

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase
      .from('services')
      .insert([{
        name: newService.name,
        category: newService.category,
        description: newService.description,
        base_price: parseFloat(newService.base_price),
        duration_minutes: parseInt(newService.duration_minutes) || null,
        deposit_type: newService.deposit_type,
        deposit_amount: parseFloat(newService.deposit_amount) || 0
      }]);

    if (error) {
      toast.error('Error al crear servicio: ' + error.message);
    } else {
      toast.success('Servicio creado exitosamente');
      setNewService({
        name: '',
        category: '',
        description: '',
        base_price: '',
        duration_minutes: '',
        deposit_type: 'none',
        deposit_amount: ''
      });
      onServiceCreated();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crear Nuevo Servicio</CardTitle>
        <CardDescription>Agrega servicios desde el panel</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreateService} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="serviceName">Nombre del Servicio</Label>
              <Input
                id="serviceName"
                value={newService.name}
                onChange={(e) => setNewService({...newService, name: e.target.value})}
                placeholder="Reparación de Plomería"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="serviceCategory">Categoría</Label>
              <Input
                id="serviceCategory"
                value={newService.category}
                onChange={(e) => setNewService({...newService, category: e.target.value})}
                placeholder="Plomería"
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="serviceDescription">Descripción</Label>
            <Textarea
              id="serviceDescription"
              value={newService.description}
              onChange={(e) => setNewService({...newService, description: e.target.value})}
              placeholder="Descripción del servicio..."
            />
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="servicePrice">Precio Base ($)</Label>
              <Input
                id="servicePrice"
                type="number"
                step="0.01"
                value={newService.base_price}
                onChange={(e) => setNewService({...newService, base_price: e.target.value})}
                placeholder="89.99"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="serviceDuration">Duración (minutos)</Label>
              <Input
                id="serviceDuration"
                type="number"
                value={newService.duration_minutes}
                onChange={(e) => setNewService({...newService, duration_minutes: e.target.value})}
                placeholder="120"
              />
            </div>

            <div>
              <Label htmlFor="depositType">Tipo de Depósito</Label>
              <Select value={newService.deposit_type} onValueChange={(value) => setNewService({...newService, deposit_type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin depósito</SelectItem>
                  <SelectItem value="fixed">Monto fijo</SelectItem>
                  <SelectItem value="percentage">Porcentaje</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {newService.deposit_type !== 'none' && (
            <div>
              <Label htmlFor="depositAmount">
                {newService.deposit_type === 'percentage' ? 'Porcentaje de Depósito (%)' : 'Monto de Depósito ($)'}
              </Label>
              <Input
                id="depositAmount"
                type="number"
                step="0.01"
                value={newService.deposit_amount}
                onChange={(e) => setNewService({...newService, deposit_amount: e.target.value})}
                placeholder={newService.deposit_type === 'percentage' ? '30' : '25.00'}
              />
            </div>
          )}
          
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Crear Servicio
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ServiceCreationForm;
