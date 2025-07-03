
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Clock } from "lucide-react";
import { Link } from "react-router-dom";

interface ServiceCardProps {
  service: {
    id: number;
    name: string;
    description: string;
    basePrice: number;
    duration: string;
    isPackage: boolean;
    rating: number;
    reviews: number;
  };
}

const ServiceCard = ({ service }: ServiceCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
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
          </div>
        </div>
        <Button className="w-full bg-blue-600 hover:bg-blue-700" asChild>
          <Link to={`/booking/${service.id}`}>
            Reservar Ahora
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;
