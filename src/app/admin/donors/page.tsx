
"use client";

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, updateDoc, writeBatch, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Donor as DonorType } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, Edit, CheckCircle, Trash2, Copy, Upload, ChevronDown } from 'lucide-react';
import { format, parseISO } from 'date-fns';
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
} from "@/components/ui/dialog"
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import Papa from 'papaparse';
import { Checkbox } from '@/components/ui/checkbox';

type Donor = DonorType & { id: string };

export default function AdminDonorsPage() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [isImporting, setIsImporting] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [fileToImport, setFileToImport] = useState<File | null>(null);
  const [selectedDonors, setSelectedDonors] = useState<string[]>([]);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);


  const fetchDonors = async () => {
    setLoading(true);
    const donorsCollection = collection(db, 'donors');
    const donorsSnapshot = await getDocs(donorsCollection);
    const donorsList = donorsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Donor));
    setDonors(donorsList);
    setLoading(false);
    setSelectedDonors([]);
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
  
  const handleBulkAction = async (action: 'verify' | 'delete') => {
    const batch = writeBatch(db);
    selectedDonors.forEach(id => {
        const donorRef = doc(db, 'donors', id);
        if (action === 'delete') {
            batch.delete(donorRef);
        } else if (action === 'verify') {
            batch.update(donorRef, { isVerified: true });
        }
    });

    try {
        await batch.commit();
        toast({
            title: 'Success',
            description: `${selectedDonors.length} donors have been ${action === 'delete' ? 'deleted' : 'verified'}.`
        });
        fetchDonors();
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: `Could not perform bulk ${action}.`
        });
    } finally {
       if (action === 'delete') setIsBulkDeleteOpen(false);
    }
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
                const newDonorRef = doc(collection(db, 'donors'));
                
                const newDonor: Partial<DonorType> = {
                    uid: newDonorRef.id,
                    fullName: row['Donor Name'] || "N/A",
                    phoneNumber: row['Mobile'] || "N/A",
                    bloodGroup: row['Blood Group'] || "N/A",
                    address: {
                        division: row['Address'] || "N/A",
                        district: "N/A",
                        upazila: "N/A",
                    },
                    isAvailable: true,
                    isVerified: false,
                    isAdmin: false,
                    createdAt: new Date().toISOString(),
                };

                if (row['Last Donation Date']) {
                    const parsedDate = new Date(row['Last Donation Date']);
                    if (!isNaN(parsedDate.getTime())) {
                        newDonor.lastDonationDate = parsedDate.toISOString();
                    }
                }
                
                batch.set(newDonorRef, newDonor);
                importedCount++;
            });

            try {
                await batch.commit();
                toast({
                    title: "Import Successful",
                    description: `${importedCount} donors have been imported.`,
                });
                fetchDonors();
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
                        `Donor Name`, `Blood Group`, `Mobile`, `Address`, `Last Donation Date`.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Input 
                        type="file" 
                        accept=".csv"
                        onChange={(e) => setFileToImport(e.target.files ? e.target.files[0] : null)}
                    />
                     <p className="text-xs text-muted-foreground mt-2">
                        Note: Missing fields are allowed and will be marked as N/A. `Last Donation Date` should be in a recognizable format (e.g., YYYY-MM-DD).
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
          <div className="flex justify-between items-center">
             <div>
                <CardTitle>All Donors</CardTitle>
                <CardDescription>A list of all registered donors in the system.</CardDescription>
             </div>
             {selectedDonors.length > 0 && (
                <AlertDialog open={isBulkDeleteOpen} onOpenChange={setIsBulkDeleteOpen}>
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                        Actions ({selectedDonors.length})
                        <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => handleBulkAction('verify')}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Verify Selected
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
                                This will permanently delete the selected {selectedDonors.length} donors. This action cannot be undone.
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
                    checked={selectedDonors.length === donors.length && donors.length > 0}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedDonors(donors.map(d => d.id));
                      } else {
                        setSelectedDonors([]);
                      }
                    }}
                    aria-label="Select all"
                  />
                </TableHead>
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
                  <TableCell colSpan={8} className="text-center">Loading donors...</TableCell>
                </TableRow>
              ) : donors.map((donor) => (
                <TableRow key={donor.id} data-state={selectedDonors.includes(donor.id) && "selected"}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedDonors.includes(donor.id)}
                      onCheckedChange={(checked) => {
                        setSelectedDonors(prev => 
                          checked ? [...prev, donor.id] : prev.filter(id => id !== donor.id)
                        );
                      }}
                      aria-label="Select row"
                    />
                  </TableCell>
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

    