
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface Notice {
    id: string;
    text: string;
    createdAt: any;
}

export default function MarqueePage() {
    const [notices, setNotices] = useState<Notice[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    
    // States for dialogs
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    
    // States for form handling
    const [newNoticeText, setNewNoticeText] = useState('');
    const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

    const fetchNotices = async () => {
        setLoading(true);
        try {
            const noticesCollection = collection(db, 'marquee-notices');
            const q = query(noticesCollection, orderBy('createdAt', 'desc'));
            const noticesSnapshot = await getDocs(q);
            const noticesList = noticesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notice));
            setNotices(noticesList);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch notices.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotices();
    }, []);

    const handleAddNotice = async () => {
        if (!newNoticeText.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'Notice text cannot be empty.' });
            return;
        }
        try {
            await addDoc(collection(db, 'marquee-notices'), {
                text: newNoticeText,
                createdAt: serverTimestamp(),
            });
            toast({ title: 'Notice Added', description: 'The new notice has been added successfully.' });
            fetchNotices();
            setNewNoticeText('');
            setIsAddDialogOpen(false);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not add the notice.' });
        }
    };

    const handleUpdateNotice = async () => {
        if (!selectedNotice || !selectedNotice.text.trim()) {
             toast({ variant: 'destructive', title: 'Error', description: 'Notice text cannot be empty.' });
            return;
        }
        try {
            const noticeRef = doc(db, 'marquee-notices', selectedNotice.id);
            await updateDoc(noticeRef, { text: selectedNotice.text });
            toast({ title: 'Notice Updated', description: 'The notice has been updated successfully.' });
            fetchNotices();
            setIsEditDialogOpen(false);
            setSelectedNotice(null);
        } catch (error) {
             toast({ variant: 'destructive', title: 'Error', description: 'Could not update the notice.' });
        }
    };

    const handleDeleteNotice = async () => {
        if (!selectedNotice) return;
        try {
            await deleteDoc(doc(db, 'marquee-notices', selectedNotice.id));
            toast({ title: 'Notice Deleted', description: 'The notice has been deleted.' });
            fetchNotices();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not delete the notice.' });
        } finally {
            setIsDeleteDialogOpen(false);
            setSelectedNotice(null);
        }
    };

    const openEditDialog = (notice: Notice) => {
        setSelectedNotice(notice);
        setIsEditDialogOpen(true);
    };

    const openDeleteDialog = (notice: Notice) => {
        setSelectedNotice(notice);
        setIsDeleteDialogOpen(true);
    };

    return (
        <div>
            <header className="py-4 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-primary md:text-3xl font-headline">
                        Marquee Management
                    </h1>
                    <p className="text-muted-foreground">Add, edit, or remove notices from the homepage marquee.</p>
                </div>
                <Button onClick={() => setIsAddDialogOpen(true)}><PlusCircle className="mr-2 h-4 w-4" /> Add Notice</Button>
            </header>
            <Card>
                <CardHeader>
                    <CardTitle>All Notices</CardTitle>
                    <CardDescription>This is the list of all notices currently in the marquee.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80%]">Notice Text</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={2} className="text-center">Loading notices...</TableCell>
                                </TableRow>
                            ) : notices.length > 0 ? (
                                notices.map((notice) => (
                                <TableRow key={notice.id}>
                                    <TableCell>{notice.text}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">Toggle menu</span>
                                            </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onSelect={() => openEditDialog(notice)}>
                                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={() => openDeleteDialog(notice)}>
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={2} className="text-center">No notices found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Add Notice Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Notice</DialogTitle>
                        <DialogDescription>Enter the text for the new notice below.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="new-notice-text" className="text-right">Text</Label>
                            <Input id="new-notice-text" value={newNoticeText} onChange={(e) => setNewNoticeText(e.target.value)} className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                        <Button onClick={handleAddNotice}>Add Notice</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Notice Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Notice</DialogTitle>
                        <DialogDescription>Update the text for the notice below.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-notice-text" className="text-right">Text</Label>
                            <Input id="edit-notice-text" value={selectedNotice?.text || ''} onChange={(e) => setSelectedNotice(prev => prev ? {...prev, text: e.target.value} : null)} className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                        <Button onClick={handleUpdateNotice}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete this notice.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setSelectedNotice(null)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteNotice} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
