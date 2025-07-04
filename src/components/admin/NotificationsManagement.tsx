import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Mail, MessageSquare, Settings, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface NotificationTemplate {
  id: string;
  type: 'email' | 'sms' | 'push';
  event: string;
  subject: string;
  content: string;
  is_active: boolean;
}

const notificationEvents = [
  { key: 'user_registration', label: 'Registro de Usuario', description: 'Mensaje de bienvenida al registrarse' },
  { key: 'password_reset', label: 'Cambio de Contraseña', description: 'Notificación de cambio de contraseña' },
  { key: 'booking_created', label: 'Reserva Creada', description: 'Confirmación de nueva reserva' },
  { key: 'booking_confirmed', label: 'Reserva Confirmada', description: 'Confirmación de reserva por parte del admin' },
  { key: 'booking_cancelled', label: 'Reserva Cancelada', description: 'Notificación de cancelación de reserva' },
  { key: 'booking_completed', label: 'Reserva Completada', description: 'Notificación de servicio completado' },
  { key: 'payment_received', label: 'Pago Recibido', description: 'Confirmación de pago procesado' },
  { key: 'payment_failed', label: 'Pago Fallido', description: 'Notificación de fallo en el pago' }
];

export default function NotificationsManagement() {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchNotificationTemplates();
  }, []);

  const fetchNotificationTemplates = async () => {
    try {
      const { data } = await supabase
        .from('general_settings')
        .select('*')
        .eq('setting_key', 'notification_templates');

      if (data && data.length > 0) {
        setTemplates(data[0].setting_value as unknown as NotificationTemplate[]);
      } else {
        // Crear plantillas por defecto
        createDefaultTemplates();
      }
    } catch (error) {
      console.error('Error fetching notification templates:', error);
    }
  };

  const createDefaultTemplates = () => {
    const defaultTemplates: NotificationTemplate[] = notificationEvents.map(event => ({
      id: event.key,
      type: 'email',
      event: event.key,
      subject: getDefaultSubject(event.key),
      content: getDefaultContent(event.key),
      is_active: true
    }));
    setTemplates(defaultTemplates);
  };

  const getDefaultSubject = (eventKey: string): string => {
    const subjects: Record<string, string> = {
      user_registration: '¡Bienvenido a nuestro sistema!',
      password_reset: 'Contraseña actualizada',
      booking_created: 'Reserva creada exitosamente',
      booking_confirmed: 'Tu reserva ha sido confirmada',
      booking_cancelled: 'Reserva cancelada',
      booking_completed: 'Servicio completado',
      payment_received: 'Pago recibido',
      payment_failed: 'Error en el pago'
    };
    return subjects[eventKey] || 'Notificación del sistema';
  };

  const getDefaultContent = (eventKey: string): string => {
    const contents: Record<string, string> = {
      user_registration: 'Hola {{name}},\n\n¡Bienvenido a nuestro sistema! Tu cuenta ha sido creada exitosamente.\n\nSaludos,\nEl equipo',
      password_reset: 'Hola {{name}},\n\nTu contraseña ha sido actualizada exitosamente.\n\nSi no realizaste este cambio, contacta con soporte.\n\nSaludos,\nEl equipo',
      booking_created: 'Hola {{customer_name}},\n\nTu reserva #{{booking_id}} ha sido creada para el {{date}} a las {{time}}.\n\nServicio: {{service_name}}\nTotal: ${{amount}}\n\nSaludos,\nEl equipo',
      booking_confirmed: 'Hola {{customer_name}},\n\nTu reserva #{{booking_id}} ha sido confirmada.\n\nFecha: {{date}}\nHora: {{time}}\nDirección: {{address}}\n\nSaludos,\nEl equipo',
      booking_cancelled: 'Hola {{customer_name}},\n\nTu reserva #{{booking_id}} ha sido cancelada.\n\nSi tienes alguna pregunta, no dudes en contactarnos.\n\nSaludos,\nEl equipo',
      booking_completed: 'Hola {{customer_name}},\n\nTu servicio ha sido completado exitosamente.\n\n¡Gracias por elegirnos!\n\nSaludos,\nEl equipo',
      payment_received: 'Hola {{customer_name}},\n\nHemos recibido tu pago de ${{amount}} para la reserva #{{booking_id}}.\n\nGracias por tu pago.\n\nSaludos,\nEl equipo',
      payment_failed: 'Hola {{customer_name}},\n\nHubo un problema procesando tu pago para la reserva #{{booking_id}}.\n\nPor favor, intenta nuevamente o contacta con soporte.\n\nSaludos,\nEl equipo'
    };
    return contents[eventKey] || 'Contenido de la notificación';
  };

  const saveTemplate = async (template: NotificationTemplate) => {
    setIsLoading(true);
    try {
      const updatedTemplates = templates.map(t => 
        t.id === template.id ? template : t
      );
      
      const { error } = await supabase
        .from('general_settings')
        .upsert({
          setting_key: 'notification_templates',
          setting_value: updatedTemplates as any
        });

      if (error) {
        toast.error('Error al guardar plantilla: ' + error.message);
      } else {
        setTemplates(updatedTemplates);
        toast.success('Plantilla guardada exitosamente');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Error al guardar la plantilla');
    } finally {
      setIsLoading(false);
    }
  };

  const saveAllTemplates = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('general_settings')
        .upsert({
          setting_key: 'notification_templates',
          setting_value: templates as any
        });

      if (error) {
        toast.error('Error al guardar configuración: ' + error.message);
      } else {
        toast.success('Configuración guardada exitosamente');
      }
    } catch (error) {
      console.error('Error saving templates:', error);
      toast.error('Error al guardar la configuración');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Notificaciones</h1>
          <p className="text-muted-foreground">Configura los mensajes y notificaciones del sistema</p>
        </div>
        <Button onClick={saveAllTemplates} disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? 'Guardando...' : 'Guardar Todo'}
        </Button>
      </div>

      <Tabs defaultValue="email" className="w-full">
        <TabsList>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="sms">SMS</TabsTrigger>
          <TabsTrigger value="push">Push</TabsTrigger>
          <TabsTrigger value="settings">Configuración</TabsTrigger>
        </TabsList>

        <TabsContent value="email">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Plantillas de Email
                </CardTitle>
                <CardDescription>
                  Selecciona una plantilla para editar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {notificationEvents.map((event) => {
                    const template = templates.find(t => t.event === event.key && t.type === 'email');
                    return (
                      <div
                        key={event.key}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedTemplate?.event === event.key ? 'bg-primary/5 border-primary' : 'hover:bg-muted'
                        }`}
                        onClick={() => setSelectedTemplate(template || {
                          id: event.key,
                          type: 'email',
                          event: event.key,
                          subject: getDefaultSubject(event.key),
                          content: getDefaultContent(event.key),
                          is_active: true
                        })}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{event.label}</h4>
                            <p className="text-sm text-muted-foreground">{event.description}</p>
                          </div>
                          <Switch
                            checked={template?.is_active ?? true}
                            onCheckedChange={(checked) => {
                              if (template) {
                                const updatedTemplate = { ...template, is_active: checked };
                                saveTemplate(updatedTemplate);
                              }
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {selectedTemplate && (
              <Card>
                <CardHeader>
                  <CardTitle>Editar Plantilla</CardTitle>
                  <CardDescription>
                    Personaliza el contenido de la notificación
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Asunto</Label>
                    <Input
                      id="subject"
                      value={selectedTemplate.subject}
                      onChange={(e) => setSelectedTemplate({
                        ...selectedTemplate,
                        subject: e.target.value
                      })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Contenido</Label>
                    <Textarea
                      id="content"
                      rows={12}
                      value={selectedTemplate.content}
                      onChange={(e) => setSelectedTemplate({
                        ...selectedTemplate,
                        content: e.target.value
                      })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Variables disponibles:</Label>
                    <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
                      <p className="font-medium mb-2">Puedes usar estas variables en tu contenido:</p>
                      <ul className="space-y-1">
                        <li><code>{'{{name}}'}</code> - Nombre del usuario</li>
                        <li><code>{'{{customer_name}}'}</code> - Nombre del cliente</li>
                        <li><code>{'{{booking_id}}'}</code> - ID de la reserva</li>
                        <li><code>{'{{date}}'}</code> - Fecha de la reserva</li>
                        <li><code>{'{{time}}'}</code> - Hora de la reserva</li>
                        <li><code>{'{{service_name}}'}</code> - Nombre del servicio</li>
                        <li><code>{'{{amount}}'}</code> - Monto total</li>
                        <li><code>{'{{address}}'}</code> - Dirección</li>
                      </ul>
                    </div>
                  </div>

                  <Button onClick={() => saveTemplate(selectedTemplate)} disabled={isLoading}>
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? 'Guardando...' : 'Guardar Plantilla'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="sms">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Plantillas de SMS
              </CardTitle>
              <CardDescription>
                Configuración de mensajes SMS (Próximamente)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                La funcionalidad de SMS estará disponible en una próxima actualización.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="push">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notificaciones Push
              </CardTitle>
              <CardDescription>
                Configuración de notificaciones push (Próximamente)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Las notificaciones push estarán disponibles en una próxima actualización.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuración General
              </CardTitle>
              <CardDescription>
                Configuración global de notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications-enabled">Habilitar notificaciones</Label>
                  <p className="text-sm text-muted-foreground">Activar/desactivar todas las notificaciones del sistema</p>
                </div>
                <Switch id="notifications-enabled" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifications">Notificaciones por email</Label>
                  <p className="text-sm text-muted-foreground">Enviar notificaciones por correo electrónico</p>
                </div>
                <Switch id="email-notifications" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="admin-notifications">Notificaciones a administradores</Label>
                  <p className="text-sm text-muted-foreground">Notificar a administradores sobre eventos importantes</p>
                </div>
                <Switch id="admin-notifications" defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}