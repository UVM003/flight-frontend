
import React, { useEffect, useState } from 'react'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter,
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, Clock, ArrowRight, Search } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate, Link } from 'react-router-dom';
import api from '@/lib/axiosApi';
import { toast } from 'sonner';

interface UserResponseDTO {
  userId: number | null;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string; 
  email: string;
  phoneNumber: string;
  address: string;
  createdAt: string; 
  updatedAt: string;
  role: string;
  emailVerified: boolean;
}

const AddAdmin = () => {
      const navigate = useNavigate();
    
    
      const [isLoading, setIsLoading] = useState(true);
 const [users, setUsers] = useState<UserResponseDTO[]>([]);
   const [open, setOpen] = useState(false);
   const [loading, setLoading] = useState(false);

    const fetchUsers = async () => {
    try {
      setIsLoading(true);

      const response = await api.get("/api/admin/users");

      const data = response.data;
      console.log("Fetched data:", data);

      if (Array.isArray(data)) {
        console.log("Array");
        setUsers(data);
        console.log("users mapped", data);

      } else {
        console.error("Expected array but got:", data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
       toast.error("Error fetching users!", {
               duration: 1500,
             });
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchUsers();
  }, []);
      
 if (isLoading) {
    return (
      <div className="container py-8 flex justify-center items-center min-h-[400px]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <p>Loading your users...</p>
        </div>
      </div>
    );
  }

     const handleAddAdmin = async(user: UserResponseDTO) => {
       
       try {
         const response = await api.put("/api/admin/users/role", {
           
           userId: user.userId,
           email: user.email, 
              role: 'ADMIN',
         });
         const newUser = response.data;
         setUsers((prevUsers) => [...prevUsers, newUser]);
         toast.success("User Role changes to ADMIN successfully!", {
           duration: 1500,
         });
         fetchUsers();
       } catch (error) {
         console.error("Error adding user:", error);
         toast.error("Failed to promote user to ADMIN. Please try again.", {
           duration: 1500,
         });
       }
     }

        
    


    function handleConfirmDelete(user: UserResponseDTO) {
        return async (event) => {
            event.preventDefault();
            setLoading(true);
            const { userId, email } = user;
            try {
                await api.delete(`/api/admin/users/delete`, {
                    data: {
                        userId: userId,
                        email: email,
                    },
                });
                setUsers((prevUsers) => prevUsers.filter((user) => user.userId !== userId));
                toast.success(`User ${userId} deleted successfully!`, {
                    duration: 1500,
                });
                setOpen(false);
            } catch (error) {
                console.error("Error deleting user:", error);
                toast.error("Failed to delete user. Please try again.", {
                    duration: 1500,
                });
            } finally {
                setLoading(false);
            }
        };
    }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Manage Users</h1>
      <p className="text-muted-foreground mb-6">View and manage Users</p>

      {users.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Users Exists</h2>
            <p className="text-center text-muted-foreground mb-6 max-w-md">
              You don't have any users yet. Start by adding Registering users.
            </p>
            <Button asChild>
              <Link to="/register">Register Users</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div>
          
            <Card>
              <CardHeader>
                <CardTitle>Your Bookings</CardTitle>
                <CardDescription>You have {users.length} users</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User ID</TableHead>
                      <TableHead className="hidden sm:table-cell">Name</TableHead>
                      <TableHead className="hidden md:table-cell">Gender</TableHead>
                      <TableHead className="hidden md:table-cell">Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
  {users.map((user) => (
    <>
    {/* Delete User Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete User <b>{user.userId}</b>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              No
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete(user)} disabled={loading}>
              {loading ? "Deleting..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    <TableRow key={user.userId}>
      <TableCell className="font-medium">{user.userId}</TableCell>
      <TableCell className="hidden sm:table-cell">{user.firstName} {user.lastName}</TableCell>
      <TableCell className="hidden sm:table-cell">{user.gender}</TableCell>
      <TableCell className="hidden md:table-cell">
      {user.email}
      </TableCell>
      <TableCell>
      
          {user.role}
        
      </TableCell>
      <TableCell className="text-right gap-4 flex justify-end">
        <Button size="lg" onClick={() => handleAddAdmin(user)} >
               Make Admin
              </Button>
              <Button size="lg" className="mt-2 md:mt-0 bg-red-700 hover:bg-red-600" onClick={() => setOpen(true)}>
                Delete User
              </Button>
      </TableCell>
    </TableRow>
    </>
  ))}
</TableBody>
</Table>
</CardContent>
</Card>
</div>
)}

    
</div>

  );
}

export default AddAdmin