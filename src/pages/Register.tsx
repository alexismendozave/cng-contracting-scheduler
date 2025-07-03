
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { toast } from "sonner";

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return {
      isValid: minLength && hasUpper && hasLower && hasNumber && hasSymbol,
      minLength,
      hasUpper,
      hasLower,
      hasNumber,
      hasSymbol
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      toast.error("La contraseña no cumple con los requisitos de seguridad");
      return;
    }

    setLoading(true);
    
    const { error } = await signUp(formData.email, formData.password, formData.fullName);
    
    if (!error) {
      navigate('/login');
    }
    
    setLoading(false);
  };

  const passwordValidation = validatePassword(formData.password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">CNG Contracting</h1>
          <p className="text-gray-600 mt-2">Crear cuenta de cliente</p>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl text-center">Registro</CardTitle>
            <CardDescription className="text-center">
              Crea tu cuenta para acceder a nuestros servicios
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nombre Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Juan Pérez"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
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
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
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

                {formData.password && (
                  <div className="text-xs space-y-1">
                    <div className={`flex items-center gap-2 ${passwordValidation.minLength ? 'text-green-600' : 'text-red-600'}`}>
                      <span>{passwordValidation.minLength ? '✓' : '✗'}</span>
                      Mínimo 8 caracteres
                    </div>
                    <div className={`flex items-center gap-2 ${passwordValidation.hasUpper ? 'text-green-600' : 'text-red-600'}`}>
                      <span>{passwordValidation.hasUpper ? '✓' : '✗'}</span>
                      Una mayúscula
                    </div>
                    <div className={`flex items-center gap-2 ${passwordValidation.hasLower ? 'text-green-600' : 'text-red-600'}`}>
                      <span>{passwordValidation.hasLower ? '✓' : '✗'}</span>
                      Una minúscula
                    </div>
                    <div className={`flex items-center gap-2 ${passwordValidation.hasNumber ? 'text-green-600' : 'text-red-600'}`}>
                      <span>{passwordValidation.hasNumber ? '✓' : '✗'}</span>
                      Un número
                    </div>
                    <div className={`flex items-center gap-2 ${passwordValidation.hasSymbol ? 'text-green-600' : 'text-red-600'}`}>
                      <span>{passwordValidation.hasSymbol ? '✓' : '✗'}</span>
                      Un símbolo
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={loading || !passwordValidation.isValid}
              >
                {loading ? "Creando cuenta..." : "Crear Cuenta"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                ¿Ya tienes cuenta?{" "}
                <Link to="/login" className="text-blue-600 hover:underline">
                  Iniciar sesión
                </Link>
              </p>
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

export default Register;
