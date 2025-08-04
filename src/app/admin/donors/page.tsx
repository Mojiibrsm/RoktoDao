

"use client";

import { useState, useEffect, useCallback, useTransition } from 'react';
import { collection, getDocs, doc, deleteDoc, updateDoc, writeBatch, addDoc, serverTimestamp, query, where, orderBy, startAt, endAt } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Donor as DonorType } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, Edit, CheckCircle, Trash2, Copy, Upload, ChevronDown, PlusCircle, Pin, PinOff, Download, Search } from 'lucide-react';
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
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import Papa from 'papaparse';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { bloodGroups, locations, upazilas } from '@/lib/location-data';


type Donor = DonorType & { id: string };

const donorSchema = z.object({
  fullName: z.string().min(3, { message: 'Full name is required.' }),
  bloodGroup: z.string({ required_error: 'Blood group is required.' }).min(1, 'Blood group is required.'),
  phoneNumber: z.string().min(11, { message: 'A valid phone number is required.' }),
  division: z.string({ required_error: 'Division is required.' }).min(1, 'Division is required.'),
  district: z.string({ required_error: 'District is required.' }).min(1, 'District is required.'),
  upazila: z.string({ required_error: 'Upazila is required.' }).min(1, 'Upazila is required.'),
  lastDonationDate: z.date().optional(),
  isAvailable: z.boolean().default(true),
});

type DonorFormValues = z.infer<typeof donorSchema>;

interface DonorFormProps {
  form: UseFormReturn<DonorFormValues>;
  onSubmit: (values: DonorFormValues) => void;
  isSubmitting: boolean;
  submitText: string;
}

const DonorForm = ({ form, onSubmit, isSubmitting, submitText }: DonorFormProps) => {
    const selectedDivision = form.watch('division');
    const selectedDistrict = form.watch('district');

    const districtOptions = selectedDivision 
    ? locations[selectedDivision as keyof typeof locations]?.districts.map(district => ({
        value: district,
        label: district,
      })).sort((a,b) => a.label.localeCompare(b.label, 'bn'))
    : [];

    const upazilaOptions = selectedDistrict
    ? upazilas[selectedDistrict as keyof typeof upazilas]?.map(upazila => ({
        value: upazila,
        label: upazila,
      })).sort((a,b) => a.label.localeCompare(b.label, 'bn'))
    : [];

    return (
       <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-6">
            <FormField control={form.control} name="fullName" render={({ field }) => (
                <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl><Input placeholder="Donor's Full Name" {...field} /></FormControl>
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
            <div className="grid grid-cols-3 gap-4">
                <FormField control={form.control} name="division" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Division</FormLabel>
                    <Select onValueChange={(value) => { field.onChange(value); form.setValue('district', ''); form.setValue('upazila', ''); }} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select division" /></SelectTrigger></FormControl>
                      <SelectContent>{Object.keys(locations).map(div => <SelectItem key={div} value={div}>{div}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField
                  control={form.control}
                  name="district"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>District</FormLabel>
                      <Select onValueChange={(value) => { field.onChange(value); form.setValue('upazila', ''); }} value={field.value} disabled={!selectedDivision}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger></FormControl>
                          <SelectContent>
                              {districtOptions.map(district => (
                                  <SelectItem key={district.value} value={district.value}>{district.label}</SelectItem>
                              ))}
                          </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField control={form.control} name="upazila" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Upazila / Area</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={!selectedDistrict}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select upazila" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {upazilaOptions.map(up => <SelectItem key={up.value} value={up.value}>{up.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
            </div>
            <FormField control={form.control} name="lastDonationDate" render={({ field }) => (
              <FormItem className="flex flex-col">
              <FormLabel>Last Donation Date (optional)</FormLabel>
              <Popover>
                  <PopoverTrigger asChild>
                  <FormControl>
                      <Button variant="outline" className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                      {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                  </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date()} initialFocus />
                  </PopoverContent>
              </Popover>
              <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="isAvailable" render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                  <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  <div className="space-y-1 leading-none">
                      <FormLabel>Available to Donate</FormLabel>
                      <FormMessage />
                  </div>
              </FormItem>
            )} />
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


export default function AdminDonorsPage() {
  const [allDonors, setAllDonors] = useState<Donor[]>([]);
  const [filteredDonors, setFilteredDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [isImporting, setIsImporting] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [fileToImport, setFileToImport] = useState<File | null>(null);
  const [selectedDonors, setSelectedDonors] = useState<string[]>([]);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  
  const [searchName, setSearchName] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [searchArea, setSearchArea] = useState('');
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof donorSchema>>({
    resolver: zodResolver(donorSchema),
    defaultValues: {
      fullName: '',
      bloodGroup: '',
      phoneNumber: '',
      division: '',
      district: '',
      upazila: '',
      lastDonationDate: undefined,
      isAvailable: true,
    }
  });


  const fetchDonors = async () => {
    setLoading(true);
    const donorsCollection = collection(db, 'donors');
    const donorsSnapshot = await getDocs(query(donorsCollection, orderBy('createdAt', 'desc')));
    const donorsList = donorsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Donor));
    setAllDonors(donorsList);
    setFilteredDonors(donorsList); // Initially, all donors are shown
    setLoading(false);
    setSelectedDonors([]);
  };

  useEffect(() => {
    fetchDonors();
  }, []);
  
  const handleSearch = useCallback(() => {
    startTransition(() => {
        const filtered = allDonors.filter(donor => {
            const nameMatch = searchName ? donor.fullName.toLowerCase().includes(searchName.toLowerCase()) : true;
            const phoneMatch = searchPhone ? donor.phoneNumber.includes(searchPhone) : true;
            const areaMatch = searchArea ? 
                `${donor.address.upazila}, ${donor.address.district}`.toLowerCase().includes(searchArea.toLowerCase()) || 
                donor.address.district.toLowerCase().includes(searchArea.toLowerCase())
                : true;
            return nameMatch && phoneMatch && areaMatch;
        });
        setFilteredDonors(filtered);
    });
  }, [allDonors, searchName, searchPhone, searchArea]);


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

const handleAddDonor = async (values: DonorFormValues) => {
    const newDonorRef = doc(collection(db, 'donors'));
    const donorData: Omit<DonorType, 'id'> = {
        uid: newDonorRef.id,
        fullName: values.fullName,
        bloodGroup: values.bloodGroup,
        phoneNumber: values.phoneNumber,
        address: {
            division: values.division,
            district: values.district,
            upazila: values.upazila,
        },
        lastDonationDate: values.lastDonationDate?.toISOString(),
        isAvailable: values.isAvailable,
        isVerified: true, // Admin added donors are auto-verified
        isAdmin: false,
        createdAt: serverTimestamp(),
    };
    try {
        await addDoc(collection(db, 'donors'), donorData);
        toast({
          title: 'Donor Added',
          description: 'The new donor has been successfully created.',
        });
        fetchDonors();
        setIsAddDialogOpen(false);
        form.reset();
      } catch (error) {
         toast({
          variant: 'destructive',
          title: 'Failed to Add',
          description: 'Something went wrong. Please try again.',
        });
      }
};

 const handlePinDonor = async (donorId: string, isPinned: boolean) => {
    const donorRef = doc(db, 'donors', donorId);
    try {
      await updateDoc(donorRef, { isPinned: !isPinned });
      toast({
        title: 'Success',
        description: `Donor has been ${!isPinned ? 'pinned' : 'unpinned'}.`,
      });
      fetchDonors();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not update donor pin status.',
      });
    }
  };

  const downloadCSV = () => {
    const csv = Papa.unparse(filteredDonors.map(d => ({
        Name: d.fullName,
        Phone: d.phoneNumber,
        BloodGroup: d.bloodGroup,
        Location: `${d.address.upazila}, ${d.address.district}`,
        LastDonation: d.lastDonationDate ? format(new Date(d.lastDonationDate), 'yyyy-MM-dd') : 'N/A',
        Available: d.isAvailable ? 'Yes' : 'No',
        Verified: d.isVerified ? 'Yes' : 'No',
    })));
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'donors.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        <div className="flex items-center gap-2">
            <Button variant="outline" onClick={downloadCSV} disabled={filteredDonors.length === 0}><Download className="mr-2 h-4 w-4" /> Download CSV</Button>
            <Dialog open={isAddDialogOpen} onOpenChange={(isOpen) => {
                setIsAddDialogOpen(isOpen);
                if (!isOpen) form.reset();
            }}>
                <DialogTrigger asChild>
                    <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Donor</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Donor</DialogTitle>
                        <DialogDescription>
                            Fill in the details below to add a new donor to the system.
                        </DialogDescription>
                    </DialogHeader>
                    <DonorForm form={form} onSubmit={handleAddDonor} isSubmitting={form.formState.isSubmitting} submitText="Add Donor" />
                </DialogContent>
            </Dialog>

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
        </div>
      </header>
        <Card className="mb-6">
            <CardHeader>
                <CardTitle>Search Donors</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <Input placeholder="Search by name..." value={searchName} onChange={e => setSearchName(e.target.value)} />
                    <Input placeholder="Search by phone..." value={searchPhone} onChange={e => setSearchPhone(e.target.value)} />
                    <Input placeholder="Search by area (upazila/district)..." value={searchArea} onChange={e => setSearchArea(e.target.value)} />
                    <Button onClick={handleSearch} disabled={isPending}><Search className="mr-2 h-4 w-4" />{isPending ? 'Searching...' : 'Search'}</Button>
                </div>
            </CardContent>
        </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
             <div>
                <CardTitle>All Donors ({filteredDonors.length})</CardTitle>
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
                    checked={selectedDonors.length === filteredDonors.length && filteredDonors.length > 0}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedDonors(filteredDonors.map(d => d.id));
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
              ) : filteredDonors.map((donor) => (
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
                  <TableCell className="font-medium flex items-center gap-2">
                    {donor.isPinned && <Pin className="h-4 w-4 text-primary" />}
                    {donor.fullName}
                    </TableCell>
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
                            <DropdownMenuItem onClick={() => handlePinDonor(donor.id, !!donor.isPinned)}>
                                {donor.isPinned ? <PinOff className="mr-2 h-4 w-4" /> : <Pin className="mr-2 h-4 w-4" />}
                                {donor.isPinned ? 'Unpin from Homepage' : 'Pin to Homepage'}
                            </DropdownMenuItem>
                           <DropdownMenuSeparator />
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
