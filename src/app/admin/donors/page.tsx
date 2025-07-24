"use client";

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Donor } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, Edit, CheckCircle, Trash2, Copy } from 'lucide-react';
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
import Link from 'next/link';

export default function AdminDonorsPage() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchDonors = async () => {
    setLoading(true);
    const donorsCollection = collection(db, 'donors');
    const donorsSnapshot = await getDocs(donorsCollection);
    const donorsList = donorsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Donor));
    setDonors(donorsList);
    setLoading(false);
  };

  useEffect(() => {
    fetchDonors();
  }, []);

  const handleVerifyDonor = async (donorId: string) => {
    try {
      const donorRef = doc(db, 'donors', donorId);
      await updateDoc(donorRef, { isVerified: true });
      toast({ title: "Donor Verified", description: "The donor has been marked as verified." });
      fetchDonors();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not verify the donor." });
    }
  };

  const handleDeleteDonor = async (donorId: string) => {
    try {
      await deleteDoc(doc(db, 'donors', donorId));
      toast({ title: "Donor Deleted", description: "The donor's record has been deleted." });
      fetchDonors();
    } catch (error) {
       toast({ variant: "destructive", title: "Error", description: "Could not delete the donor." });
    }
  };
  
  const handleCopy = (number: string) => {
    navigator.clipboard.writeText(number);
    toast({ title: "Number copied!" });
  };


  return (
    <div>
      <header className="py-4">
        <h1 className="text-2xl font-bold tracking-tight text-primary md:text-3xl font-headline">
          Donors Management
        </h1>
        <p className="text-muted-foreground">View, Edit, Delete, and Verify Donors.</p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>All Donors</CardTitle>
          <CardDescription>A list of all registered donors in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Blood Group</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Last Donated</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">Loading donors...</TableCell>
                </TableRow>
              ) : donors.map((donor) => (
                <TableRow key={donor.id}>
                  <TableCell className="font-medium">{donor.fullName}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-primary border-primary">
                      {donor.bloodGroup}
                    </Badge>
                  </TableCell>
                  <TableCell>{`${donor.address.upazila}, ${donor.address.district}`}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {donor.phoneNumber}
                       <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCopy(donor.phoneNumber)}>
                          <Copy className="h-4 w-4" />
                       </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    {donor.lastDonationDate ? format(new Date(donor.lastDonationDate), 'dd MMM yyyy') : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={donor.isAvailable ? 'default' : 'secondary'} className={donor.isAvailable ? 'bg-green-600' : ''}>
                        {donor.isAvailable ? 'Available' : 'Unavailable'}
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
                            <Link href={`/profile/settings?userId=${donor.id}`}><Edit className="mr-2 h-4 w-4" />Edit</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleVerifyDonor(donor.id)}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Verify
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
                            This action cannot be undone. This will permanently delete the donor's data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteDonor(donor.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
