// OrderSmartly - Login Page (Google OAuth Enabled)
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { Eye, EyeOff, Zap, Coffee, ArrowRight, Chrome, Shield, Store, User } from 'lucide-react';
import type { UserRole } from '@/types';

// Google OAuth Script Loader
const loadGoogleScript = () => {
  return new Promise<void>((resolve, reject) => {
    if (document.getElementById('google-script')) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.id = 'google-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject();
    document.body.appendChild(script);
  });
};

const Login: React.FC = () => {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>('customer');
  const roleRef = React.useRef(role);
  useEffect(() => {
    roleRef.current = role;
  }, [role]);

  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/dashboard';

  // Initialize Google Sign-In
  useEffect(() => {
    const initGoogle = async () => {
      try {
        await loadGoogleScript();
        if (window.google && import.meta.env.VITE_GOOGLE_CLIENT_ID) {
          window.google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            callback: handleGoogleResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          window.google.accounts.id.renderButton(
            document.getElementById('google-signin-button'),
            {
              theme: 'outline',
              size: 'large',
              width: '100%',
              text: 'signin_with'
            }
          );
        }
      } catch (error) {
        console.error('Failed to load Google Sign-In:', error);
      }
    };

    initGoogle();
  }, []);

  // Handle Google OAuth response
  const handleGoogleResponse = async (response: { credential: string }) => {
    try {
      setIsLoading(true);
      await googleLogin(response.credential, roleRef.current);
    } catch (error) {
      // Error handled in auth context
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await login(formData.email, formData.password, role);
    } catch (error) {
      // Error handled in auth context
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25">
              <Zap className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">OrderSmartly</h1>
              <p className="text-sm text-muted-foreground">Café Management Simplified</p>
            </div>
          </div>
        </div>

        <Card className="border shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription>
              Sign in to manage your café
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Role Selection */}
            <div className="space-y-2">
              <Label>Login As</Label>
              <RadioGroup
                value={role}
                onValueChange={(value) => setRole(value as UserRole)}
                className="grid grid-cols-3 gap-2"
              >
                <div>
                  <RadioGroupItem value="super_admin" id="super_admin" className="peer sr-only" />
                  <Label
                    htmlFor="super_admin"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover py-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer text-center"
                  >
                    <Shield className="mb-1 h-5 w-5" />
                    <div className="font-semibold text-xs">Admin</div>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="cafe_owner" id="cafe_owner" className="peer sr-only" />
                  <Label
                    htmlFor="cafe_owner"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover py-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer text-center"
                  >
                    <Store className="mb-1 h-5 w-5" />
                    <div className="font-semibold text-xs">Owner</div>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="customer" id="customer" className="peer sr-only" />
                  <Label
                    htmlFor="customer"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover py-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer text-center"
                  >
                    <User className="mb-1 h-5 w-5" />
                    <div className="font-semibold text-xs">Customer</div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Google Sign-In Button */}
            <div id="google-signin-button" className="w-full"></div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>
          </CardContent>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pt-0">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                    className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              {/* Remember Me */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="remember" className="text-sm font-normal">
                  Remember me for 30 days
                </Label>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              <p className="text-sm text-center text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary hover:underline font-medium">
                  Sign up
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>

        {/* Demo Accounts */}
        <div className="mt-8">
          <Separator className="mb-4" />
          <p className="text-xs text-center text-muted-foreground mb-3">
            Demo Accounts (for testing)
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setFormData({ email: 'owner@demo.com', password: 'demo123' })}
              className="flex items-center justify-center gap-2 p-2 text-xs rounded-lg border hover:bg-muted transition-colors"
            >
              <Coffee className="h-3 w-3" />
              Café Owner
            </button>
            <button
              onClick={() => setFormData({ email: 'admin@demo.com', password: 'demo123' })}
              className="flex items-center justify-center gap-2 p-2 text-xs rounded-lg border hover:bg-muted transition-colors"
            >
              <Zap className="h-3 w-3" />
              Super Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add Google types
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: unknown) => void;
          renderButton: (element: HTMLElement | null, options: unknown) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export default Login;
