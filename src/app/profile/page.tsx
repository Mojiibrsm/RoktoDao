"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
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
import { CalendarIcon, Check, ChevronsUpDown } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { bloodGroups, locations, upazilas } from '@/lib/location-data';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Donor } from '@/lib/types';


const profileSchema = z.object({
  fullName: z.string().min(3, { message: 'Full name is required.' }),
  bloodGroup: z.string({ required_error: 'Blood group is required.' }),
  phoneNumber: z.string().min(11, { message: 'A valid phone number is required.' }),
  division: z.string({ required_error: 'Division is required.' }),
  district: z.string({ required_error: 'District is required.' }),
  upazila: z.string({ required_error: 'Upazila is required.' }),
  lastDonationDate: z.date().optional(),
  isAvailable: z.boolean().default(true),
});

export default function ProfilePage() {
  const { user, donorProfile, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      isAvailable: true,
    },
  });
  
  const selectedDivision = form.watch('division');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (donorProfile) {
        form.reset({
            ...donorProfile,
            division: donorProfile.address.division,
            district: donorProfile.address.district,
            upazila: donorProfile.address.upazila,
            lastDonationDate: donorProfile.lastDonationDate ? new Date(donorProfile.lastDonationDate) : undefined,
        });
    }
  }, [user, donorProfile, loading, router, form]);
  
  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    setIsSubmitting(true);
    const donorData: Omit<Donor, 'id'> = {
      uid: user.uid,
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
    };

    try {
      await setDoc(doc(db, 'donors', user.uid), donorData);
      toast({
        title: 'Profile Updated',
        description: 'Your information has been saved successfully.',
      });
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

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-primary">
            {donorProfile ? 'Update Your Profile' : 'Become a Donor'}
          </CardTitle>
          <CardDescription>
            {donorProfile ? 'Keep your information up to date.' : 'Fill out the form to become a lifesaver.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField control={form.control} name="fullName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
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
              <FormField control={form.control} name="bloodGroup" render={({ field }) => (
                <FormItem>
                  <FormLabel>Blood Group</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select blood group" /></SelectTrigger></FormControl>
                    <SelectContent>{bloodGroups.map(group => <SelectItem key={group} value={group}>{group}</SelectItem>)}</SelectContent>
                  </Select>
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
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date()} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )} />
               <FormField control={form.control} name="division" render={({ field }) => (
                <FormItem>
                  <FormLabel>Division</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select division" /></SelectTrigger></FormControl>
                    <SelectContent>{Object.keys(locations).map(div => <SelectItem key={div} value={div}>{div}</SelectItem>)}</SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="district" render={({ field }) => (
                <FormItem>
                  <FormLabel>District</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedDivision}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger></FormControl>
                    <SelectContent>{selectedDivision && locations[selectedDivision as keyof typeof locations]?.districts.map(dist => <SelectItem key={dist} value={dist}>{dist}</SelectItem>)}</SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="upazila" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Upazila / Area</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select upazila" /></SelectTrigger></FormControl>
                    <SelectContent>{Object.entries(upazilas).flatMap(([dist, ups]) => ups.map(up => <SelectItem key={up} value={up}>{up}</SelectItem>))}</SelectContent>
                  </Select>
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
