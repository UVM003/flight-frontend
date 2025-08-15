import { useState } from 'react';
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
import { useDispatch } from "react-redux";
import { loginSuccess } from "../store/authSlice";
import api from '@/lib/axiosApi';
import ForgotPasswordComponent from '@/components/user/ForgetPasswordForm';
<<<<<<< Updated upstream
=======
import PasswordInput from '@/components/user/PasswordInput';
>>>>>>> Stashed changes
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
   const [forgotEmail, setForgotEmail] = useState("");
  const dispatch = useDispatch();
  // Get redirect path from location state, default to home
  const from = location.state?.redirectTo || '/';
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
const onSubmit = async (data: LoginFormValues) => {
  setIsLoading(true);
  setError(null);

  try {
    // Call backend
    const response = await api.post("/api/auth/customers/login", {
      email: data.email,
      password: data.password,
    });

    // Assuming backend returns { token, customer: { username, role, email, ... } }
    console.log("Login response:", response.data);
    const   customer  = response.data;
    

    // Save in Redux
    dispatch(loginSuccess({ token: customer.token, customer }));

    // Persist in localStorage
    localStorage.setItem("token", customer.token);
    localStorage.setItem("customer", JSON.stringify(customer));

    // Redirect user
    navigate(from);
  } catch (err) {
    console.error("Login error:", err);
    setError("Invalid email or password. Please try again.");
  } finally {
    setIsLoading(false);
  }
};
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
                    <ForgotPasswordComponent/>
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
