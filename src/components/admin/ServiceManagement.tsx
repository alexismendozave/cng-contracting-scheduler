
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, Image, Tag, Percent, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Service, Zone } from "./types";

interface ServiceManagementProps {
  services: Service[];
  zones: Zone[];
  onDataRefresh: () => void;
}

const ServiceManagement = ({ services, zones, onDataRefresh }: ServiceManagementProps) => {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [categories, setCategories] = useState<string[]>(['plomeria', 'electricidad', 'pintura', 'carpinteria', 'limpieza', 'jardineria', 'otros']);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    base_price: '',
    duration_minutes: '',
    deposit_type: 'none',
    deposit_amount: '',
    discount_percentage: '',
    tags: '',
    meta_title: '',
    meta_description: '',
    slug: '',
    available_zones: 'all',
    selected_zones: [] as string[],
    gallery_images: [] as string[],
    main_image: '',
    short_description: ''
  });

  const handleCreateService = async () => {
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

      const { error } = await supabase
        .from('services')
        .insert([serviceData]);

      if (error) throw error;

      toast.success('Servicio creado exitosamente');
      setIsCreateDialogOpen(false);
      resetForm();
      onDataRefresh();
    } catch (error) {
      console.error('Error creating service:', error);
      toast.error('Error al crear el servicio');
    }
  };

  const handleUpdateService = async () => {
    if (!selectedService) return;

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

      const { error } = await supabase
        .from('services')
        .update(serviceData)
        .eq('id', selectedService.id);

      if (error) throw error;

      toast.success('Servicio actualizado exitosamente');
      setIsEditDialogOpen(false);
      setSelectedService(null);
      resetForm();
      onDataRefresh();
    } catch (error) {
      console.error('Error updating service:', error);
      toast.error('Error al actualizar el servicio');
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;

      toast.success('Servicio eliminado exitosamente');
      onDataRefresh();
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Error al eliminar el servicio');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      base_price: '',
      duration_minutes: '',
      deposit_type: 'none',
      deposit_amount: '',
      discount_percentage: '',
      tags: '',
      meta_title: '',
      meta_description: '',
      slug: '',
      available_zones: 'all',
      selected_zones: [],
      gallery_images: [],
      main_image: '',
      short_description: ''
    });
  };

  const openEditDialog = (service: Service) => {
    setSelectedService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      category: service.category || '',
      base_price: service.base_price.toString(),
      duration_minutes: service.duration_minutes?.toString() || '',
      deposit_type: service.deposit_type || 'none',
      deposit_amount: service.deposit_amount?.toString() || '',
      discount_percentage: '',
      tags: '',
      meta_title: '',
      meta_description: '',
      slug: '',
      available_zones: 'all',
      selected_zones: [],
      gallery_images: [],
      main_image: '',
      short_description: '' // service.short_description || '' - field not in database yet
    });
    setIsEditDialogOpen(true);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Servicios</h2>
          <p className="text-gray-600">Administra todos los servicios de tu negocio</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Servicio
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Servicio</DialogTitle>
              <DialogDescription>
                Completa todos los campos para crear un nuevo servicio
              </DialogDescription>
            </DialogHeader>
            <ServiceForm
              formData={formData}
              setFormData={setFormData}
              zones={zones}
              categories={categories}
              onSubmit={handleCreateService}
              onCancel={() => setIsCreateDialogOpen(false)}
              submitLabel="Crear Servicio"
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {services.map((service) => (
          <Card key={service.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{service.name}</h3>
                    <Badge variant={service.is_active ? "default" : "secondary"}>
                      {service.is_active ? "Activo" : "Inactivo"}
                    </Badge>
                    {service.category && (
                      <Badge variant="outline">{service.category}</Badge>
                    )}
                  </div>
                  <p className="text-gray-600 mb-2">{service.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="font-medium text-green-600">${service.base_price}</span>
                    {service.duration_minutes && (
                      <span>{service.duration_minutes} min</span>
                    )}
                    {service.deposit_type !== 'none' && (
                      <span>
                        Depósito: {service.deposit_type === 'percentage' ? `${service.deposit_amount}%` : `$${service.deposit_amount}`}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(service)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar servicio?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción no se puede deshacer. El servicio será eliminado permanentemente.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteService(service.id)}>
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Servicio</DialogTitle>
            <DialogDescription>
              Modifica los datos del servicio seleccionado
            </DialogDescription>
          </DialogHeader>
          <ServiceForm
            formData={formData}
            setFormData={setFormData}
            zones={zones}
            categories={categories}
            onSubmit={handleUpdateService}
            onCancel={() => setIsEditDialogOpen(false)}
            submitLabel="Actualizar Servicio"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface ServiceFormProps {
  formData: any;
  setFormData: (data: any) => void;
  zones: Zone[];
  categories: string[];
  onSubmit: () => void;
  onCancel: () => void;
  submitLabel: string;
}

const ServiceForm = ({ formData, setFormData, zones, categories, onSubmit, onCancel, submitLabel }: ServiceFormProps) => {
  return (
    <Tabs defaultValue="basic" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="basic">Básico</TabsTrigger>
        <TabsTrigger value="pricing">Precios</TabsTrigger>
        <TabsTrigger value="zones">Zonas</TabsTrigger>
        <TabsTrigger value="media">Imágenes</TabsTrigger>
        <TabsTrigger value="seo">SEO</TabsTrigger>
      </TabsList>

      <TabsContent value="basic" className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Nombre del servicio *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
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
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="short_description">Descripción corta</Label>
          <Input
            id="short_description"
            value={formData.short_description || ''}
            onChange={(e) => setFormData({...formData, short_description: e.target.value})}
            placeholder="Descripción breve del servicio"
          />
        </div>

        <div>
          <Label htmlFor="description">Descripción completa</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            rows={4}
            placeholder="Descripción detallada del servicio"
          />
        </div>

        <div>
          <Label htmlFor="tags">Etiquetas (separadas por comas)</Label>
          <Input
            id="tags"
            value={formData.tags}
            onChange={(e) => setFormData({...formData, tags: e.target.value})}
            placeholder="etiqueta1, etiqueta2, etiqueta3"
          />
        </div>

        <div>
          <Label htmlFor="duration">Duración (minutos)</Label>
          <Input
            id="duration"
            type="number"
            value={formData.duration_minutes}
            onChange={(e) => setFormData({...formData, duration_minutes: e.target.value})}
          />
        </div>
      </TabsContent>

      <TabsContent value="pricing" className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="base_price">Precio base ($) *</Label>
            <Input
              id="base_price"
              type="number"
              step="0.01"
              value={formData.base_price}
              onChange={(e) => setFormData({...formData, base_price: e.target.value})}
              required
            />
          </div>
          <div>
            <Label htmlFor="discount">Descuento (%)</Label>
            <Input
              id="discount"
              type="number"
              step="0.01"
              value={formData.discount_percentage}
              onChange={(e) => setFormData({...formData, discount_percentage: e.target.value})}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Tipo de depósito</Label>
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
              <Label>
                {formData.deposit_type === 'fixed' ? 'Monto del depósito ($)' : 'Porcentaje del depósito (%)'}
              </Label>
              <Input
                type="number"
                step={formData.deposit_type === 'fixed' ? '0.01' : '1'}
                value={formData.deposit_amount}
                onChange={(e) => setFormData({...formData, deposit_amount: e.target.value})}
              />
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="zones" className="space-y-4">
        <div>
          <Label>Disponibilidad por zonas</Label>
          <Select value={formData.available_zones} onValueChange={(value) => setFormData({...formData, available_zones: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las zonas</SelectItem>
              <SelectItem value="specific">Zonas específicas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {formData.available_zones === 'specific' && (
          <div>
            <Label>Seleccionar zonas específicas</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {zones.map(zone => (
                <div key={zone.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={zone.id}
                    checked={formData.selected_zones.includes(zone.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setFormData({
                          ...formData,
                          selected_zones: [...formData.selected_zones, zone.id]
                        });
                      } else {
                        setFormData({
                          ...formData,
                          selected_zones: formData.selected_zones.filter((id: string) => id !== zone.id)
                        });
                      }
                    }}
                  />
                  <Label htmlFor={zone.id} className="text-sm">{zone.name}</Label>
                </div>
              ))}
            </div>
          </div>
        )}
      </TabsContent>

      <TabsContent value="media" className="space-y-4">
        <div>
          <Label>Imagen principal</Label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input 
              type="file" 
              id="main-image" 
              accept="image/*" 
              className="hidden" 
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setFormData({...formData, main_image: file.name});
                  // Here you would handle the upload
                }
              }}
            />
            <label htmlFor="main-image" className="cursor-pointer">
              <Image className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">Haz clic para subir imagen principal</p>
              {formData.main_image && <p className="text-xs text-green-600 mt-1">{formData.main_image}</p>}
            </label>
          </div>
        </div>

        <div>
          <Label>Galería de imágenes</Label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input 
              type="file" 
              id="gallery-images" 
              accept="image/*" 
              multiple 
              className="hidden" 
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                if (files.length > 0) {
                  setFormData({...formData, gallery_images: files.map(f => f.name)});
                  // Here you would handle the upload
                }
              }}
            />
            <label htmlFor="gallery-images" className="cursor-pointer">
              <Image className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">Haz clic para subir imágenes adicionales</p>
              {formData.gallery_images.length > 0 && (
                <p className="text-xs text-green-600 mt-1">{formData.gallery_images.length} imagen(es) seleccionada(s)</p>
              )}
            </label>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="seo" className="space-y-4">
        <div>
          <Label htmlFor="slug">URL amigable (slug)</Label>
          <Input
            id="slug"
            value={formData.slug}
            onChange={(e) => setFormData({...formData, slug: e.target.value})}
            placeholder="mi-servicio-ejemplo"
          />
        </div>

        <div>
          <Label htmlFor="meta_title">Título SEO</Label>
          <Input
            id="meta_title"
            value={formData.meta_title}
            onChange={(e) => setFormData({...formData, meta_title: e.target.value})}
            placeholder="Título para motores de búsqueda"
          />
        </div>

        <div>
          <Label htmlFor="meta_description">Descripción SEO</Label>
          <Textarea
            id="meta_description"
            value={formData.meta_description}
            onChange={(e) => setFormData({...formData, meta_description: e.target.value})}
            placeholder="Descripción para motores de búsqueda"
            rows={3}
          />
        </div>
      </TabsContent>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={onSubmit}>
          {submitLabel}
        </Button>
      </div>
    </Tabs>
  );
};

export default ServiceManagement;
