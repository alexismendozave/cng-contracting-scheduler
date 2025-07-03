
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Edit, User, Users } from "lucide-react";

type UserRole = 'root_admin' | 'company_admin' | 'manager' | 'client' | 'assistant';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

const UserManagement = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (profileData: Partial<Profile>) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.full_name,
          role: profileData.role,
          is_active: profileData.is_active
        })
        .eq('id', profileData.id);

      if (error) throw error;
      
      toast.success('Usuario actualizado exitosamente');
      setIsDialogOpen(false);
      setEditingProfile(null);
      fetchProfiles();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error al actualizar usuario');
    }
  };

  const getRoleBadge = (role: UserRole) => {
    const roleColors = {
      root_admin: 'bg-red-100 text-red-800',
      company_admin: 'bg-purple-100 text-purple-800',
      manager: 'bg-blue-100 text-blue-800',
      client: 'bg-green-100 text-green-800',
      assistant: 'bg-yellow-100 text-yellow-800'
    };

    const roleLabels = {
      root_admin: 'Super Admin',
      company_admin: 'Admin',
      manager: 'Manager',
      client: 'Cliente',
      assistant: 'Asistente'
    };

    return (
      <Badge className={roleColors[role] || 'bg-gray-100 text-gray-800'}>
        {roleLabels[role] || role}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Cargando usuarios...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Gestión de Usuarios
              </CardTitle>
              <CardDescription>
                Administra usuarios, roles y permisos del sistema
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {profiles.map((profile) => (
              <Card key={profile.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <User className="h-8 w-8 text-gray-400" />
                    <div>
                      <h4 className="font-medium">
                        {profile.full_name || 'Sin nombre'}
                      </h4>
                      <p className="text-sm text-gray-600">{profile.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {getRoleBadge(profile.role)}
                        <Badge variant={profile.is_active ? "default" : "secondary"}>
                          {profile.is_active ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingProfile(profile);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            {profiles.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No hay usuarios registrados
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Modifica la información y permisos del usuario
            </DialogDescription>
          </DialogHeader>
          
          {editingProfile && (
            <EditProfileForm
              profile={editingProfile}
              onSave={handleSaveProfile}
              onCancel={() => setIsDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface EditProfileFormProps {
  profile: Profile;
  onSave: (profile: Partial<Profile>) => void;
  onCancel: () => void;
}

const EditProfileForm = ({ profile, onSave, onCancel }: EditProfileFormProps) => {
  const [formData, setFormData] = useState({
    full_name: profile.full_name || '',
    role: profile.role,
    is_active: profile.is_active
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...profile, ...formData });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="full_name">Nombre completo</Label>
        <Input
          id="full_name"
          value={formData.full_name}
          onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
        />
      </div>

      <div>
        <Label htmlFor="role">Rol</Label>
        <Select value={formData.role} onValueChange={(value: UserRole) => setFormData(prev => ({ ...prev, role: value }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="client">Cliente</SelectItem>
            <SelectItem value="assistant">Asistente</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="company_admin">Admin</SelectItem>
            <SelectItem value="root_admin">Super Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="is_active">Usuario activo</Label>
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          Guardar cambios
        </Button>
      </DialogFooter>
    </form>
  );
};

export default UserManagement;
