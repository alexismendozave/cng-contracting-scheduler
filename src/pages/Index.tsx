
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Star, Clock, Wrench, Zap, Paintbrush, Droplets, Hammer, Home } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const serviceCategories = [
    { id: "all", name: "Todos", icon: Home, color: "bg-blue-500" },
    { id: "plumbing", name: "Plomería", icon: Droplets, color: "bg-blue-600" },
    { id: "electrical", name: "Electricidad", icon: Zap, color: "bg-yellow-500" },
    { id: "painting", name: "Pintura", icon: Paintbrush, color: "bg-green-500" },
    { id: "general", name: "General", icon: Hammer, color: "bg-gray-600" },
  ];

  // Mock services data (estos vendrían de WooCommerce API)
  const services = [
    {
      id: 1,
      woocommerce_id: 123,
      name: "Reparación de Plomería",
      category: "plumbing",
      description: "Reparación de fugas, instalación de grifos, destapado de tuberías",
      basePrice: 89,
      duration: "1-2 horas",
      isPackage: false,
      rating: 4.9,
      reviews: 127
    },
    {
      id: 2,
      woocommerce_id: 124,
      name: "Instalación Eléctrica",
      category: "electrical",
      description: "Instalación de tomacorrientes, luces, reparación de circuitos",
      basePrice: 95,
      duration: "1-3 horas",
      isPackage: false,
      rating: 4.8,
      reviews: 89
    },
    {
      id: 3,
      woocommerce_id: 125,
      name: "Pintura Interior",
      category: "painting",
      description: "Pintura de habitaciones, acabados profesionales",
      basePrice: 150,
      duration: "4-8 horas",
      isPackage: false,
      rating: 4.9,
      reviews: 156
    },
    {
      id: 4,
      woocommerce_id: 126,
      name: "Paquete Renovación Baño",
      category: "plumbing",
      description: "Plomería + Electricidad + Pintura para baño completo",
      basePrice: 299,
      duration: "1-2 días",
      isPackage: true,
      rating: 5.0,
      reviews: 45
    },
    {
      id: 5,
      woocommerce_id: 127,
      name: "Reparaciones Generales",
      category: "general",
      description: "Montaje de muebles, reparaciones menores, mantenimiento",
      basePrice: 75,
      duration: "1-2 horas",
      isPackage: false,
      rating: 4.7,
      reviews: 203
    }
  ];

  const filteredServices = selectedCategory === "all" 
    ? services 
    : services.filter(service => service.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Wrench className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">CNG Contracting</h1>
                <p className="text-sm text-gray-600">Professional Handyman Services</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Link to="/admin">Admin</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Servicios de <span className="text-blue-600">Handyman</span> Profesionales
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Reparaciones y servicios a domicilio en toda el área metropolitana de Canadá. 
            Profesionales certificados, precios transparentes, garantía incluida.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Proceso de Reserva Simple</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p>✓ Paso 1: Elige tu servicio</p>
              <p>✓ Paso 2: Ver detalles y continuar</p>
              <p>✓ Paso 3: Selecciona tu zona</p>
              <p>✓ Paso 4: Elige fecha y hora</p>
              <p>✓ Paso 5: Datos y pago seguro</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Nuestros Servicios</h2>
            <p className="text-xl text-gray-600">Servicios profesionales para tu hogar</p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {serviceCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 ${
                    selectedCategory === category.id 
                      ? "bg-blue-600 hover:bg-blue-700" 
                      : ""
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {category.name}
                </Button>
              );
            })}
          </div>

          {/* Services Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map((service) => (
              <Card key={service.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    {service.isPackage && (
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                        Paquete
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium ml-1">{service.rating}</span>
                    </div>
                    <span className="text-sm text-gray-500">({service.reviews} reseñas)</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    {service.description}
                  </CardDescription>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-1" />
                      {service.duration}
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-gray-500">Desde</span>
                      <div className="text-2xl font-bold text-blue-600">
                        ${service.basePrice}
                      </div>
                      <span className="text-xs text-gray-500">*Precio varía por zona</span>
                    </div>
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700" asChild>
                    <Link to={`/booking/${service.id}`}>
                      Iniciar Reserva
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Wrench className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">CNG Contracting</span>
              </div>
              <p className="text-gray-400">
                Servicios profesionales de handyman en Canadá. Calidad garantizada.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Servicios</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Plomería</li>
                <li>Electricidad</li>
                <li>Pintura</li>
                <li>Reparaciones Generales</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 CNG Contracting. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
