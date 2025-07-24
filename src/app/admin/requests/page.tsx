
"use client";

import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { BloodRequest } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, Check, X, Trash2, CheckCheck } from 'lucide-react';
import { format } from 'date-fns';
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

export default function AdminRequestsPage() {
    const [requests, setRequests] = useState<BloodRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const requestsRef = collection(db, 'requests');
            const q = query(requestsRef, orderBy('neededDate', 'desc'));
            const querySnapshot = await getDocs(q);
            const requestsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), status: doc.data().status || 'Pending' } as BloodRequest));
            setRequests(requestsList);
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Could not fetch requests." });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleUpdateStatus = async (requestId: string, status: BloodRequest['status']) => {
        try {
            const requestRef = doc(db, 'requests', requestId);
            await updateDoc(requestRef, { status });
            toast({ title: "Status Updated", description: `Request has been marked as ${status}.` });
            fetchRequests();
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Could not update the status." });
        }
    };

    const handleDeleteRequest = async (requestId: string) => {
        try {
            await deleteDoc(doc(db, 'requests', requestId));
            toast({ title: "Request Deleted", description: "The blood request has been deleted." });
            fetchRequests();
        } catch (error) {
           toast({ variant: "destructive", title: "Error", description: "Could not delete the request." });
        }
    };

    const getStatusBadgeVariant = (status: BloodRequest['status']) => {
        switch (status) {
            case 'Approved': return 'default';
            case 'Fulfilled': return 'default';
            case 'Rejected': return 'destructive';
            case 'Pending': return 'secondary';
            default: return 'outline';
        }
    };
     const getStatusBadgeClass = (status: BloodRequest['status']) => {
        switch (status) {
            case 'Approved': return 'bg-blue-600';
            case 'Fulfilled': return 'bg-green-600';
            default: return '';
        }
    };

    return (
        <div>
            <header className="py-4">
                <h1 className="text-2xl font-bold tracking-tight text-primary md:text-3xl font-headline">
                    Blood Requests
                </h1>
                <p className="text-muted-foreground">View, Filter, and Manage Blood Requests.</p>
            </header>
            <Card>
                <CardHeader>
                    <CardTitle>All Blood Requests</CardTitle>
                    <CardDescription>A list of all user-submitted blood requests.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient Name</TableHead>
                        <TableHead>Blood Group</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Date Needed</TableHead>
                        <TableHead>Bags</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead><span className="sr-only">Actions</span></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                         <TableRow>
                            <TableCell colSpan={8} className="text-center">Loading requests...</TableCell>
                        </TableRow>
                      ) : requests.map((req) => (
                        <TableRow key={req.id}>
                          <TableCell className="font-medium">{req.patientName}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-primary border-primary">
                              {req.bloodGroup}
                            </Badge>
                          </TableCell>
                          <TableCell>{req.hospitalLocation}</TableCell>
                          <TableCell>{req.contactPhone}</TableCell>
                          <TableCell>
                            {format(new Date(req.neededDate), 'dd MMM yyyy')}
                          </TableCell>
                          <TableCell className="text-center">{req.numberOfBags}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(req.status)} className={getStatusBadgeClass(req.status)}>
                                {req.status}
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
                                  <DropdownMenuItem onClick={() => handleUpdateStatus(req.id, 'Approved')}>
                                    <Check className="mr-2 h-4 w-4" /> Approve
                                  </DropdownMenuItem>
                                   <DropdownMenuItem onClick={() => handleUpdateStatus(req.id, 'Fulfilled')}>
                                    <CheckCheck className="mr-2 h-4 w-4" /> Mark as Fulfilled
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleUpdateStatus(req.id, 'Rejected')}>
                                    <X className="mr-2 h-4 w-4" /> Reject
                                  </DropdownMenuItem>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem className="text-destructive focus:text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                </DropdownMenuContent>
                              </DropdownMenu>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete this blood request.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteRequest(req.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  { !loading && requests.length === 0 && (
                    <p className="text-center text-muted-foreground p-8">No blood requests found.</p>
                  )}
                </CardContent>
            </Card>
        </div>
    );
}
