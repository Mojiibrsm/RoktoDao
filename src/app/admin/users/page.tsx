
"use client";

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, writeBatch, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Donor as DonorType } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, UserX, Trash2, Edit, ChevronDown, Ban, UserCheck, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { bloodGroups } from '@/lib/location-data';


type Donor = DonorType & { id: string };

const userSchema = z.object({
  fullName: z.string().min(3, { message: 'Full name is required.' }),
  bloodGroup: z.string({ required_error: 'Blood group is required.' }).min(1, 'Blood group is required.'),
  phoneNumber: z.string().min(11, { message: 'A valid phone number is required.' }),
  email: z.string().email({ message: 'A valid email is required.' }),
});

type UserFormValues = z.infer<typeof userSchema>;

interface UserFormProps {
  form: UseFormReturn<UserFormValues>;
  onSubmit: (values: UserFormValues) => void;
  isSubmitting: boolean;
  submitText: string;
}

const UserForm = ({ form, onSubmit, isSubmitting, submitText }: UserFormProps) => {
    return (
       <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-6">
            <FormField control={form.control} name="fullName" render={({ field }) => (
                <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl><Input placeholder="User's Full Name" {...field} /></FormControl>
                <FormMessage />
                </FormItem>
            )} />
             <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl><Input type="email" placeholder="user@example.com" {...field} /></FormControl>
                <FormMessage />
                </FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="bloodGroup" render={({ field }) => (
              <FormItem>
                  <FormLabel>Blood Group</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select group" /></SelectTrigger></FormControl>
                  <SelectContent>{bloodGroups.map(group => <SelectItem key={group} value={group}>{group}</SelectItem>)}</SelectContent>
                  </Select>
                  <FormMessage />
              </FormItem>
              )} />
              <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl><Input placeholder="01XXXXXXXXX" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
              )} />
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : submitText}
                </Button>
            </DialogFooter>
        </form>
      </Form>
    );
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      fullName: '',
      bloodGroup: '',
      phoneNumber: '',
      email: '',
    }
  });


  const fetchUsers = async () => {
    setLoading(true);
    const usersCollection = collection(db, 'donors');
    const usersSnapshot = await getDocs(usersCollection);
    const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Donor));
    setUsers(usersList);
    setLoading(false);
    setSelectedUsers([]);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleBlockUser = async (userId: string) => {
    try {
      const userRef = doc(db, 'donors', userId);
      await updateDoc(userRef, { isAvailable: false }); // Or a dedicated 'isBlocked' field
      toast({ title: "User Blocked", description: "The user has been marked as unavailable." });
      fetchUsers(); // Refresh list
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not block the user." });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteDoc(doc(db, 'donors', userId));
      toast({ title: "User Deleted", description: "The user's Firestore record has been deleted." });
      fetchUsers();
    } catch (error) {
       toast({ variant: "destructive", title: "Error", description: "Could not delete the user." });
    }
  };

  const handleBulkAction = async (action: 'delete' | 'block' | 'unblock') => {
    const batch = writeBatch(db);
    selectedUsers.forEach(id => {
      const userRef = doc(db, 'donors', id);
      if (action === 'delete') {
        batch.delete(userRef);
      } else if (action === 'block') {
        batch.update(userRef, { isAvailable: false });
      } else if (action === 'unblock') {
        batch.update(userRef, { isAvailable: true });
      }
    });

    try {
      await batch.commit();
      toast({
        title: 'Success',
        description: `${selectedUsers.length} users have been updated.`
      });
      fetchUsers();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Could not perform bulk action.`
      });
    } finally {
        if(action === 'delete') setIsBulkDeleteOpen(false);
    }
  };

  const handleAddUser = async (values: UserFormValues) => {
    const newDonorRef = doc(collection(db, 'donors'));
    const donorData: Omit<DonorType, 'id'> = {
        uid: newDonorRef.id,
        fullName: values.fullName,
        bloodGroup: values.bloodGroup,
        phoneNumber: values.phoneNumber,
        address: {
            division: 'N/A',
            district: 'N/A',
            upazila: 'N/A',
        },
        isAvailable: true,
        isVerified: true,
        isAdmin: false,
        createdAt: serverTimestamp(),
    };

    try {
        await addDoc(collection(db, 'donors'), donorData);
        toast({
            title: 'User Added',
            description: 'The new user has been successfully created.',
        });
        fetchUsers();
        setIsAddUserOpen(false);
        form.reset();
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Failed to Add',
            description: 'Something went wrong. Please try again.',
        });
    }
  };


  return (
    <div>
      <header className="py-4 flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold tracking-tight text-primary md:text-3xl font-headline">
            User Management
            </h1>
            <p className="text-muted-foreground">View, block, or remove users from the system.</p>
        </div>
        <Dialog open={isAddUserOpen} onOpenChange={(isOpen) => {
            setIsAddUserOpen(isOpen);
            if (!isOpen) form.reset();
        }}>
            <DialogTrigger asChild>
                <Button><PlusCircle className="mr-2 h-4 w-4" /> Add User</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                    <DialogDescription>
                        Fill in the details below to add a new user to the system.
                    </DialogDescription>
                </DialogHeader>
                <UserForm form={form} onSubmit={handleAddUser} isSubmitting={form.formState.isSubmitting} submitText="Add User" />
            </DialogContent>
        </Dialog>
      </header>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>All Users</CardTitle>
              <CardDescription>A list of all registered users (donors).</CardDescription>
            </div>
            {selectedUsers.length > 0 && (
              <AlertDialog open={isBulkDeleteOpen} onOpenChange={setIsBulkDeleteOpen}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      Actions ({selectedUsers.length})
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => handleBulkAction('block')}>
                      <Ban className="mr-2 h-4 w-4" />
                      Block Selected
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleBulkAction('unblock')}>
                      <UserCheck className="mr-2 h-4 w-4" />
                      Unblock Selected
                    </DropdownMenuItem>
                    <AlertDialogTrigger asChild>
                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Selected
                        </DropdownMenuItem>
                    </AlertDialogTrigger>
                  </DropdownMenuContent>
                </DropdownMenu>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the selected {selectedUsers.length} users. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleBulkAction('delete')} className="bg-destructive hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                 <TableHead padding="checkbox">
                  <Checkbox
                    checked={selectedUsers.length === users.length && users.length > 0}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedUsers(users.map(u => u.id));
                      } else {
                        setSelectedUsers([]);
                      }
                    }}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Blood Group</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                    <TableCell colSpan={7} className="text-center">Loading users...</TableCell>
                </TableRow>
              ) : users.map((user) => (
                <TableRow key={user.id} data-state={selectedUsers.includes(user.id) && "selected"}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={(checked) => {
                        setSelectedUsers(prev => 
                          checked ? [...prev, user.id] : prev.filter(id => id !== user.id)
                        );
                      }}
                      aria-label="Select row"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{user.fullName}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-primary border-primary">
                      {user.bloodGroup}
                    </Badge>
                  </TableCell>
                  <TableCell>{`${user.address.upazila}, ${user.address.district}`}</TableCell>
                  <TableCell>{user.phoneNumber}</TableCell>
                  <TableCell>
                    <Badge variant={user.isAvailable ? 'default' : 'secondary'} className={user.isAvailable ? 'bg-green-600' : ''}>
                        {user.isAvailable ? 'Active' : 'Blocked/Unavailable'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <AlertDialog>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                           <DropdownMenuItem asChild>
                            <Link href={`/profile?userId=${user.id}`}><Edit className="mr-2 h-4 w-4" />Edit</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleBlockUser(user.id)}>
                            <UserX className="mr-2 h-4 w-4" />
                            Block
                          </DropdownMenuItem>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="text-destructive focus:text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the user's data from Firestore. It will not remove them from Firebase Authentication.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteUser(user.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
           { !loading && users.length === 0 && (
              <p className="text-center text-muted-foreground p-8">No users found.</p>
            )}
        </CardContent>
      </Card>
    </div>
  );
}

    