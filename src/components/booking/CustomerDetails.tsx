
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface CustomerData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  customerType: 'person' | 'company';
  companyRegistration?: string;
  billingAddress: {
    address: string;
    country: string;
    province: string;
    city: string;
  };
}

interface CustomerDetailsProps {
  initialData?: CustomerData;
  defaultAddress?: string;
  onComplete: (data: CustomerData) => void;
}

const CustomerDetails = ({ initialData, defaultAddress, onComplete }: CustomerDetailsProps) => {
  const [formData, setFormData] = useState<CustomerData>(initialData || {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    customerType: 'person',
    companyRegistration: '',
    billingAddress: {
      address: defaultAddress || '',
      country: 'Canada',
      province: '',
      city: ''
    }
  });

  const [useSameAddress, setUseSameAddress] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    if (formData.customerType === 'company' && !formData.companyRegistration) {
      toast.error('Por favor ingresa el registro mercantil para empresas');
      return;
    }

    onComplete(formData);
  };

  const handleInputChange = (field: keyof CustomerData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBillingAddressChange = (field: keyof CustomerData['billingAddress'], value: string) => {
    setFormData(prev => ({
      ...prev,
      billingAddress: {
        ...prev.billingAddress,
        [field]: value
      }
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información Personal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">Nombre *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Apellido *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Correo electrónico *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Teléfono *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label>Tipo de cliente</Label>
            <RadioGroup
              value={formData.customerType}
              onValueChange={(value) => handleInputChange('customerType', value as 'person' | 'company')}
              className="flex gap-6 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="person" id="person" />
                <Label htmlFor="person">Persona</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="company" id="company" />
                <Label htmlFor="company">Empresa</Label>
              </div>
            </RadioGroup>
          </div>

          {formData.customerType === 'company' && (
            <div>
              <Label htmlFor="companyRegistration">Registro Mercantil</Label>
              <Input
                id="companyRegistration"
                value={formData.companyRegistration || ''}
                onChange={(e) => handleInputChange('companyRegistration', e.target.value)}
                placeholder="Opcional"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Datos de Facturación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="useSameAddress"
              checked={useSameAddress}
              onCheckedChange={(checked) => {
                setUseSameAddress(!!checked);
                if (checked && defaultAddress) {
                  handleBillingAddressChange('address', defaultAddress);
                }
              }}
            />
            <Label htmlFor="useSameAddress">
              Usar la misma dirección del servicio
            </Label>
          </div>

          <div>
            <Label htmlFor="billingAddress">Dirección de facturación *</Label>
            <Textarea
              id="billingAddress"
              value={formData.billingAddress.address}
              onChange={(e) => handleBillingAddressChange('address', e.target.value)}
              placeholder="Calle, número, código postal..."
              disabled={useSameAddress}
              required
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="country">País *</Label>
              <Input
                id="country"
                value={formData.billingAddress.country}
                onChange={(e) => handleBillingAddressChange('country', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="province">Provincia *</Label>
              <Input
                id="province"
                value={formData.billingAddress.province}
                onChange={(e) => handleBillingAddressChange('province', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="city">Ciudad *</Label>
              <Input
                id="city"
                value={formData.billingAddress.city}
                onChange={(e) => handleBillingAddressChange('city', e.target.value)}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit">
          Continuar al pago
        </Button>
      </div>
    </form>
  );
};

export default CustomerDetails;
