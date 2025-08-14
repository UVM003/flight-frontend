import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Loader2, CheckCircle2, LogOut, EyeOff, Eye, Trash2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AuthService } from '@/lib/api';
import { Customer } from '@/types.ts';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useDispatch } from 'react-redux';
import { logout } from '@/store/authSlice';
import api from '@/lib/axiosApi';
import { useAppSelector } from '@/store/store';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from "sonner";

// --- API Configuration ---
// Make sure to fill in your API base URL here
const PROFILE_API_URL = `/api/auth/customers/profile`;
const PASSWORD_API_URL = `/api/auth/customers/change-password`;
const DELETE_API_URL = `/api/auth/customers/profile`;

// --- Profile Update Schema ---
// The email field is removed from the schema as it's not editable.
const profileSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  phoneNumber: z.string().min(10, { message: 'Please enter a valid phone number' }),
  gender: z.enum(['Male', 'Female', 'Other'], {
    required_error: 'Please select a gender.',
  }),
  birthdate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Birthdate must be in YYYY-MM-DD format.',
  }),
  address: z.string().optional(),
});

// Password change schema
// The field name for the old password is now consistent as 'currentPassword'.
const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, { message: 'Current password is required' }),
    newPassword: z.string().min(6, { message: 'Password must be at least 6 characters' }),
    confirmPassword: z.string().min(6, { message: 'Confirm your password' }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

const ProfilePage = () => {
   const navigate = useNavigate();
   const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
    const { customer:customerAuth, isAuthenticated } = useAppSelector((state) => state.auth);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [passwordVisibility, setPasswordVisibility] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phoneNumber: '',
      gender: 'Other',
      birthdate: '',
      address: '',
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });
  

const fetchProfile = async () => {
  setIsLoading(true);
  setProfileError(null);
  try {
    if (!isAuthenticated) { // fixed your logic here
      setShowLoginPrompt(true);
      setIsLoading(false);
      return;
    }

    const response = await api.get(PROFILE_API_URL);
    const fetchedCustomer = response.data;
    setCustomer(fetchedCustomer);

    profileForm.reset({
      firstName: fetchedCustomer.firstName,
      lastName: fetchedCustomer.lastName,
      phoneNumber: fetchedCustomer.phoneNumber,
      gender: fetchedCustomer.gender,
      birthdate: fetchedCustomer.dateOfBirth,
      address: fetchedCustomer.address || '',
    });
  } catch (err: any) {
    setProfileError('Failed to fetch profile data. Please try again.');
    console.error('API Error:', err);
    if (err.response?.status === 401) {
      handleLogout();
    }
  } finally {
    setIsLoading(false);
  }
};

// If you still want it to run on mount
useEffect(() => {
  fetchProfile();
}, []);

    // --- Handle Profile Update Submission ---
  const onProfileSubmit = async (data: ProfileFormValues) => {
    setIsLoading(true);
    setProfileError(null);
    setUpdateSuccess(false);

    try {
      
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }
      const response = await api.put(
        PROFILE_API_URL,
        // Include the email from the customer state in the payload
        { ...data, dateOfBirth: data.birthdate, email: customer?.email }
      );
      const updatedCustomer = response.data;
      setCustomer(updatedCustomer);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 1500);
    } catch (err: any) {
      setProfileError(err.response?.data?.message || 'Failed to update profile. Please try again.');
      console.error('API Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Handle Password Change Submission ---
  const onPasswordSubmit = async (data: PasswordFormValues) => {
    console.log('Password submit called with data:', data);
    setIsPasswordLoading(true);
    setPasswordError(null);
    setPasswordSuccess(false);

    try {
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }
      // Only currentPassword and newPassword are sent to the API
      await api.put(
        PASSWORD_API_URL,
        {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }
      );
      setPasswordSuccess(true);
      passwordForm.reset();
      setTimeout(() => setPasswordSuccess(false), 1500);
        toast.success("Password changed successfully!", {
         duration: 1500, // 2 seconds
       });
       handleLogout();
    } catch (err: any) {
      console.error('Password change error:', err);
      console.error('Error response:', err.response);
      console.error('Error data:', err.response?.data);
      console.error('Request payload:', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
        toast.error("Failed to change password.", {
         duration: 1500,
       });
      console.error('Request headers:', {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      });
      setPasswordError(err.response?.data?.message || 'Failed to change password. Please try again.');
    } finally {
      setIsPasswordLoading(false);
    }
  };
  
const handleLogout = () => {
  // Clear tokens
  localStorage.removeItem("token");
  sessionStorage.removeItem("token");

  // Reset Redux state
  dispatch(logout());

 // Redirect
  navigate("/login", { replace: true });
};

const handleDeleteProfile = async () => {
  
    setIsDeleting(true);
    try {
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }

      await api.delete(DELETE_API_URL, {
        data: { password: deletePassword },
      });
        toast.success("Profile deleted successfully!", {
         duration: 1500, // 2 seconds
       });
      handleLogout();
    } catch (err: any) {
      toast.error("Failed to delete profile. Please try again.", {
         duration: 1500, // 2 seconds
       });
      console.error('Delete Profile Error:', err);
      setProfileError(err.response?.data?.message || 'Failed to delete profile. Please try again.');
      console.error('Delete Error:', err);

    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setDeletePassword('');
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setPasswordVisibility((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  if (!isAuthenticated) {
    return (
      <div className="container py-8 flex justify-center items-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Login Required</CardTitle>
            <CardDescription>Please login to access your profile</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/login')} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading && !customer) {
    return (
      <div className="container py-8 flex justify-center items-center min-h-[400px]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-2">My Profile</h1>
      <p className="text-muted-foreground mb-6">Manage your account details and password</p>

      <Tabs defaultValue="profile">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent>
              {updateSuccess && (
                <Alert className="mb-6" variant="default">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>Your profile has been updated successfully.</AlertDescription>
                </Alert>
              )}

              {profileError && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{profileError}</AlertDescription>
                </Alert>
              )}

              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                  {/* --- Non-Editable Email Field --- */}
                  <FormField
                    name="email" // Not part of the form, so no need for `control`
                    render={() => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input value={customer?.email || ''} readOnly disabled />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={profileForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={profileForm.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* --- Gender Field --- */}
                  <FormField
                    control={profileForm.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* --- Birthdate Field --- */}
                  <FormField
                    control={profileForm.control}
                    name="birthdate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Birthdate</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* --- Address Field --- */}
                  <FormField
                    control={profileForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="pt-2">
                    <Button type="submit" disabled={isLoading || !profileForm.formState.isDirty}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                  </div>
                </form>
              </Form>

              <div className="mt-8 pt-8 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Danger Zone</h3>
                    <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                  </div>
                  <Button variant="destructive" onClick={() => setShowDeleteDialog(true)} disabled={isDeleting}>
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Profile
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <CardContent>
              {passwordSuccess && (
                <Alert className="mb-6" variant="default">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>Your password has been changed successfully.</AlertDescription>
                </Alert>
              )}

              {passwordError && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{passwordError}</AlertDescription>
                </Alert>
              )}

              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input
                              type={passwordVisibility.current ? 'text' : 'password'}
                              {...field}
                              disabled={isPasswordLoading}
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => togglePasswordVisibility('current')}
                            disabled={isPasswordLoading}
                          >
                            {passwordVisibility.current ? (
                              <EyeOff className="h-4 w-4" aria-label="Hide password" />
                            ) : (
                              <Eye className="h-4 w-4" aria-label="Show password" />
                            )}
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input
                              type={passwordVisibility.new ? 'text' : 'password'}
                              {...field}
                              disabled={isPasswordLoading}
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => togglePasswordVisibility('new')}
                            disabled={isPasswordLoading}
                          >
                            {passwordVisibility.new ? (
                              <EyeOff className="h-4 w-4" aria-label="Hide password" />
                            ) : (
                              <Eye className="h-4 w-4" aria-label="Show password" />
                            )}
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input
                              type={passwordVisibility.confirm ? 'text' : 'password'}
                              {...field}
                              disabled={isPasswordLoading}
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => togglePasswordVisibility('confirm')}
                            disabled={isPasswordLoading}
                          >
                            {passwordVisibility.confirm ? (
                              <EyeOff className="h-4 w-4" aria-label="Hide password" />
                            ) : (
                              <Eye className="h-4 w-4" aria-label="Show password" />
                            )}
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="pt-2">
                    <Button type="submit" disabled={isPasswordLoading}>
                      {isPasswordLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Changing Password...
                        </>
                      ) : (
                        'Change Password'
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              This action cannot be undone. Please enter your password to confirm account deletion.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="password"
              placeholder="Enter your password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
            />
          
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteProfile} 
              disabled={!deletePassword || isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Account'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilePage;
