"use client";

import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { BloodRequest as BloodRequestType } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, Check, X, Trash2, CheckCheck, PlusCircle, AlertTriangle, Edit, Copy } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { bloodGroups, locations, hospitalsByDistrict } from '@/lib/location-data';
import { Checkbox } from '@/components/ui/checkbox';
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

type BloodRequest = BloodRequestType & { id: string };

const requestSchema = z.object({
  patientName: z.string().min(3, { message: 'Patient name is required.' }),
  bloodGroup: z.string({ required_error: 'Blood group is required.' }),
  numberOfBags: z.coerce.number().min(1, { message: 'At least 1 bag is required.' }),
  neededDate: z.date({ required_error: 'A date is required.' }),
  district: z.string().min(1, 'জেলা আবশ্যক'),
  hospitalLocation: z.string().min(1, { message: 'Hospital name is required.' }),
  otherHospital: z.string().optional(),
  contactPhone: z.string().min(11, { message: 'A valid contact number is required.' }),
  isEmergency: z.boolean().default(false).optional(),
}).refine(data => {
    if (data.hospitalLocation === 'Other') {
        return !!data.otherHospital && data.otherHospital.length > 0;
    }
    return true;
}, {
    message: 'Please specify the hospital name.',
    path: ['otherHospital'],
});


export default function AdminRequestsPage() {
    const [requests, setRequests] = useState<BloodRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(null);

    const form = useForm<z.infer<typeof requestSchema>>({
        resolver: zodResolver(requestSchema),
        defaultValues: {
            patientName: '',
            bloodGroup: '',
            numberOfBags: 1,
            hospitalLocation: '',
            otherHospital: '',
            contactPhone: '',
            district: '',
            isEmergency: false,
        }
    });

    const selectedDistrict = form.watch('district');
    const selectedHospital = form.watch('hospitalLocation');

    const [availableHospitals, setAvailableHospitals] = useState<string[]>([]);
    
    useEffect(() => {
        if (selectedDistrict && hospitalsByDistrict[selectedDistrict]) {
          setAvailableHospitals(hospitalsByDistrict[selectedDistrict]);
        } else {
          const allHospitals = Object.values(hospitalsByDistrict).flat().sort((a, b) => a.localeCompare(b, 'bn'));
          setAvailableHospitals(allHospitals);
        }
    }, [selectedDistrict]);

    const districtOptions = Object.keys(locations).flatMap(division => 
        locations[division as keyof typeof locations].districts.map(district => ({
            value: district,
            label: district,
        }))
    ).sort((a,b) => a.label.localeCompare(b.label, 'bn'));

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

    const handleAddRequest = async (values: z.infer<typeof requestSchema>) => {
        const finalHospitalName = values.hospitalLocation === 'Other' ? values.otherHospital : values.hospitalLocation;
        const requestData = {
          patientName: values.patientName,
          bloodGroup: values.bloodGroup,
          numberOfBags: values.numberOfBags,
          neededDate: values.neededDate.toISOString(),
          district: values.district,
          hospitalLocation: finalHospitalName,
          contactPhone: values.contactPhone,
          status: 'Approved', // Requests added by admin are pre-approved
          isEmergency: values.isEmergency,
        };
    
        try {
          await addDoc(collection(db, 'requests'), requestData);
          toast({
            title: 'Request Added',
            description: 'The new blood request has been successfully created.',
          });
          fetchRequests();
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
    
    const handleEditRequest = async (values: z.infer<typeof requestSchema>) => {
        if (!selectedRequest) return;
        
        const finalHospitalName = values.hospitalLocation === 'Other' ? values.otherHospital : values.hospitalLocation;
        const requestData = {
          patientName: values.patientName,
          bloodGroup: values.bloodGroup,
          numberOfBags: values.numberOfBags,
          neededDate: values.neededDate.toISOString(),
          district: values.district,
          hospitalLocation: finalHospitalName,
          contactPhone: values.contactPhone,
          isEmergency: values.isEmergency,
        };

        try {
            const requestRef = doc(db, 'requests', selectedRequest.id);
            await updateDoc(requestRef, requestData);
            toast({
                title: 'Request Updated',
                description: 'The request has been successfully updated.',
            });
            fetchRequests();
            setIsEditDialogOpen(false);
            setSelectedRequest(null);
            form.reset();
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Update Failed',
                description: 'Something went wrong. Please try again.',
            });
        }
    };

    const openEditDialog = (request: BloodRequest) => {
        setSelectedRequest(request);
        const hospitalInList = availableHospitals.includes(request.hospitalLocation);
        form.reset({
            patientName: request.patientName,
            bloodGroup: request.bloodGroup,
            numberOfBags: request.numberOfBags,
            neededDate: new Date(request.neededDate),
            district: request.district,
            hospitalLocation: hospitalInList ? request.hospitalLocation : 'Other',
            otherHospital: hospitalInList ? '' : request.hospitalLocation,
            contactPhone: request.contactPhone,
            isEmergency: request.isEmergency || false,
        });
        setIsEditDialogOpen(true);
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

    const RequestForm = ({ onSubmit, isSubmitting, submitText }: { onSubmit: (values: z.infer<typeof requestSchema>) => void; isSubmitting: boolean; submitText: string }) => {
        const [districtSearch, setDistrictSearch] = useState('');
        const [hospitalSearch, setHospitalSearch] = useState('');
        const [districtOpen, setDistrictOpen] = useState(false);
        const filteredDistricts = districtOptions.filter((d) =>
          d.label.toLowerCase().includes(districtSearch.toLowerCase())
        );

        return (
             <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-6">
                  <FormField control={form.control} name="patientName" render={({ field }) => (
                    <FormItem>
                    <FormLabel>Patient Name</FormLabel>
                    <FormControl><Input placeholder="Patient's Full Name" {...field} /></FormControl>
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
                    <FormField control={form.control} name="numberOfBags" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Bags Needed</FormLabel>
                        <FormControl><Input type="number" min="1" placeholder="e.g., 2" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )} />
                </div>
                <FormField control={form.control} name="neededDate" render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>Date Needed</FormLabel>
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
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date()} initialFocus />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                    </FormItem>
                )} />
                <FormField
                    control={form.control}
                    name="district"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>জেলা</FormLabel>
                        <Select
                           onValueChange={field.onChange}
                           value={field.value}
                           onSearch={setDistrictSearch}
                         >
                           <FormControl>
                             <SelectTrigger>
                               <SelectValue placeholder="জেলা নির্বাচন করুন" />
                             </SelectTrigger>
                           </FormControl>
                           <SelectContent>
                             <Input
                               className="mb-2"
                               placeholder="জেলা খুঁজুন..."
                               value={districtSearch}
                               onChange={(e) => setDistrictSearch(e.target.value)}
                             />
                             <SelectGroup>
                               <SelectLabel>সকল জেলা</SelectLabel>
                               {districtOptions
                                 .filter((d) =>
                                   d.label.toLowerCase().includes(districtSearch.toLowerCase())
                                 )
                                 .map((district) => (
                                   <SelectItem key={district.value} value={district.value}>
                                     {district.label}
                                   </SelectItem>
                                 ))}
                             </SelectGroup>
                           </SelectContent>
                         </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="hospitalLocation"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>হাসপাতালের নাম ও ঠিকানা</FormLabel>
                         <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="হাসপাতাল নির্বাচন করুন" /></SelectTrigger></FormControl>
                            <SelectContent>
                               <Input className="mb-2" placeholder="হাসপাতাল খুঁজুন..." value={hospitalSearch} onChange={(e) => setHospitalSearch(e.target.value)} />
                                <SelectGroup>
                                    <SelectLabel>সকল হাসপাতাল</SelectLabel>
                                    {availableHospitals.filter(h => h.toLowerCase().includes(hospitalSearch.toLowerCase())).map(hospital => (
                                    <SelectItem key={hospital} value={hospital}>{hospital}</SelectItem>
                                    ))}
                                    <SelectItem value="Other">অন্যান্য</SelectItem>
                               </SelectGroup>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                {selectedHospital === 'Other' && (
                    <FormField control={form.control} name="otherHospital" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Other Hospital Name</FormLabel>
                        <FormControl><Input placeholder="Please specify hospital name" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )} />
                )}
                <FormField control={form.control} name="contactPhone" render={({ field }) => (
                    <FormItem>
                    <FormLabel>Contact Phone</FormLabel>
                    <FormControl><Input placeholder="01XXXXXXXXX" {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )} />
                 <FormField control={form.control} name="isEmergency" render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        <div className="space-y-1 leading-none">
                            <FormLabel>এটি একটি জরুরি অনুরোধ?</FormLabel>
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

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Copied to clipboard!" });
    };

    const formatCopyText = (req: BloodRequest) => {
    return `🩸 জরুরী রক্তের আবেদন 🩸
রোগীর নামঃ ${req.patientName}
রক্তের গ্রুপঃ ${req.bloodGroup}
প্রয়োজনের তারিখঃ ${format(new Date(req.neededDate), "PPP")}
ব্যাগঃ ${req.numberOfBags}
হাসপাতালঃ ${req.hospitalLocation}, ${req.district}
যোগাযোগঃ ${req.contactPhone}`;
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
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>All Blood Requests</CardTitle>
                    <CardDescription>A list of all user-submitted blood requests.</CardDescription>
                  </div>
                   <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                      <DialogTrigger asChild>
                        <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Request</Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[625px]">
                        <DialogHeader>
                          <DialogTitle>Add New Blood Request</DialogTitle>
                          <DialogDescription>
                            Fill in the details below to add a new request to the system.
                          </DialogDescription>
                        </DialogHeader>
                         <RequestForm onSubmit={handleAddRequest} isSubmitting={form.formState.isSubmitting} submitText="Add Request" />
                      </DialogContent>
                    </Dialog>
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
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                         <TableRow>
                            <TableCell colSpan={8} className="text-center">Loading requests...</TableCell>
                        </TableRow>
                      ) : requests.map((req) => (
                        <TableRow key={req.id}>
                          <TableCell className="font-medium flex items-center gap-2">
                             {req.isEmergency && <AlertTriangle className="h-4 w-4 text-destructive" />}
                             {req.patientName}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-primary border-primary">
                              {req.bloodGroup}
                            </Badge>
                          </TableCell>
                          <TableCell>{req.hospitalLocation}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                                {req.contactPhone}
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCopy(req.contactPhone)}>
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                          </TableCell>
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
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCopy(formatCopyText(req))}>
                                    <Copy className="h-4 w-4" />
                                </Button>
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
                                       <DropdownMenuItem onClick={() => openEditDialog(req)}>
                                        <Edit className="mr-2 h-4 w-4" /> Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem onClick={() => handleUpdateStatus(req.id, 'Approved')}>
                                        <Check className="mr-2 h-4 w-4" /> Approve
                                      </DropdownMenuItem>
                                       <DropdownMenuItem onClick={() => handleUpdateStatus(req.id, 'Fulfilled')}>
                                        <CheckCheck className="mr-2 h-4 w-4" /> Mark as Fulfilled
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleUpdateStatus(req.id, 'Rejected')}>
                                        <X className="mr-2 h-4 w-4" /> Reject
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
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
                            </div>
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

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                 <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader>
                      <DialogTitle>Edit Blood Request</DialogTitle>
                      <DialogDescription>
                        Update the details of the blood request below.
                      </DialogDescription>
                    </DialogHeader>
                    {selectedRequest && <RequestForm onSubmit={handleEditRequest} isSubmitting={form.formState.isSubmitting} submitText="Update Request" />}
                  </DialogContent>
            </Dialog>
        </div>
    );
}
