import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, Building, Mail, Phone, MapPin, Globe, Image } from "lucide-react";

interface CompanySettings {
  company_name: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  logo_url: string;
  favicon_url: string;
  social_links: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
}

export default function CompanyManagement() {
  const [settings, setSettings] = useState<CompanySettings>({
    company_name: "",
    email: "",
    phone: "",
    address: "",
    website: "",
    logo_url: "",
    favicon_url: "",
    social_links: {}
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('general_settings')
        .select('*')
        .in('setting_key', [
          'company_name', 'company_email', 'company_phone', 
          'company_address', 'company_website', 'company_logo',
          'company_favicon', 'social_links'
        ]);

      if (data) {
        const settingsMap: any = {};
        data.forEach(item => {
          switch(item.setting_key) {
            case 'company_name':
              settingsMap.company_name = item.setting_value;
              break;
            case 'company_email':
              settingsMap.email = item.setting_value;
              break;
            case 'company_phone':
              settingsMap.phone = item.setting_value;
              break;
            case 'company_address':
              settingsMap.address = item.setting_value;
              break;
            case 'company_website':
              settingsMap.website = item.setting_value;
              break;
            case 'company_logo':
              settingsMap.logo_url = item.setting_value;
              break;
            case 'company_favicon':
              settingsMap.favicon_url = item.setting_value;
              break;
            case 'social_links':
              settingsMap.social_links = item.setting_value || {};
              break;
          }
        });
        setSettings(prev => ({ ...prev, ...settingsMap }));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Error al cargar configuración');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const settingsToSave = [
        { setting_key: 'company_name', setting_value: settings.company_name },
        { setting_key: 'company_email', setting_value: settings.email },
        { setting_key: 'company_phone', setting_value: settings.phone },
        { setting_key: 'company_address', setting_value: settings.address },
        { setting_key: 'company_website', setting_value: settings.website },
        { setting_key: 'company_logo', setting_value: settings.logo_url },
        { setting_key: 'company_favicon', setting_value: settings.favicon_url },
        { setting_key: 'social_links', setting_value: settings.social_links },
      ];

      for (const setting of settingsToSave) {
        await supabase
          .from('general_settings')
          .upsert(setting, { onConflict: 'setting_key' });
      }

      toast.success('Configuración guardada exitosamente');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Error al guardar configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof CompanySettings, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSocialLinkChange = (platform: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      social_links: { ...prev.social_links, [platform]: value }
    }));
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
          <h1 className="text-3xl font-bold">Configuración de Compañía</h1>
          <p className="text-muted-foreground">Gestiona la información de tu empresa</p>
        </div>
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Información Básica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="company_name">Nombre de la Empresa</Label>
              <Input
                id="company_name"
                value={settings.company_name}
                onChange={(e) => handleInputChange('company_name', e.target.value)}
                placeholder="Mi Empresa S.A."
              />
            </div>
            
            <div>
              <Label htmlFor="email">Correo Electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  className="pl-10"
                  value={settings.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="contacto@miempresa.com"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  className="pl-10"
                  value={settings.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Dirección</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea
                  id="address"
                  className="pl-10"
                  value={settings.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="123 Calle Principal, Ciudad, País"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="website">Sitio Web</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="website"
                  className="pl-10"
                  value={settings.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://www.miempresa.com"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Recursos Visuales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="logo_url">URL del Logotipo</Label>
              <div className="space-y-2">
                <Input
                  id="logo_url"
                  value={settings.logo_url}
                  onChange={(e) => handleInputChange('logo_url', e.target.value)}
                  placeholder="https://ejemplo.com/logo.png"
                />
                <Button variant="outline" size="sm" className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Subir Logotipo
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="favicon_url">URL del Favicon</Label>
              <div className="space-y-2">
                <Input
                  id="favicon_url"
                  value={settings.favicon_url}
                  onChange={(e) => handleInputChange('favicon_url', e.target.value)}
                  placeholder="https://ejemplo.com/favicon.ico"
                />
                <Button variant="outline" size="sm" className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Subir Favicon
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Redes Sociales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  value={settings.social_links.facebook || ''}
                  onChange={(e) => handleSocialLinkChange('facebook', e.target.value)}
                  placeholder="https://facebook.com/miempresa"
                />
              </div>
              
              <div>
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  value={settings.social_links.instagram || ''}
                  onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                  placeholder="https://instagram.com/miempresa"
                />
              </div>
              
              <div>
                <Label htmlFor="twitter">Twitter</Label>
                <Input
                  id="twitter"
                  value={settings.social_links.twitter || ''}
                  onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                  placeholder="https://twitter.com/miempresa"
                />
              </div>
              
              <div>
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  value={settings.social_links.linkedin || ''}
                  onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/company/miempresa"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}