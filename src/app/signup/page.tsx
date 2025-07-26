
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { CalendarIcon, Droplet } from 'lucide-react';
import { format, addYears } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { bloodGroups, locations, upazilas } from '@/lib/location-data';
import type { Donor } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';


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
  dateOfBirth: z.date({required_error: 'Date of birth is required.'}),
  gender: z.enum(['Male', 'Female', 'Other'], {required_error: 'Gender is required.'}),
  donationCount: z.coerce.number().optional(),
});

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { user, loading } = useAuth();


  useEffect(() => {
    if (!loading && user) {
      router.push('/profile');
    }
  }, [user, loading, router]);


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
      lastDonationDate: undefined,
      dateOfBirth: undefined,
      gender: undefined,
      donationCount: 0,
    },
  });
  
  const selectedDivision = form.watch('division');
  const selectedDistrict = form.watch('district');

  const districtOptions = selectedDivision 
    ? locations[selectedDivision as keyof typeof locations]?.districts.map(district => ({
        value: district,
        label: district,
      })).sort((a,b) => a.label.localeCompare(b.label, 'bn'))
    : [];

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
        isVerified: false,
        isAdmin: false,
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'donors', user.uid), donorData);

      // 3. Send email notification
      try {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'new_donor',
            data: {
              fullName: values.fullName,
              bloodGroup: values.bloodGroup,
              phoneNumber: values.phoneNumber,
              division: values.division,
              district: values.district,
              upazila: values.upazila,
            },
          }),
        });
      } catch (emailError) {
        console.error("Could not send notification email:", emailError);
        // Don't block user flow if email fails
      }


      toast({
        title: 'Account Created Successfully!',
        description: "Welcome to RoktoDao. Your donor profile is active.",
      });
      router.push('/profile'); // Redirect to profile page for viewing/editing in future

    } catch (error: any) {
      const errorCode = error.code;
      let errorMessage = 'An unknown error occurred.';
      if (errorCode === 'auth/email-already-in-use') {
        errorMessage = 'This email address is already in use. Please use a different email.';
      } else {
        errorMessage = error.message;
      }
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
    if (loading || user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center bg-background p-4 py-12">
      <Card className="w-full max-w-3xl shadow-xl">
        <CardHeader className="text-center">
          <Droplet className="mx-auto h-12 w-12 text-primary" />
          <CardTitle className="text-2xl font-headline">জীবন রক্ষাকারী হোন</CardTitle>
          <CardDescription>আপনার রক্তবন্ধু অ্যাকাউন্ট এবং ডোনার প্রোফাইল তৈরি করুন</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <FormField control={form.control} name="fullName" render={({ field }) => (
                <FormItem>
                  <FormLabel>পুরো নাম</FormLabel>
                  <FormControl><Input placeholder="আপনার সম্পূর্ণ নাম" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
               <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                <FormItem>
                  <FormLabel>ফোন নম্বর</FormLabel>
                  <FormControl><Input placeholder="01XXXXXXXXX" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ইমেইল</FormLabel>
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
                    <FormLabel>পাসওয়ার্ড</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField control={form.control} name="bloodGroup" render={({ field }) => (
                <FormItem>
                  <FormLabel>রক্তের গ্রুপ</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="রক্তের গ্রুপ নির্বাচন করুন" /></SelectTrigger></FormControl>
                    <SelectContent>{bloodGroups.map(group => <SelectItem key={group} value={group}>{group}</SelectItem>)}</SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
                <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>জন্ম তারিখ</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                            {field.value ? format(field.value, "PPP") : <span>একটি তারিখ নির্বাচন করুন</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} captionLayout="dropdown-buttons" fromYear={1950} toYear={new Date().getFullYear() - 18} disabled={(date) => date > addYears(new Date(), -18) || date.getFullYear() < 1920} initialFocus />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                    </FormItem>
                )} />

              <FormField control={form.control} name="lastDonationDate" render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>সর্বশেষ রক্তদানের তারিখ (ঐচ্ছিক)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                          {field.value ? format(field.value, "PPP") : <span>একটি তারিখ নির্বাচন করুন</span>}
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
                  <FormLabel>লিঙ্গ</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="লিঙ্গ নির্বাচন করুন" /></SelectTrigger></FormControl>
                    <SelectContent>{['Male', 'Female', 'Other'].map(gender => <SelectItem key={gender} value={gender}>{gender}</SelectItem>)}</SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
               <FormField control={form.control} name="division" render={({ field }) => (
                <FormItem>
                  <FormLabel>বিভাগ</FormLabel>
                  <Select onValueChange={(value) => { field.onChange(value); form.setValue('district', ''); form.setValue('upazila', ''); }} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="বিভাগ নির্বাচন করুন" /></SelectTrigger></FormControl>
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
                    <FormLabel>জেলা</FormLabel>
                    <Select onValueChange={(value) => { field.onChange(value); form.setValue('upazila', ''); }} value={field.value} disabled={!selectedDivision}>
                        <FormControl><SelectTrigger><SelectValue placeholder="জেলা নির্বাচন করুন" /></SelectTrigger></FormControl>
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
                  <FormLabel>উপজেলা / এলাকা</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={!selectedDistrict}>
                    <FormControl><SelectTrigger><SelectValue placeholder="উপজেলা নির্বাচন করুন" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {selectedDistrict && upazilas[selectedDistrict as keyof typeof upazilas]?.map(up => <SelectItem key={up} value={up}>{up}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
                 <FormField control={form.control} name="donationCount" render={({ field }) => (
                    <FormItem>
                    <FormLabel>মোট রক্তদান (ঐচ্ছিক)</FormLabel>
                    <FormControl><Input type="number" min="0" placeholder="যেমন, ৫" {...field} value={field.value || ''} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )} />
              <FormField control={form.control} name="isAvailable" render={({ field }) => (
                  <FormItem className="md:col-span-2 flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                      <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      <div className="space-y-1 leading-none">
                          <FormLabel>এখন রক্ত দিতে আগ্রহী</FormLabel>
                          <FormMessage />
                      </div>
                  </FormItem>
              )} />
              <div className="md:col-span-2">
                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                    {isLoading ? 'অ্যাকাউন্ট তৈরি করা হচ্ছে...' : 'অ্যাকাউন্ট তৈরি করুন এবং ডোনার হোন'}
                </Button>
              </div>
            </form>
          </Form>
          <div className="mt-6 text-center text-sm">
            ইতিমধ্যে একটি অ্যাকাউন্ট আছে?{' '}
            <Link href="/login" className="underline hover:text-primary">
              লগইন করুন
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
