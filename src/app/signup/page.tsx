"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { CalendarIcon, HeartHandshake } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { bloodGroups, locations, upazilas } from '@/lib/location-data';
import type { Donor } from '@/lib/types';

const signupSchema = z.object({
  fullName: z.string().min(3, { message: 'Full name is required.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
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
});

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      bloodGroup: '',
      phoneNumber: '',
      division: '',
      district: '',
      upazila: '',
      isAvailable: true,
    },
  });
  
  const selectedDivision = form.watch('division');
  const selectedDistrict = form.watch('district');

  const onSubmit = async (values: z.infer<typeof signupSchema>) => {
    setIsLoading(true);
    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      // 2. Create donor profile in Firestore
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
        dateOfBirth: values.dateOfBirth?.toISOString(),
        gender: values.gender,
        donationCount: values.donationCount,
      };

      await setDoc(doc(db, 'donors', user.uid), donorData);

      toast({
        title: 'Account Created Successfully!',
        description: "Welcome to RoktoBondhu. Your donor profile is active.",
      });
      router.push('/profile'); // Redirect to profile page for viewing/editing in future

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: error.message || 'An unknown error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center bg-background p-4 py-12">
      <Card className="w-full max-w-3xl shadow-xl">
        <CardHeader className="text-center">
          <HeartHandshake className="mx-auto h-12 w-12 text-primary" />
          <CardTitle className="text-2xl font-headline">Become a Lifesaver</CardTitle>
          <CardDescription>Create your RoktoBondhu account and donor profile</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <FormField control={form.control} name="fullName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl><Input placeholder="Your full name" {...field} /></FormControl>
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
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date()} initialFocus />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                    </FormItem>
                )} />

              <FormField control={form.control} name="lastDonationDate" render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Last Donation Date (Optional)</FormLabel>
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
              <FormField control={form.control} name="district" render={({ field }) => (
                <FormItem>
                  <FormLabel>District</FormLabel>
                  <Select onValueChange={(value) => { field.onChange(value); form.setValue('upazila', ''); }} value={field.value} disabled={!selectedDivision}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {selectedDivision && locations[selectedDivision as keyof typeof locations]?.districts.map(dist => <SelectItem key={dist} value={dist}>{dist}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="upazila" render={({ field }) => (
                <FormItem>
                  <FormLabel>Upazila / Area</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={!selectedDistrict}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select upazila" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {selectedDistrict && upazilas[selectedDistrict as keyof typeof upazilas]?.map(up => <SelectItem key={up} value={up}>{up}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
                 <FormField control={form.control} name="donationCount" render={({ field }) => (
                    <FormItem>
                    <FormLabel>Donation Count (Optional)</FormLabel>
                    <FormControl><Input type="number" min="0" placeholder="e.g., 5" {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )} />
              <FormField control={form.control} name="isAvailable" render={({ field }) => (
                  <FormItem className="md:col-span-2 flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                      <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      <div className="space-y-1 leading-none">
                          <FormLabel>Available to Donate Blood</FormLabel>
                          <FormMessage />
                      </div>
                  </FormItem>
              )} />
              <div className="md:col-span-2">
                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                    {isLoading ? 'Creating Account...' : 'Create Account & Become a Donor'}
                </Button>
              </div>
            </form>
          </Form>
          <div className="mt-6 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="underline hover:text-primary">
              Log in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
