
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { Eye, EyeOff, Lock, Mail, Shield } from "lucide-react";
import { toast } from "sonner";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await signIn(email, password);
    
    if (!error) {
      // Redirect will be handled by the auth context
      navigate('/admin');
    } else {
      toast.error("Credenciales de administrador inválidas");
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Panel Administrativo</h1>
          <p className="text-gray-600 mt-2">CNG Contracting - Acceso Restringido</p>
        </div>

        <Card className="shadow-xl border-red-200">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl text-center text-red-700">
              Acceso Administrativo
            </CardTitle>
            <CardDescription className="text-center">
              Solo personal autorizado puede acceder
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Administrativo</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@cngcontracting.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-red-600 hover:bg-red-700"
                disabled={loading}
              >
                {loading ? "Verificando acceso..." : "Acceder al Panel"}
              </Button>
            </form>

            <div className="mt-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-800">
                  <strong>Nota para pruebas:</strong> Use la contraseña temporal "12345" para acceder como administrador durante el desarrollo.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-600">
          <Link to="/login" className="hover:underline">
            ← Acceso regular de clientes
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
