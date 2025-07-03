import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Palette, Type, Monitor, Smartphone } from "lucide-react";

const fontOptions = [
  { value: 'inter', label: 'Inter', class: 'font-sans' },
  { value: 'poppins', label: 'Poppins', class: 'font-sans' },
  { value: 'roboto', label: 'Roboto', class: 'font-sans' },
  { value: 'open-sans', label: 'Open Sans', class: 'font-sans' },
  { value: 'lato', label: 'Lato', class: 'font-sans' },
  { value: 'montserrat', label: 'Montserrat', class: 'font-sans' },
  { value: 'raleway', label: 'Raleway', class: 'font-sans' },
  { value: 'source-sans', label: 'Source Sans Pro', class: 'font-sans' },
];

const colorPalettes = [
  {
    name: 'Azul Profesional',
    primary: '#2563eb',
    secondary: '#1e40af',
    accent: '#3b82f6',
    background: '#ffffff',
    foreground: '#1f2937',
    preview: 'bg-gradient-to-r from-blue-600 to-blue-700'
  },
  {
    name: 'Verde Natura',
    primary: '#059669',
    secondary: '#047857',
    accent: '#10b981',
    background: '#ffffff',
    foreground: '#1f2937',
    preview: 'bg-gradient-to-r from-green-600 to-green-700'
  },
  {
    name: 'Púrpura Elegante',
    primary: '#7c3aed',
    secondary: '#6d28d9',
    accent: '#8b5cf6',
    background: '#ffffff',
    foreground: '#1f2937',
    preview: 'bg-gradient-to-r from-purple-600 to-purple-700'
  },
  {
    name: 'Naranja Vibrante',
    primary: '#ea580c',
    secondary: '#dc2626',
    accent: '#f97316',
    background: '#ffffff',
    foreground: '#1f2937',
    preview: 'bg-gradient-to-r from-orange-600 to-red-600'
  },
  {
    name: 'Rosa Moderno',
    primary: '#db2777',
    secondary: '#be185d',
    accent: '#ec4899',
    background: '#ffffff',
    foreground: '#1f2937',
    preview: 'bg-gradient-to-r from-pink-600 to-pink-700'
  },
  {
    name: 'Gris Minimalista',
    primary: '#374151',
    secondary: '#1f2937',
    accent: '#6b7280',
    background: '#ffffff',
    foreground: '#111827',
    preview: 'bg-gradient-to-r from-gray-600 to-gray-700'
  }
];

export default function CustomizationManagement() {
  const [settings, setSettings] = useState({
    primary_font: 'inter',
    secondary_font: 'inter',
    primary_color: '#2563eb',
    secondary_color: '#1e40af',
    accent_color: '#3b82f6',
    background_color: '#ffffff',
    text_color: '#1f2937',
    border_radius: '8',
    color_palette: 'blue'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedPalette, setSelectedPalette] = useState<any>(null);

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
          'primary_font', 'secondary_font', 'primary_color', 
          'secondary_color', 'accent_color', 'background_color',
          'text_color', 'border_radius', 'color_palette'
        ]);

      if (data) {
        const settingsMap: any = {};
        data.forEach(item => {
          settingsMap[item.setting_key] = item.setting_value;
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
      const settingsToSave = Object.entries(settings).map(([key, value]) => ({
        setting_key: key,
        setting_value: value
      }));

      for (const setting of settingsToSave) {
        await supabase
          .from('general_settings')
          .upsert(setting, { onConflict: 'setting_key' });
      }

      toast.success('Configuración guardada exitosamente');
      
      // Apply styles to the page
      applyCustomStyles();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Error al guardar configuración');
    } finally {
      setSaving(false);
    }
  };

  const applyCustomStyles = () => {
    const root = document.documentElement;
    
    // Convert hex to HSL for CSS variables
    const hexToHsl = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h, s, l = (max + min) / 2;

      if (max === min) {
        h = s = 0;
      } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
          default: h = 0;
        }
        h /= 6;
      }

      return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    };

    root.style.setProperty('--primary', hexToHsl(settings.primary_color));
    root.style.setProperty('--secondary', hexToHsl(settings.secondary_color));
    root.style.setProperty('--accent', hexToHsl(settings.accent_color));
    root.style.setProperty('--background', hexToHsl(settings.background_color));
    root.style.setProperty('--foreground', hexToHsl(settings.text_color));
    root.style.setProperty('--radius', `${settings.border_radius}px`);
  };

  const handlePaletteSelect = (palette: any) => {
    setSelectedPalette(palette);
    setSettings(prev => ({
      ...prev,
      primary_color: palette.primary,
      secondary_color: palette.secondary,
      accent_color: palette.accent,
      background_color: palette.background,
      text_color: palette.foreground,
      color_palette: palette.name.toLowerCase().replace(/\s+/g, '-')
    }));
  };

  const PreviewCard = () => (
    <Card className="w-full">
      <CardHeader className="text-center" style={{ 
        backgroundColor: settings.primary_color,
        color: settings.background_color
      }}>
        <CardTitle style={{ fontFamily: settings.primary_font }}>
          Vista Previa
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6" style={{ 
        backgroundColor: settings.background_color,
        color: settings.text_color
      }}>
        <div className="space-y-4">
          <h3 style={{ 
            fontFamily: settings.primary_font,
            color: settings.primary_color 
          }}>
            Título Principal
          </h3>
          <p style={{ fontFamily: settings.secondary_font }}>
            Este es un texto de ejemplo que muestra cómo se verá el contenido con la configuración actual.
          </p>
          <Button 
            style={{ 
              backgroundColor: settings.accent_color,
              borderRadius: `${settings.border_radius}px`
            }}
          >
            Botón de Ejemplo
          </Button>
        </div>
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
          <h1 className="text-3xl font-bold">Personalización</h1>
          <p className="text-muted-foreground">Personaliza la apariencia de tu aplicación</p>
        </div>
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Tabs defaultValue="colors" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="colors">Colores</TabsTrigger>
              <TabsTrigger value="typography">Tipografía</TabsTrigger>
              <TabsTrigger value="layout">Diseño</TabsTrigger>
            </TabsList>

            <TabsContent value="colors" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Paletas Predefinidas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {colorPalettes.map((palette) => (
                      <div
                        key={palette.name}
                        className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                          selectedPalette?.name === palette.name ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => handlePaletteSelect(palette)}
                      >
                        <div className={`h-8 w-full rounded mb-2 ${palette.preview}`} />
                        <p className="font-medium text-sm">{palette.name}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Colores Personalizados</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="primary_color">Color Primario</Label>
                      <div className="flex gap-2">
                        <Input
                          id="primary_color"
                          type="color"
                          value={settings.primary_color}
                          onChange={(e) => setSettings({...settings, primary_color: e.target.value})}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={settings.primary_color}
                          onChange={(e) => setSettings({...settings, primary_color: e.target.value})}
                          placeholder="#2563eb"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="secondary_color">Color Secundario</Label>
                      <div className="flex gap-2">
                        <Input
                          id="secondary_color"
                          type="color"
                          value={settings.secondary_color}
                          onChange={(e) => setSettings({...settings, secondary_color: e.target.value})}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={settings.secondary_color}
                          onChange={(e) => setSettings({...settings, secondary_color: e.target.value})}
                          placeholder="#1e40af"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="accent_color">Color de Acento</Label>
                      <div className="flex gap-2">
                        <Input
                          id="accent_color"
                          type="color"
                          value={settings.accent_color}
                          onChange={(e) => setSettings({...settings, accent_color: e.target.value})}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={settings.accent_color}
                          onChange={(e) => setSettings({...settings, accent_color: e.target.value})}
                          placeholder="#3b82f6"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="text_color">Color de Texto</Label>
                      <div className="flex gap-2">
                        <Input
                          id="text_color"
                          type="color"
                          value={settings.text_color}
                          onChange={(e) => setSettings({...settings, text_color: e.target.value})}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={settings.text_color}
                          onChange={(e) => setSettings({...settings, text_color: e.target.value})}
                          placeholder="#1f2937"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="typography" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Type className="h-5 w-5" />
                    Tipografía
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="primary_font">Fuente Principal (Títulos)</Label>
                    <Select value={settings.primary_font} onValueChange={(value) => setSettings({...settings, primary_font: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fontOptions.map((font) => (
                          <SelectItem key={font.value} value={font.value}>
                            <span className={font.class}>{font.label}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="secondary_font">Fuente Secundaria (Texto)</Label>
                    <Select value={settings.secondary_font} onValueChange={(value) => setSettings({...settings, secondary_font: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fontOptions.map((font) => (
                          <SelectItem key={font.value} value={font.value}>
                            <span className={font.class}>{font.label}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="layout" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-5 w-5" />
                    Diseño y Espaciado
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="border_radius">Radio de Bordes (px)</Label>
                    <Input
                      id="border_radius"
                      type="number"
                      min="0"
                      max="20"
                      value={settings.border_radius}
                      onChange={(e) => setSettings({...settings, border_radius: e.target.value})}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Vista Previa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PreviewCard />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}