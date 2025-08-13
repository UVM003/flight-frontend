import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import { AuthService } from '@/lib/api';
import axios from "axios";
import ForgetPasswordForm from '@/components/user/ForgetPasswordForm';
import PasswordInput from '@/components/user/PasswordInput';
// Backend DTO type
interface AuthResponseDTO {
  success: boolean;
  message: string;
  token: string;
  role: string;
}

// Form validation schema
const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [openForgot, setOpenForgot] = useState(false);
const [forgotEmail, setForgotEmail] = useState("");
const [otpLoading, setOtpLoading] = useState(false);
const [otpError, setOtpError] = useState<string | null>(null);

  const from = location.state?.redirectTo || '/';

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Check login on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsLoggedIn(!!token);
  }, []);

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const resData = await AuthService.login(data.email, data.password) as AuthResponseDTO;

      if (resData.success) {
        localStorage.setItem('authToken', resData.token);
        localStorage.setItem('userRole', resData.role);

        setIsLoggedIn(true);
        navigate(from);
      } else {
        setError(resData.message || 'Login failed. Please try again.');
      }
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Network error. Please check your connection.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    setIsLoggedIn(false);
    navigate('/login'); // or wherever you want
  };

//forget password handle here
const handleSendOtp = async () => {
  if (!forgotEmail) {
    setOtpError("Please enter your email address");
    return;
  }
  setOtpLoading(true);
  setOtpError(null);

  try {
    // Directly hit backend API
    const res = await axios.post("http://localhost:8086/api/auth/forgotpassword", {
      email: forgotEmail
    });

    if (res.data.success) {
      setOpenForgot(false);
      navigate("/reset-password", { state: { email: forgotEmail } });
    } else {
      setOtpError(res.data.message || "Failed to send OTP");
    }
  } catch (err: any) {
    setOtpError(err.response?.data?.message || "Network error");
  } finally {
    setOtpLoading(false);
  }
};

  if (isLoggedIn) {
    return (
      <div className="container max-w-lg py-10 text-center">
        <Card className="shadow-md p-8">
          <h2 className="text-2xl font-bold mb-4">You are already logged in</h2>
          <Button onClick={handleLogout} className="w-full max-w-xs mx-auto">
            Logout
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-lg py-10">
      <Card className="shadow-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Log in</CardTitle>
          <CardDescription>
            Enter your email and password to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="email@example.com"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <PasswordInput
          control={form.control}
        name="password"
     label="Password"
      placeholder="******"
      />

              <div className="text-right">
                 <ForgetPasswordForm />
                 </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : "Log in"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter>
          <div className="text-center w-full">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-primary hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;
