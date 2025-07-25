
"use client";

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Donor as DonorType } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, Edit, CheckCircle, Trash2, Copy, Upload } from 'lucide-react';
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
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import Papa from 'papaparse';

type Donor = DonorType & { id: string };

export default function AdminDonorsPage() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [isImporting, setIsImporting] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [fileToImport, setFileToImport] = useState<File | null>(null);

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

  const handleImportDonors = async () => {
    if (!fileToImport) {
        toast({ variant: "destructive", title: "No file selected", description: "Please select a CSV file to import." });
        return;
    }

    setIsImporting(true);
    Papa.parse(fileToImport, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
            const donorsToImport = results.data as any[];
            if (donorsToImport.length === 0) {
                toast({ variant: 'destructive', title: 'Empty File', description: 'The selected CSV file is empty or invalid.' });
                setIsImporting(false);
                return;
            }

            const batch = writeBatch(db);
            let importedCount = 0;

            donorsToImport.forEach((row) => {
                // Generate a new document reference with a unique ID
                const newDonorRef = doc(collection(db, 'donors'));
                
                const newDonor: Partial<DonorType> = {
                    uid: newDonorRef.id, // Use the generated ID as the UID
                    fullName: row.fullName || "N/A",
                    phoneNumber: row.phoneNumber || "N/A",
                    bloodGroup: row.bloodGroup || "N/A",
                    address: {
                        division: row.division || "N/A",
                        district: row.district || "N/A",
                        upazila: row.upazila || "N/A",
                    },
                    isAvailable: true,
                    isVerified: false,
                    isAdmin: false,
                    createdAt: new Date().toISOString(),
                };
                
                batch.set(newDonorRef, newDonor);
                importedCount++;
            });

            try {
                await batch.commit();
                toast({
                    title: "Import Successful",
                    description: `${importedCount} donors have been imported.`,
                });
                fetchDonors(); // Refresh the donor list
            } catch (error) {
                console.error("Error importing donors:", error);
                toast({
                    variant: "destructive",
                    title: "Import Failed",
                    description: "An error occurred while importing donors.",
                });
            } finally {
                setIsImporting(false);
                setIsImportDialogOpen(false);
                setFileToImport(null);
            }
        },
        error: (error) => {
            toast({
                variant: "destructive",
                title: "Parsing Error",
                description: `Could not parse CSV file: ${error.message}`,
            });
            setIsImporting(false);
        }
    });
};


  return (
    <div>
      <header className="py-4 flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold tracking-tight text-primary md:text-3xl font-headline">
            Donors Management
            </h1>
            <p className="text-muted-foreground">View, Edit, Delete, and Verify Donors.</p>
        </div>
        <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="outline"><Upload className="mr-2 h-4 w-4" /> Import Donors</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Import Donors via CSV</DialogTitle>
                    <DialogDescription>
                        Select a CSV file to import new donors. The file should have columns: 
                        `fullName`, `phoneNumber`, `bloodGroup`, `division`, `district`, `upazila`.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Input 
                        type="file" 
                        accept=".csv"
                        onChange={(e) => setFileToImport(e.target.files ? e.target.files[0] : null)}
                    />
                     <p className="text-xs text-muted-foreground mt-2">
                        Note: Missing fields are allowed and will be marked as N/A.
                     </p>
                </div>
                <DialogFooter>
                    <Button variant="secondary" onClick={() => setIsImportDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleImportDonors} disabled={isImporting || !fileToImport}>
                        {isImporting ? 'Importing...' : 'Start Import'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
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
                            <Link href={`/profile?userId=${donor.id}`}><Edit className="mr-2 h-4 w-4" />Edit</Link>
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
