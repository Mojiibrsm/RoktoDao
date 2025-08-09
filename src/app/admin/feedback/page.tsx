

"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Feedback as FeedbackType } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, Trash2, CheckCircle, Eye, Loader2, Frown } from 'lucide-react';
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
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

type Feedback = FeedbackType & { id: string };

export default function AdminFeedbackPage() {
    const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const { toast } = useToast();

    const fetchFeedback = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('feedback')
                .select('*')
                .order('createdAt', { ascending: 'desc' });
            
            if (error) throw error;

            const list = data.map(item => ({
                ...item,
                date: item.createdAt ? format(new Date(item.createdAt), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
            })) as Feedback[];
            
            setFeedbackList(list);
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch feedback.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeedback();
    }, []);

    const handleUpdateStatus = async (id: string, status: FeedbackType['status']) => {
        try {
            const { error } = await supabase
                .from('feedback')
                .update({ status })
                .eq('id', id);

            if (error) throw error;
            toast({ title: "Status Updated", description: `Feedback marked as ${status}.` });
            fetchFeedback();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not update status.' });
        }
    };
    
    const handleDelete = async (id: string | null) => {
        if (!id) return;
        try {
            const { error } = await supabase.from('feedback').delete().eq('id', id);
            if (error) throw error;

            toast({ title: "Feedback Deleted", variant: "destructive" });
            fetchFeedback();
        } catch (error) {
             toast({ variant: 'destructive', title: 'Error', description: 'Could not delete feedback.' });
        } finally {
            setIsDeleteOpen(false);
            setSelectedFeedback(null);
        }
    };

    const openDeleteDialog = (feedback: Feedback) => {
        setSelectedFeedback(feedback);
        setIsDeleteOpen(true);
    };

    const openViewDialog = (feedback: Feedback) => {
        setSelectedFeedback(feedback);
        setIsViewOpen(true);
    };

    const getStatusVariant = (status: Feedback['status']) => {
        switch (status) {
            case 'New': return 'default';
            case 'In Progress': return 'secondary';
            case 'Resolved': return 'default';
            case 'Ignored': return 'outline';
            default: return 'outline';
        }
    };

     const getStatusClass = (status: Feedback['status']) => {
        switch (status) {
            case 'New': return 'bg-blue-600';
            case 'Resolved': return 'bg-green-600';
            default: return '';
        }
    };
    
     const getTypeVariant = (type: Feedback['type']) => {
        switch (type) {
            case 'Bug': return 'destructive';
            case 'Suggestion': return 'default';
            case 'Complaint': return 'secondary';
            default: return 'outline';
        }
    };


    return (
        <div>
            <header className="py-4">
                <h1 className="text-2xl font-bold tracking-tight text-primary md:text-3xl font-headline">
                    Feedback / Reports
                </h1>
                <p className="text-muted-foreground">View and manage user-submitted issues and feedback.</p>
            </header>
            <Card>
                <CardHeader>
                    <CardTitle>Feedback List</CardTitle>
                    <CardDescription>A list of all user-submitted feedback.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Message</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10">
                                        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                                        <p className="mt-2 text-muted-foreground">Loading feedback...</p>
                                    </TableCell>
                                </TableRow>
                            ) : feedbackList.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10">
                                        <Frown className="mx-auto h-8 w-8 text-muted-foreground" />
                                        <p className="mt-2 text-muted-foreground">No feedback found.</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                feedbackList.map((feedback) => (
                                    <TableRow key={feedback.id}>
                                        <TableCell className="font-medium">{feedback.user.name}</TableCell>
                                        <TableCell>
                                            <Badge variant={getTypeVariant(feedback.type)}>{feedback.type}</Badge>
                                        </TableCell>
                                        <TableCell className="max-w-xs truncate">{feedback.message}</TableCell>
                                        <TableCell>{feedback.date}</TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant(feedback.status)} className={getStatusClass(feedback.status)}>
                                                {feedback.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button aria-haspopup="true" size="icon" variant="ghost">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        <span className="sr-only">Toggle menu</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onSelect={() => openViewDialog(feedback)}>
                                                        <Eye className="mr-2 h-4 w-4" /> View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onSelect={() => handleUpdateStatus(feedback.id, 'Resolved')}>
                                                        <CheckCircle className="mr-2 h-4 w-4" /> Mark as Resolved
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem 
                                                        className="text-destructive focus:text-destructive"
                                                        onSelect={() => openDeleteDialog(feedback)}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* View Details Dialog */}
            <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Feedback from {selectedFeedback?.user.name}</DialogTitle>
                        <DialogDescription>
                            Type: <Badge variant={getTypeVariant(selectedFeedback?.type || 'Other')}>{selectedFeedback?.type}</Badge> | 
                            Status: <Badge variant={getStatusVariant(selectedFeedback?.status || 'New')} className={getStatusClass(selectedFeedback?.status || 'New')}>{selectedFeedback?.status}</Badge>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 text-sm text-muted-foreground max-h-60 overflow-y-auto">
                        {selectedFeedback?.message}
                    </div>
                </DialogContent>
            </Dialog>

             {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete this feedback.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setSelectedFeedback(null)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(selectedFeedback?.id ?? null)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
