

"use client";

import { useState, useEffect, useRef, ChangeEvent, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createUserWithEmailAndPassword, updatePassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs, or } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { CalendarIcon, Droplet, User, Upload, Loader2 } from 'lucide-react';
import { format, addYears } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { bloodGroups, locations, upazilas } from '@/lib/location-data';
import type { Donor } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import IK from 'imagekit-javascript';


const signupSchema = z.object({
  fullName: z.string().min(3, { message: 'Full name is required.' }),
  email: z.string().email({ message: 'Invalid email address.' }).optional().or(z.literal('')),
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
  profilePictureUrl: z.string().optional(),
});

const imagekit = new IK({
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || 'public_mZ0R0Fsxxuu72DflLr4kGejkwrE=',
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/uekohag7w',
    authenticationEndpoint: '/api/imagekit-auth',
});


export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { user, loading } = useAuth();
  
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setProfileImageFile(file);
      // Create a URL for preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (values: z.infer<typeof signupSchema>) => {
    setIsLoading(true);

    try {
        // Step 1: Check if phone number or email already exists in Firestore
        const donorsRef = collection(db, 'donors');
        const queryConstraints = [];
        if (values.email) {
            queryConstraints.push(where('email', '==', values.email));
        }
        queryConstraints.push(where('phoneNumber', '==', values.phoneNumber));

        const q = query(donorsRef, or(...queryConstraints));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            toast({
                variant: 'destructive',
                title: 'Signup Failed',
                description: 'This phone number or email is already registered. Please try logging in.',
            });
            setIsLoading(false);
            return;
        }

        // --- If not exists, proceed with signup ---
        let finalProfilePictureUrl = '';
        // Use a temporary, strong, random password for initial creation.
        // User will be prompted to change it.
        const tempPassword = Math.random().toString(36).slice(-10) + 'A1!';
        const emailForAuth = values.email || `${values.phoneNumber}@rokto.dao`;


        if (profileImageFile) {
            const authResponse = await fetch('/api/imagekit-auth');
            if (!authResponse.ok) {
                throw new Error('Authentication failed for image upload.');
            }
            const authParams = await authResponse.json();
            const response = await imagekit.upload({
            ...authParams,
            file: profileImageFile,
            fileName: profileImageFile.name,
            useUniqueFileName: true,
            folder: '/roktodao/avatars/',
            });
            finalProfilePictureUrl = response.url;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, emailForAuth, tempPassword);
        const user = userCredential.user;

        const donorData: Omit<Donor, 'id'> = {
            uid: user.uid,
            fullName: values.fullName,
            email: values.email || null,
            bloodGroup: values.bloodGroup,
            phoneNumber: values.phoneNumber,
            address: {
            division: values.division,
            district: values.district,
            upazila: values.upazila,
            },
            lastDonationDate: values.lastDonationDate ? values.lastDonationDate.toISOString() : null,
            isAvailable: values.isAvailable,
            dateOfBirth: values.dateOfBirth?.toISOString(),
            gender: values.gender,
            donationCount: values.donationCount,
            profilePictureUrl: finalProfilePictureUrl,
            isVerified: false,
            isAdmin: false,
            createdAt: serverTimestamp(),
        };

        await setDoc(doc(db, 'donors', user.uid), donorData);

        // --- Send Welcome SMS and Admin Notification ---
        try {
            const welcomeMessage = `Welcome to RoktoDao, ${values.fullName}! Your account has been created successfully. You can now set your password in the profile section.`;
            // Fire and forget SMS
            fetch('/api/send-sms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ number: values.phoneNumber, message: welcomeMessage }),
            });

            // Fire and forget admin email
            fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
        } catch (notificationError) {
            console.error("Failed to send notifications:", notificationError);
            // Don't block user creation for notification failure
        }


        toast({
            title: 'Account Created Successfully!',
            description: "Welcome to RoktoDao. Please log in to continue.",
        });
        // AuthProvider will handle redirect
    } catch (error: any) {
        const errorCode = error.code;
        let errorMessage = 'An unknown error occurred. Please try again.';
        if (errorCode === 'auth/email-already-in-use') {
            errorMessage = 'This phone number or email is already registered. Please try logging in.';
        } else if (error.message) {
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
  
  if (loading) {
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
          <CardTitle className="text-2xl font-headline">ডোনার হিসেবে যুক্ত হোন</CardTitle>
          <CardDescription>আপনার রক্তদাও অ্যাকাউন্ট এবং ডোনার প্রোফাইল তৈরি করুন</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex justify-center">
                    <FormItem>
                    <FormLabel className="sr-only">Profile Picture</FormLabel>
                    <FormControl>
                        <div className="relative w-32 h-32">
                            <Avatar className="h-full w-full border-4 border-muted">
                                <AvatarImage src={profileImageUrl} alt="Profile preview" />
                                <AvatarFallback>
                                    <User className="h-16 w-16 text-muted-foreground" />
                                </AvatarFallback>
                            </Avatar>
                            <button
                              type="button" 
                              onClick={() => fileInputRef.current?.click()}
                              className="absolute inset-0 bg-black/50 flex items-center justify-center text-white rounded-full opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                              disabled={isLoading}
                            >
                               <Upload className="h-8 w-8" />
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
                        </div>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            <FormLabel>ইমেইল (ঐচ্ছিক)</FormLabel>
                            <FormControl>
                            <Input placeholder="you@example.com" {...field} />
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
                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > addYears(new Date(), -18)} initialFocus />
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
                            {upazilaOptions.map(up => (
                                <SelectItem key={up.value} value={up.value}>{up.label}</SelectItem>
                            ))}
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
                            {isLoading ? (
                                <>
                                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                 অ্যাকাউন্ট তৈরি করা হচ্ছে...
                                </>
                               ) : 'অ্যাকাউন্ট তৈরি করুন এবং ডোনার হোন'}
                        </Button>
                    </div>
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
