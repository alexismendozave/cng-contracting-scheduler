import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ServiceCard } from "@/components/ServiceCard";
import { 
  Wrench, 
  Lightbulb, 
  Paintbrush2, 
  Droplets, 
  Phone, 
  Mail, 
  MapPin,
  Star,
  Clock,
  Shield,
  User,
  LogIn
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user, profile, signOut } = useAuth();

  const services = [
    {
      id: 1,
      name: "Reparación de Plomería",
      description: "Solucionamos todo tipo de problemas de plomería, desde fugas hasta instalaciones completas.",
      icon: <Droplets className="h-6 w-6 text-blue-500" />,
      price: "Desde $89",
      rating: 4.5,
      reviews: 120
    },
    {
      id: 2,
      name: "Instalación Eléctrica",
      description: "Instalamos y reparamos sistemas eléctricos para hogares y negocios.",
      icon: <Lightbulb className="h-6 w-6 text-yellow-500" />,
      price: "Desde $95",
      rating: 4.8,
      reviews: 150
    },
    {
      id: 3,
      name: "Pintura Interior",
      description: "Transformamos tus espacios con servicios de pintura de alta calidad.",
      icon: <Paintbrush2 className="h-6 w-6 text-green-500" />,
      price: "Desde $150",
      rating: 4.2,
      reviews: 90
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 text-white p-2 rounded-lg">
                <Wrench className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">CNG Contracting</h1>
                <p className="text-gray-600 text-sm">Servicios profesionales a domicilio</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <Link to={profile?.role === 'client' ? '/dashboard' : '/admin'}>
                    <Button variant="outline" size="sm">
                      <User className="h-4 w-4 mr-2" />
                      Mi Panel
                    </Button>
                  </Link>
                  <Button onClick={signOut} variant="outline" size="sm">
                    Cerrar Sesión
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="outline" size="sm">
                      <LogIn className="h-4 w-4 mr-2" />
                      Iniciar Sesión
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      Registrarse
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gray-100 py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Servicios Profesionales para tu Hogar
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                Encuentra los mejores profesionales para realizar tus proyectos y reparaciones en el hogar.
              </p>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Explorar Servicios
              </Button>
            </div>
            <div>
              <img
                src="https://images.unsplash.com/photo-1617175865449-f9269941afa7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                alt="Servicios para el hogar"
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Nuestros Servicios
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="bg-blue-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            ¿Por qué elegirnos?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Professional Team */}
            <div className="text-center">
              <Wrench className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Equipo Profesional
              </h3>
              <p className="text-gray-700">
                Contamos con un equipo de expertos altamente capacitados y
                certificados.
              </p>
            </div>

            {/* Quality Guarantee */}
            <div className="text-center">
              <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Garantía de Calidad
              </h3>
              <p className="text-gray-700">
                Ofrecemos garantía en todos nuestros servicios para tu
                tranquilidad.
              </p>
            </div>

            {/* Customer Satisfaction */}
            <div className="text-center">
              <Star className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Satisfacción del Cliente
              </h3>
              <p className="text-gray-700">
                Nuestro principal objetivo es superar las expectativas de
                nuestros clientes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Contáctanos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact Form */}
            <div>
              <p className="text-gray-700 mb-4">
                ¿Tienes alguna pregunta o necesitas un presupuesto? Contáctanos
                y te atenderemos con gusto.
              </p>
              <form className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Nombre
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="Tu nombre"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="Tu email"
                  />
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Mensaje
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="Escribe tu mensaje aquí..."
                  />
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Enviar Mensaje
                </Button>
              </form>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Información de Contacto
              </h3>
              <div className="space-y-2">
                <div className="flex items-center text-gray-700">
                  <Phone className="h-5 w-5 mr-2 text-blue-500" />
                  +52 55 1234 5678
                </div>
                <div className="flex items-center text-gray-700">
                  <Mail className="h-5 w-5 mr-2 text-blue-500" />
                  info@cngcontracting.com
                </div>
                <div className="flex items-center text-gray-700">
                  <MapPin className="h-5 w-5 mr-2 text-blue-500" />
                  Av. Principal #123, Ciudad de México
                </div>
                <div className="flex items-center text-gray-700">
                  <Clock className="h-5 w-5 mr-2 text-blue-500" />
                  Lunes a Viernes: 9am - 6pm
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-200 py-4">
        <div className="container mx-auto px-4 text-center text-gray-600">
          &copy; 2024 CNG Contracting. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
};

export default Index;
