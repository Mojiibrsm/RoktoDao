
"use client";

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, updateDoc, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, Edit, Trash2, PlusCircle } from 'lucide-react';
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
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { bloodGroups } from '@/lib/location-data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Moderator {
    id: string;
    name: string;
    role: string;
    bloodGroup: string;
    phone: string;
    email: string;
    location: string;
    avatar: string;
    avatarHint?: string;
    createdAt: any;
}

const moderatorSchema = z.object({
  name: z.string().min(3, { message: 'Name is required.' }),
  role: z.string().min(3, { message: 'Role is required.' }),
  bloodGroup: z.string().min(1, 'Blood group is required.'),
  phone: z.string().min(11, 'A valid phone number is required.'),
  email: z.string().email('A valid email is required.'),
  location: z.string().min(3, 'Location is required.'),
  avatar: z.string().url({ message: 'A valid avatar URL is required.' }),
  avatarHint: z.string().optional(),
});

type ModeratorFormValues = z.infer<typeof moderatorSchema>;

const ModeratorForm = ({ form, onSubmit, isSubmitting, submitText }: { form: UseFormReturn<ModeratorFormValues>, onSubmit: (values: ModeratorFormValues) => void, isSubmitting: boolean, submitText: string }) => {
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-6">
                <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="Moderator's Name" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="moderator@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem><FormLabel>Phone</FormLabel><FormControl><Input placeholder="01XXXXXXXXX" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="role" render={({ field }) => (
                        <FormItem><FormLabel>Role</FormLabel><FormControl><Input placeholder="Moderator" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
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
                </div>
                 <FormField control={form.control} name="location" render={({ field }) => (
                    <FormItem><FormLabel>Location</FormLabel><FormControl><Input placeholder="City, Country" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="avatar" render={({ field }) => (
                    <FormItem><FormLabel>Avatar URL</FormLabel><FormControl><Input placeholder="https://placehold.co/100x100.png" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                    <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : submitText}</Button>
                </DialogFooter>
            </form>
        </Form>
    );
};


export default function ModeratorsPage() {
    const [moderators, setModerators] = useState<Moderator[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    
    const [selectedModerator, setSelectedModerator] = useState<Moderator | null>(null);

    const form = useForm<ModeratorFormValues>({
        resolver: zodResolver(moderatorSchema),
        defaultValues: {
            name: '',
            role: 'Moderator',
            bloodGroup: '',
            phone: '',
            email: '',
            location: '',
            avatar: 'https://placehold.co/100x100.png',
            avatarHint: 'person smiling',
        },
    });

    const fetchModerators = async () => {
        setLoading(true);
        try {
            const modsCollection = collection(db, 'moderators');
            const q = query(modsCollection, orderBy('createdAt', 'desc'));
            const modsSnapshot = await getDocs(q);
            const modsList = modsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Moderator));
            setModerators(modsList);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch moderators.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchModerators();
    }, []);

    const handleAddModerator = async (values: ModeratorFormValues) => {
        try {
            await addDoc(collection(db, 'moderators'), {
                ...values,
                createdAt: serverTimestamp(),
            });
            toast({ title: 'Moderator Added', description: 'The new moderator has been added successfully.' });
            fetchModerators();
            form.reset();
            setIsAddDialogOpen(false);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not add the moderator.' });
        }
    };

    const handleUpdateModerator = async (values: ModeratorFormValues) => {
        if (!selectedModerator) return;
        try {
            const modRef = doc(db, 'moderators', selectedModerator.id);
            await updateDoc(modRef, values);
            toast({ title: 'Moderator Updated', description: 'The moderator has been updated successfully.' });
            fetchModerators();
            setIsEditDialogOpen(false);
            setSelectedModerator(null);
        } catch (error) {
             toast({ variant: 'destructive', title: 'Error', description: 'Could not update the moderator.' });
        }
    };

    const handleDeleteModerator = async () => {
        if (!selectedModerator) return;
        try {
            await deleteDoc(doc(db, 'moderators', selectedModerator.id));
            toast({ title: 'Moderator Deleted', description: 'The moderator has been deleted.' });
            fetchModerators();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not delete the moderator.' });
        } finally {
            setIsDeleteDialogOpen(false);
            setSelectedModerator(null);
        }
    };

    const openEditDialog = (moderator: Moderator) => {
        setSelectedModerator(moderator);
        form.reset(moderator);
        setIsEditDialogOpen(true);
    };

    const openDeleteDialog = (moderator: Moderator) => {
        setSelectedModerator(moderator);
        setIsDeleteDialogOpen(true);
    };

    return (
        <div>
            <header className="py-4 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-primary md:text-3xl font-headline">
                        Moderators Management
                    </h1>
                    <p className="text-muted-foreground">Add, edit, or remove moderators from the team page.</p>
                </div>
                 <Dialog open={isAddDialogOpen} onOpenChange={(isOpen) => {
                    setIsAddDialogOpen(isOpen);
                    if (!isOpen) form.reset();
                }}>
                    <DialogTrigger asChild>
                        <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Moderator</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Moderator</DialogTitle>
                        </DialogHeader>
                        <ModeratorForm form={form} onSubmit={handleAddModerator} isSubmitting={form.formState.isSubmitting} submitText="Add Moderator" />
                    </DialogContent>
                </Dialog>
            </header>
            <Card>
                <CardHeader>
                    <CardTitle>All Moderators</CardTitle>
                    <CardDescription>This is the list of all moderators currently on the team.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">Loading moderators...</TableCell>
                                </TableRow>
                            ) : moderators.length > 0 ? (
                                moderators.map((mod) => (
                                <TableRow key={mod.id}>
                                    <TableCell>{mod.name}</TableCell>
                                    <TableCell>{mod.email}</TableCell>
                                    <TableCell>{mod.phone}</TableCell>
                                    <TableCell>{mod.location}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">Toggle menu</span>
                                            </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onSelect={() => openEditDialog(mod)}>
                                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={() => openDeleteDialog(mod)}>
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">No moderators found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Edit Moderator Dialog */}
             <Dialog open={isEditDialogOpen} onOpenChange={(isOpen) => {
                setIsEditDialogOpen(isOpen);
                if (!isOpen) setSelectedModerator(null);
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Moderator</DialogTitle>
                    </DialogHeader>
                    <ModeratorForm form={form} onSubmit={handleUpdateModerator} isSubmitting={form.formState.isSubmitting} submitText="Save Changes" />
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete this moderator.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setSelectedModerator(null)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteModerator} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
