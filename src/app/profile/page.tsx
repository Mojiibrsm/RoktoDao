
"use client";

import { useEffect, useState, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { CalendarIcon, User } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { bloodGroups, locations, upazilas } from '@/lib/location-data';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Donor } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const profileSchema = z.object({
  fullName: z.string().min(3, { message: 'Full name is required.' }),
  bloodGroup: z.string({ required_error: 'Blood group is required.' }).min(1, 'Blood group is required.'),
  phoneNumber: z.string().min(11, { message: 'A valid phone number is required.' }),
  division: z.string({ required_error: 'Division is required.' }).min(1, 'Division is required.'),
  district: z.string({ required_error: 'District is required.' }).min(1, 'District is required.'),
  upazila: z.string({ required_error: 'Upazila is required.' }).min(1, 'Upazila is required.'),
  lastDonationDate: z.date().optional(),
  isAvailable: z.boolean().default(true),
  dateOfBirth: z.date().optional(),
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
  donationCount: z.coerce.number().optional(),
  profilePictureUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
});

function ProfilePageComponent() {
  const { user, donorProfile: loggedInUserDonorProfile, loading, isAdmin } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileToEdit, setProfileToEdit] = useState<Donor | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  const userIdToEdit = searchParams.get('userId');

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      bloodGroup: '',
      phoneNumber: '',
      division: '',
      district: '',
      upazila: '',
      isAvailable: true,
      lastDonationDate: undefined,
      dateOfBirth: undefined,
      gender: undefined,
      donationCount: 0,
      profilePictureUrl: '',
    },
  });

  const selectedDivision = form.watch('division');
  const selectedDistrict = form.watch('district');

  const districtOptions = useMemo(() => {
    if (!selectedDivision || !locations[selectedDivision as keyof typeof locations]) {
      return [];
    }
    return locations[selectedDivision as keyof typeof locations].districts
      .map(district => ({
        value: district,
        label: district,
      }))
      .sort((a, b) => a.label.localeCompare(b.label, 'bn'));
  }, [selectedDivision]);

  const upazilaOptions = useMemo(() => {
    if (!selectedDistrict || !upazilas[selectedDistrict as keyof typeof upazilas]) {
      return [];
    }
    return upazilas[selectedDistrict as keyof typeof upazilas]
      .map(upazila => ({
        value: upazila,
        label: upazila,
      }))
      .sort((a, b) => a.label.localeCompare(b.label, 'bn'));
  }, [selectedDistrict]);

  useEffect(() => {
    const loadProfile = async () => {
      if (loading) return;
      if (!user) {
        router.push('/login');
        return;
      }

      setPageLoading(true);

      let targetProfile: Donor | null = null;

      if (userIdToEdit && isAdmin) {
        // Admin is editing another user
        try {
          const donorRef = doc(db, 'donors', userIdToEdit);
          const docSnap = await getDoc(donorRef);
          if (docSnap.exists()) {
            targetProfile = { id: docSnap.id, ...docSnap.data() } as Donor;
          } else {
            toast({ variant: 'destructive', title: 'Error', description: 'Donor profile not found.' });
            router.push('/admin/donors');
            return;
          }
        } catch (e) {
          toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch donor profile.' });
          router.push('/admin/donors');
          return;
        }
      } else {
        // Regular user editing their own profile
        targetProfile = loggedInUserDonorProfile;
      }

      setProfileToEdit(targetProfile);
      
      if (targetProfile) {
        form.reset({
            fullName: targetProfile.fullName || '',
            phoneNumber: targetProfile.phoneNumber || '',
            bloodGroup: targetProfile.bloodGroup || '',
            division: targetProfile.address?.division || '',
            district: targetProfile.address?.district || '',
            upazila: targetProfile.address?.upazila || '',
            lastDonationDate: targetProfile.lastDonationDate ? new Date(targetProfile.lastDonationDate) : undefined,
            isAvailable: targetProfile.isAvailable,
            dateOfBirth: targetProfile.dateOfBirth ? new Date(targetProfile.dateOfBirth) : undefined,
            gender: targetProfile.gender || undefined,
            donationCount: targetProfile.donationCount || 0,
            profilePictureUrl: targetProfile.profilePictureUrl || '',
        });
      }
      setPageLoading(false);
    };

    loadProfile();
  }, [user, loggedInUserDonorProfile, loading, router, form, userIdToEdit, isAdmin, toast]);
  
  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    let uidToUpdate: string | null | undefined;

    if (userIdToEdit && isAdmin) {
      uidToUpdate = userIdToEdit;
    } else if (user) {
      uidToUpdate = user.uid;
    }

    if (!uidToUpdate) {
        toast({ variant: 'destructive', title: 'Authentication Error', description: 'Could not determine user to update.' });
        return;
    }
    setIsSubmitting(true);
    const donorData: Partial<Donor> = {
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
      dateOfBirth: values.dateOfBirth?.toISOString(),
      gender: values.gender,
      donationCount: values.donationCount,
      profilePictureUrl: values.profilePictureUrl,
    };

    try {
      await setDoc(doc(db, 'donors', uidToUpdate), donorData, { merge: true });
      toast({
        title: 'Profile Updated',
        description: 'Your information has been saved successfully.',
      });
      if (isAdmin && userIdToEdit) {
        router.push('/admin/donors');
      }
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Something went wrong. Please try again.',
      });
    } finally {
        setIsSubmitting(false);
    }
  };
  
  if (loading || pageLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl font-headline text-primary">
                {profileToEdit ? 'Update Profile' : 'Become a Donor'}
              </CardTitle>
              <CardDescription>
                {profileToEdit ? 'Keep your information up to date.' : 'Fill out the form to become a lifesaver.'}
              </CardDescription>
            </div>
            <Avatar className="h-20 w-20">
              <AvatarImage src={form.watch('profilePictureUrl') || undefined} alt={form.watch('fullName')} />
              <AvatarFallback>
                <User className="h-10 w-10 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FormField control={form.control} name="fullName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl><Input placeholder="John Doe" {...field} value={field.value ?? ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl><Input placeholder="01XXXXXXXXX" {...field} value={field.value ?? ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="bloodGroup" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Blood Group</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select blood group" /></SelectTrigger></FormControl>
                      <SelectContent>{bloodGroups.map(group => <SelectItem key={group} value={group}>{group}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                  <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
                      <FormItem className="flex flex-col">
                      <FormLabel>Date of Birth</FormLabel>
                      <Popover>
                          <PopoverTrigger asChild>
                          <FormControl>
                              <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                          </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} captionLayout="dropdown-buttons" fromYear={1950} toYear={new Date().getFullYear()} disabled={(date) => date > new Date() || date.getFullYear() < 1920} initialFocus />
                          </PopoverContent>
                      </Popover>
                      <FormMessage />
                      </FormItem>
                  )} />

                <FormField control={form.control} name="lastDonationDate" render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Last Donation Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} captionLayout="dropdown-buttons" fromYear={1950} toYear={new Date().getFullYear()} disabled={(date) => date > new Date()} initialFocus />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )} />
              
              <FormField control={form.control} name="gender" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger></FormControl>
                      <SelectContent>{['Male', 'Female', 'Other'].map(gender => <SelectItem key={gender} value={gender}>{gender}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
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
                  <FormField control={form.control} name="donationCount" render={({ field }) => (
                      <FormItem>
                      <FormLabel>Previous Donation Count</FormLabel>
                      <FormControl><Input type="number" min="0" placeholder="e.g., 5" {...field} value={field.value ?? ''} /></FormControl>
                      <FormMessage />
                      </FormItem>
                  )} />
              </div>

               <FormField control={form.control} name="profilePictureUrl" render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Profile Picture URL</FormLabel>
                    <FormControl><Input placeholder="https://example.com/image.png" {...field} value={field.value ?? ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

              <FormField control={form.control} name="isAvailable" render={({ field }) => (
                  <FormItem className="md:col-span-2 flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                      <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      <div className="space-y-1 leading-none">
                          <FormLabel>Available to Donate</FormLabel>
                          <FormMessage />
                      </div>
                  </FormItem>
              )} />
              <div className="md:col-span-2 text-right">
                <Button type="submit" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save Profile'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}


export default function ProfilePage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>}>
            <ProfilePageComponent />
        </Suspense>
    )
}
