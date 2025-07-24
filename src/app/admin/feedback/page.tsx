
"use client";

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, Trash2, CheckCircle, Eye } from 'lucide-react';
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

type Feedback = {
  id: string;
  user: {
    name: string;
    email: string;
  };
  type: 'Bug' | 'Suggestion' | 'Complaint' | 'Other';
  message: string;
  date: string;
  status: 'New' | 'In Progress' | 'Resolved' | 'Ignored';
};

const mockFeedback: Feedback[] = [
  {
    id: 'fb-001',
    user: { name: 'Alice Johnson', email: 'alice@example.com' },
    type: 'Bug',
    message: 'The search filter for donors in Dhaka division is not working correctly. It shows donors from other divisions as well.',
    date: '2023-10-26',
    status: 'New',
  },
  {
    id: 'fb-002',
    user: { name: 'Bob Williams', email: 'bob@example.com' },
    type: 'Suggestion',
    message: 'It would be great to have a feature to see the donation history for each donor on their profile page.',
    date: '2023-10-25',
    status: 'In Progress',
  },
  {
    id: 'fb-003',
    user: { name: 'Anonymous', email: 'N/A' },
    type: 'Complaint',
    message: 'I tried to contact a donor, but the phone number provided was incorrect. Please verify the contact details.',
    date: '2023-10-24',
    status: 'Resolved',
  },
  {
    id: 'fb-004',
    user: { name: 'Charlie Brown', email: 'charlie@example.com' },
    type: 'Other',
    message: 'Just wanted to say this is a great initiative! Keep up the good work.',
    date: '2023-10-23',
    status: 'Ignored',
  },
];


export default function AdminFeedbackPage() {
    const [feedbackList, setFeedbackList] = useState<Feedback[]>(mockFeedback);
    const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const { toast } = useToast();

    const handleUpdateStatus = (id: string, status: Feedback['status']) => {
        setFeedbackList(feedbackList.map(fb => fb.id === id ? { ...fb, status } : fb));
        toast({ title: "Status Updated", description: `Feedback marked as ${status}.` });
    };
    
    const handleDelete = (id: string | null) => {
        if (!id) return;
        setFeedbackList(feedbackList.filter(fb => fb.id !== id));
        toast({ title: "Feedback Deleted", variant: "destructive" });
        setIsDeleteOpen(false);
        setSelectedFeedback(null);
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
                            {feedbackList.map((feedback) => (
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
                            ))}
                        </TableBody>
                    </Table>
                    {feedbackList.length === 0 && (
                        <p className="text-center text-muted-foreground p-8">No feedback found.</p>
                    )}
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
