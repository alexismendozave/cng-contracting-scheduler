import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, User, Mail, Phone } from "lucide-react";
import { toast } from "sonner";

interface Handyman {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  specialties?: string[];
  is_active: boolean;
  created_at: string;
}

export const HandymenManagement = () => {
  const [handymen, setHandymen] = useState<Handyman[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingHandyman, setEditingHandyman] = useState<Handyman | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    specialties: ""
  });

  useEffect(() => {
    fetchHandymen();
  }, []);

  const fetchHandymen = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('handymen')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHandymen(data || []);
    } catch (error) {
      console.error('Error fetching handymen:', error);
      toast.error('Error al cargar técnicos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    try {
      const handymanData = {
        name: formData.name.trim(),
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        specialties: formData.specialties.trim() 
          ? formData.specialties.split(',').map(s => s.trim()) 
          : null,
        is_active: true
      };

      if (editingHandyman) {
        // Update existing handyman
        const { error } = await supabase
          .from('handymen')
          .update(handymanData)
          .eq('id', editingHandyman.id);

        if (error) throw error;
        toast.success('Técnico actualizado exitosamente');
      } else {
        // Create new handyman
        const { error } = await supabase
          .from('handymen')
          .insert(handymanData);

        if (error) throw error;
        toast.success('Técnico creado exitosamente');
      }

      setDialogOpen(false);
      setEditingHandyman(null);
      setFormData({ name: "", email: "", phone: "", specialties: "" });
      fetchHandymen();
    } catch (error) {
      console.error('Error saving handyman:', error);
      toast.error('Error al guardar técnico');
    }
  };

  const handleEdit = (handyman: Handyman) => {
    setEditingHandyman(handyman);
    setFormData({
      name: handyman.name,
      email: handyman.email || "",
      phone: handyman.phone || "",
      specialties: handyman.specialties?.join(', ') || ""
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este técnico?')) return;

    try {
      const { error } = await supabase
        .from('handymen')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Técnico eliminado exitosamente');
      fetchHandymen();
    } catch (error) {
      console.error('Error deleting handyman:', error);
      toast.error('Error al eliminar técnico');
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('handymen')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      toast.success(`Técnico ${!currentStatus ? 'activado' : 'desactivado'} exitosamente`);
      fetchHandymen();
    } catch (error) {
      console.error('Error updating handyman status:', error);
      toast.error('Error al actualizar estado del técnico');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Técnicos</h1>
          <p className="text-muted-foreground">Administra tu equipo de técnicos</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Añadir Técnico
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingHandyman ? 'Editar Técnico' : 'Nuevo Técnico'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nombre del técnico"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@ejemplo.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <Label htmlFor="specialties">Especialidades</Label>
                <Input
                  id="specialties"
                  value={formData.specialties}
                  onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                  placeholder="Plomería, Electricidad, Carpintería (separadas por comas)"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setDialogOpen(false);
                    setEditingHandyman(null);
                    setFormData({ name: "", email: "", phone: "", specialties: "" });
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingHandyman ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {handymen.map((handyman) => (
          <Card key={handyman.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{handyman.name}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      {handyman.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {handyman.email}
                        </div>
                      )}
                      {handyman.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {handyman.phone}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={handyman.is_active ? "default" : "secondary"}
                    className={handyman.is_active ? "bg-green-100 text-green-800" : ""}
                  >
                    {handyman.is_active ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {handyman.specialties && handyman.specialties.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Especialidades:</p>
                  <div className="flex flex-wrap gap-2">
                    {handyman.specialties.map((specialty, index) => (
                      <Badge key={index} variant="outline">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleEdit(handyman)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => toggleActive(handyman.id, handyman.is_active)}
                >
                  {handyman.is_active ? 'Desactivar' : 'Activar'}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleDelete(handyman.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Eliminar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {handymen.length === 0 && (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">No hay técnicos registrados</p>
            <p className="text-sm text-muted-foreground mt-1">
              Añade técnicos para comenzar a gestionar las reservas
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};