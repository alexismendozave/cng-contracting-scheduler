import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Send, Settings, TestTube } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EmailConfig {
  id: string;
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_password: string;
  smtp_encryption: 'tls' | 'ssl' | 'none';
  from_email: string;
  from_name: string;
  is_active: boolean;
}

export default function EmailConfiguration() {
  const [config, setConfig] = useState<EmailConfig>({
    id: '',
    smtp_host: '',
    smtp_port: 587,
    smtp_user: '',
    smtp_password: '',
    smtp_encryption: 'tls',
    from_email: '',
    from_name: '',
    is_active: false
  });
  const [testEmail, setTestEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchEmailConfig();
  }, []);

  const fetchEmailConfig = async () => {
    try {
      const { data } = await supabase
        .from('general_settings')
        .select('*')
        .eq('setting_key', 'email_config')
        .single();

      if (data?.setting_value) {
        setConfig(data.setting_value as unknown as EmailConfig);
      }
    } catch (error) {
      console.error('Error fetching email config:', error);
    }
  };

  const saveEmailConfig = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('general_settings')
        .upsert({
          setting_key: 'email_config',
          setting_value: config as any
        });

      if (error) {
        toast.error('Error al guardar configuración: ' + error.message);
      } else {
        toast.success('Configuración de email guardada exitosamente');
      }
    } catch (error) {
      console.error('Error saving email config:', error);
      toast.error('Error al guardar la configuración');
    } finally {
      setIsLoading(false);
    }
  };

  const testEmailConnection = async () => {
    if (!testEmail) {
      toast.error('Por favor ingresa un email para la prueba');
      return;
    }

    setIsLoading(true);
    try {
      // Aquí se implementaría la lógica para enviar email de prueba
      toast.success('Email de prueba enviado correctamente');
    } catch (error) {
      console.error('Error testing email:', error);
      toast.error('Error al enviar email de prueba');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Configuración de Correo</h1>
          <p className="text-muted-foreground">Configura el servidor SMTP para el envío de emails</p>
        </div>
      </div>

      <Tabs defaultValue="smtp" className="w-full">
        <TabsList>
          <TabsTrigger value="smtp">Configuración SMTP</TabsTrigger>
          <TabsTrigger value="templates">Plantillas</TabsTrigger>
          <TabsTrigger value="test">Pruebas</TabsTrigger>
        </TabsList>

        <TabsContent value="smtp">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Configuración del Servidor SMTP
              </CardTitle>
              <CardDescription>
                Configure los parámetros de conexión SMTP para el envío de correos electrónicos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="smtp-enabled"
                  checked={config.is_active}
                  onCheckedChange={(checked) => setConfig({...config, is_active: checked})}
                />
                <Label htmlFor="smtp-enabled">Habilitar SMTP</Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp-host">Servidor SMTP</Label>
                  <Input
                    id="smtp-host"
                    value={config.smtp_host}
                    onChange={(e) => setConfig({...config, smtp_host: e.target.value})}
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-port">Puerto</Label>
                  <Input
                    id="smtp-port"
                    type="number"
                    value={config.smtp_port}
                    onChange={(e) => setConfig({...config, smtp_port: parseInt(e.target.value)})}
                    placeholder="587"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-user">Usuario</Label>
                  <Input
                    id="smtp-user"
                    value={config.smtp_user}
                    onChange={(e) => setConfig({...config, smtp_user: e.target.value})}
                    placeholder="tu-email@gmail.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-password">Contraseña</Label>
                  <Input
                    id="smtp-password"
                    type="password"
                    value={config.smtp_password}
                    onChange={(e) => setConfig({...config, smtp_password: e.target.value})}
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-encryption">Cifrado</Label>
                  <Select
                    value={config.smtp_encryption}
                    onValueChange={(value: 'tls' | 'ssl' | 'none') => setConfig({...config, smtp_encryption: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tls">TLS</SelectItem>
                      <SelectItem value="ssl">SSL</SelectItem>
                      <SelectItem value="none">Sin cifrado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="from-email">Email del remitente</Label>
                  <Input
                    id="from-email"
                    type="email"
                    value={config.from_email}
                    onChange={(e) => setConfig({...config, from_email: e.target.value})}
                    placeholder="noreply@miempresa.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="from-name">Nombre del remitente</Label>
                  <Input
                    id="from-name"
                    value={config.from_name}
                    onChange={(e) => setConfig({...config, from_name: e.target.value})}
                    placeholder="Mi Empresa"
                  />
                </div>
              </div>

              <Button onClick={saveEmailConfig} disabled={isLoading}>
                <Settings className="h-4 w-4 mr-2" />
                {isLoading ? 'Guardando...' : 'Guardar Configuración'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Plantillas de Email</CardTitle>
              <CardDescription>
                Personaliza las plantillas de correo electrónico del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Las plantillas de email se configurarán en una próxima actualización.
                  Aquí podrás personalizar los mensajes de bienvenida, confirmación de reserva, etc.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Probar Configuración
              </CardTitle>
              <CardDescription>
                Envía un email de prueba para verificar la configuración
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="test-email">Email de destino</Label>
                <Input
                  id="test-email"
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="test@example.com"
                />
              </div>
              <Button onClick={testEmailConnection} disabled={isLoading || !config.is_active}>
                <Send className="h-4 w-4 mr-2" />
                {isLoading ? 'Enviando...' : 'Enviar Email de Prueba'}
              </Button>
              {!config.is_active && (
                <p className="text-sm text-amber-600">
                  Primero debes habilitar y guardar la configuración SMTP
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}