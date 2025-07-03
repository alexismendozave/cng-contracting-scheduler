import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  base_price: number;
  is_active: boolean;
}

interface ServiceCreationFormProps {
  editingService?: Service | null;
  onClose: () => void;
  onSuccess: () => void;
}

const ServiceCreationForm = ({ editingService, onClose, onSuccess }: ServiceCreationFormProps) => {
  const [formData, setFormData] = useState({
    name: editingService?.name || '',
    description: editingService?.description || '',
    category: editingService?.category || '',
    base_price: editingService?.base_price?.toString() || '',
    duration_minutes: '',
    deposit_type: 'none',
    deposit_amount: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const serviceData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        base_price: parseFloat(formData.base_price),
        duration_minutes: parseInt(formData.duration_minutes) || null,
        deposit_type: formData.deposit_type,
        deposit_amount: formData.deposit_type !== 'none' ? parseFloat(formData.deposit_amount) : 0
      };

      if (editingService) {
        const { error } = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', editingService.id);
        if (error) throw error;
        toast.success('Servicio actualizado exitosamente');
      } else {
        const { error } = await supabase
          .from('services')
          .insert([serviceData]);
        if (error) throw error;
        toast.success('Servicio creado exitosamente');
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error:', error);
      toast.error(editingService ? 'Error al actualizar servicio' : 'Error al crear servicio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{editingService ? 'Editar Servicio' : 'Crear Nuevo Servicio'}</DialogTitle>
        </DialogHeader>
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

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : (editingService ? 'Actualizar' : 'Crear')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceCreationForm;