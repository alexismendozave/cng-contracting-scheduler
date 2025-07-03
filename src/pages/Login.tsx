
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await signIn(email, password);
    
    if (!error) {
      navigate('/');
    }
    
    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    await resetPassword(resetEmail);
    setShowResetForm(false);
    setResetEmail("");
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">CNG Contracting</h1>
          <p className="text-gray-600 mt-2">Servicios profesionales a domicilio</p>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl text-center">
              {showResetForm ? "Recuperar Contraseña" : "Iniciar Sesión"}
            </CardTitle>
            <CardDescription className="text-center">
              {showResetForm 
                ? "Ingresa tu email para recuperar tu contraseña"
                : "Accede a tu cuenta de CNG Contracting"
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {!showResetForm ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
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
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
                </Button>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setShowResetForm(true)}
                    className="text-sm text-blue-600 hover:underline block w-full text-center"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="resetEmail">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="resetEmail"
                      type="email"
                      placeholder="tu@email.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? "Enviando..." : "Enviar Email de Recuperación"}
                </Button>

                <button
                  type="button"
                  onClick={() => setShowResetForm(false)}
                  className="text-sm text-gray-600 hover:underline block w-full text-center"
                >
                  Volver al inicio de sesión
                </button>
              </form>
            )}

            <div className="mt-6">
              <Separator className="my-4" />
              
              <div className="space-y-3">
                <Link to="/register">
                  <Button variant="outline" className="w-full">
                    Crear cuenta de cliente
                  </Button>
                </Link>
                
                <Link to="/admin-login">
                  <Button variant="outline" className="w-full border-orange-200 text-orange-700 hover:bg-orange-50">
                    Acceso Administrativo
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-600">
          <Link to="/" className="hover:underline">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
