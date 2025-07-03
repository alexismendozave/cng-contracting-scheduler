import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Edit, Trash2 } from "lucide-react";
import ServiceCreationForm from "./ServiceCreationForm";

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  base_price: number;
  is_active: boolean;
}

interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
}

export default function ServicesManagement() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: servicesData } = await supabase
        .from('services')
        .select('*')
        .order('name');
      
      // Mock categories for now - would need to create categories table
      const mockCategories = [
        { id: '1', name: 'Limpieza', description: 'Servicios de limpieza general', is_active: true },
        { id: '2', name: 'Mantenimiento', description: 'Servicios de mantenimiento', is_active: true },
        { id: '3', name: 'Jardinería', description: 'Servicios de jardinería', is_active: true },
      ];

      setServices(servicesData || []);
      setCategories(mockCategories);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este servicio?')) return;
    
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Servicio eliminado');
      fetchData();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al eliminar servicio');
    }
  };

  const ServiceCard = ({ service }: { service: Service }) => (
    <Card className="relative">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{service.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{service.category}</p>
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => {
                setEditingService(service);
                setShowServiceForm(true);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="destructive"
              onClick={() => handleDeleteService(service.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-3">{service.description}</p>
        <div className="flex justify-between items-center">
          <span className="font-semibold">${service.base_price}</span>
          <span className={`px-2 py-1 rounded-full text-xs ${
            service.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {service.is_active ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      </CardContent>
    </Card>
  );

  const CategoryCard = ({ category }: { category: ServiceCategory }) => (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{category.name}</CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              <Edit className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm">{category.description}</p>
      </CardContent>
    </Card>
  );

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
          <h1 className="text-3xl font-bold">Gestión de Servicios</h1>
          <p className="text-muted-foreground">Administra servicios y categorías</p>
        </div>
      </div>

      <Tabs defaultValue="services" className="w-full">
        <TabsList>
          <TabsTrigger value="services">Servicios</TabsTrigger>
          <TabsTrigger value="categories">Categorías</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Servicios Disponibles</h2>
            <Button onClick={() => {
              setEditingService(null);
              setShowServiceForm(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Servicio
            </Button>
          </div>
          
          {showServiceForm && (
            <ServiceCreationForm 
              editingService={editingService}
              onClose={() => {
                setShowServiceForm(false);
                setEditingService(null);
              }}
              onSuccess={() => {
                setShowServiceForm(false);
                setEditingService(null);
                fetchData();
              }}
            />
          )}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Categorías de Servicios</h2>
            <Button onClick={() => setShowCategoryForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Categoría
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}