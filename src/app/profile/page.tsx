
"use client";

import { useEffect, useState, useMemo, Suspense, useRef, ChangeEvent } from 'react';
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
import { CalendarIcon, User, Upload, KeyRound, Droplet, List, ShieldCheck, PlusCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { bloodGroups, locations, upazilas } from '@/lib/location-data';
import { supabase } from '@/lib/supabase';
import type { Donor, BloodRequest } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import IK from 'imagekit-javascript';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RequestCard from '@/components/request-card';
import Link from 'next/link';

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
  profilePictureUrl: z.string().optional(),
});

const passwordSchema = z.object({
    newPassword: z.string().min(6, { message: "Password must be at least 6 characters." }),
    confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
});


const imagekit = new IK({
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || 'public_mZ0R0Fsxxuu72DflLr4kGejkwrE=',
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/uekohag7w',
    authenticationEndpoint: '/api/imagekit-auth',
});


function ProfilePageComponent() {
  const { user, loading, isAdmin, donorProfile } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileToEdit, setProfileToEdit] = useState<Donor | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  
  const [uploading, setUploading] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [myRequests, setMyRequests] = useState<BloodRequest[]>([]);
  const [myDonations, setMyDonations] = useState<BloodRequest[]>([]);

  const userIdToEdit = searchParams.get('userId');

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '', bloodGroup: '', phoneNumber: '', division: '', district: '', upazila: '',
      isAvailable: true, lastDonationDate: undefined, dateOfBirth: undefined, gender: undefined,
      donationCount: 0, profilePictureUrl: '',
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
      resolver: zodResolver(passwordSchema),
      defaultValues: { newPassword: '', confirmPassword: '' },
  });


  const selectedDivision = profileForm.watch('division');
  const selectedDistrict = profileForm.watch('district');

  const districtOptions = useMemo(() => {
    if (!selectedDivision || !locations[selectedDivision as keyof typeof locations]) return [];
    return locations[selectedDivision as keyof typeof locations].districts.map(d => ({ value: d, label: d })).sort((a, b) => a.label.localeCompare(b.label, 'bn'));
  }, [selectedDivision]);

  const upazilaOptions = useMemo(() => {
    if (!selectedDistrict || !upazilas[selectedDistrict as keyof typeof upazilas]) return [];
    return upazilas[selectedDistrict as keyof typeof upazilas].map(u => ({ value: u, label: u })).sort((a, b) => a.label.localeCompare(b.label, 'bn'));
  }, [selectedDistrict]);

  const targetUid = useMemo(() => {
    if (isAdmin && userIdToEdit) return userIdToEdit;
    if (user) return user.id;
    return null;
  }, [userIdToEdit, isAdmin, user]);
  

  useEffect(() => {
    const loadProfileData = async () => {
        if (!targetUid) {
            if (!loading) router.push('/login');
            return;
        }

        setPageLoading(true);
        try {
            const { data: profileData, error: profileError } = await supabase.from('donors').select('*').eq('uid', targetUid).maybeSingle();
            if (profileError) throw profileError;

            const { data: requestsData, error: requestsError } = await supabase.from('requests').select('*').eq('uid', targetUid);
            if (requestsError) throw requestsError;
            
            try {
              const { data: userDonations, error: userDonationsError } = await supabase
                    .from('requests')
                    .select('*')
                    .contains('responders', [targetUid]);
                
                if (userDonationsError) throw userDonationsError;
                setMyDonations(userDonations || []);
            } catch (donationError) {
              console.warn("Could not fetch user donations, `responders` column might be missing or there was a network error:", donationError);
              setMyDonations([]);
            }

            setProfileToEdit(profileData as Donor | null);
            setMyRequests(requestsData || []);

            if (profileData) {
                setProfileImageUrl(profileData.profilePictureUrl || '');
                profileForm.reset({
                    fullName: profileData.fullName || '',
                    phoneNumber: profileData.phoneNumber || '',
                    bloodGroup: profileData.bloodGroup || '',
                    division: profileData.address?.division || '',
                    district: profileData.address?.district || '',
                    upazila: profileData.address?.upazila || '',
                    lastDonationDate: profileData.lastDonationDate ? new Date(profileData.lastDonationDate) : undefined,
                    isAvailable: profileData.isAvailable,
                    dateOfBirth: profileData.dateOfBirth ? new Date(profileData.dateOfBirth) : undefined,
                    gender: profileData.gender || undefined,
                    donationCount: profileData.donationCount || 0,
                    profilePictureUrl: profileData.profilePictureUrl || '',
                });
            } else if (!isAdmin) {
                console.warn("No donor profile found for logged-in user.");
            }

        } catch (e: any) {
            console.error(e);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch profile data.' });
        } finally {
            setPageLoading(false);
        }
    };

    if (!loading) {
        loadProfileData();
    }
}, [user, loading, router, targetUid, toast, isAdmin]);
  
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setProfileImageFile(file);
      setProfileImageUrl(URL.createObjectURL(file));
    }
  };

  const onProfileSubmit = async (values: z.infer<typeof profileSchema>) => {
    if (!targetUid) return;
    setIsSubmitting(true);
    let finalProfilePictureUrl = values.profilePictureUrl || '';
    try {
      if (profileImageFile) {
        const authParams = await (await fetch('/api/imagekit-auth')).json();
        const response = await imagekit.upload({ ...authParams, file: profileImageFile, fileName: profileImageFile.name, useUniqueFileName: true, folder: '/roktodao/avatars/' });
        finalProfilePictureUrl = response.url;
      }
      
      const donorData: Partial<Donor> = {
        fullName: values.fullName,
        bloodGroup: values.bloodGroup,
        phoneNumber: values.phoneNumber,
        address: {
          division: values.division,
          district: values.district,
          upazila: values.upazila,
        },
        isAvailable: values.isAvailable,
        lastDonationDate: values.lastDonationDate ? values.lastDonationDate.toISOString() : null,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.toISOString() : null,
        gender: values.gender ?? undefined,
        donationCount: values.donationCount ?? 0,
        profilePictureUrl: finalProfilePictureUrl ?? null,
      };

      const { error } = await supabase.from('donors').update(donorData).eq('uid', targetUid);
      if (error) throw error;
      
      toast({ title: 'Profile Updated', description: 'Your information saved successfully.' });
      if (isAdmin && userIdToEdit) router.push('/admin/donors');

    } catch (error) {
       toast({ variant: 'destructive', title: 'Update Failed', description: 'Something went wrong.' });
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const onPasswordSubmit = async (values: z.infer<typeof passwordSchema>) => {
      if (!user) {
          toast({ variant: "destructive", title: "You must be logged in." });
          return;
      }
      setIsSubmitting(true);
      try {
          const { error } = await supabase.auth.updateUser({ password: values.newPassword });
          if(error) throw error;
          toast({ title: "Password Updated", description: "Your password has been changed successfully." });
          passwordForm.reset();
      } catch (error: any) {
          toast({ variant: "destructive", title: "Update Failed", description: error.message });
      } finally {
          setIsSubmitting(false);
      }
  };
  
  if (loading || pageLoading) {
    return <div className="flex h-screen items-center justify-center"><div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  }
  
  if (!user && !loading) {
     return <div className="flex h-screen items-center justify-center"><p>Redirecting to login...</p></div>;
  }


  return (
    <div className="container mx-auto max-w-5xl py-12 px-4">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="profile"><User className="mr-2 h-4 w-4" />প্রোফাইল</TabsTrigger>
            <TabsTrigger value="donations"><Droplet className="mr-2 h-4 w-4" />আমার ডোনেশন</TabsTrigger>
            <TabsTrigger value="requests"><List className="mr-2 h-4 w-4" />আমার অনুরোধ</TabsTrigger>
            <TabsTrigger value="security"><ShieldCheck className="mr-2 h-4 w-4" />নিরাপত্তা</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="shadow-lg mt-6">
            <CardHeader>
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="relative">
                    <Avatar className="h-32 w-32 border-4 border-muted">
                        <AvatarImage src={profileImageUrl || undefined} alt={profileForm.watch('fullName')} />
                        <AvatarFallback><User className="h-16 w-16 text-muted-foreground" /></AvatarFallback>
                    </Avatar>
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/50 flex items-center justify-center text-white rounded-full opacity-0 hover:opacity-100 transition-opacity cursor-pointer" disabled={isSubmitting}>
                        <Upload className="h-8 w-8" />
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-headline text-primary">{isAdmin && userIdToEdit ? `Editing ${profileToEdit?.fullName || 'Donor'}` : 'Update Profile'}</CardTitle>
                  <CardDescription>{isAdmin && userIdToEdit ? 'Update donor information below.' : 'Keep your information up to date.'}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <FormField control={profileForm.control} name="fullName" render={({ field }) => ( <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                     <FormField control={profileForm.control} name="phoneNumber" render={({ field }) => ( <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                     <FormField control={profileForm.control} name="bloodGroup" render={({ field }) => ( <FormItem><FormLabel>Blood Group</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{bloodGroups.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )} />
                     <FormField control={profileForm.control} name="dateOfBirth" render={({ field }) => ( 
                        <FormItem className="flex flex-col"><FormLabel>Date of Birth</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button variant="outline" className={cn(!field.value && "text-muted-foreground")}>
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {field.value ? format(field.value, "PPP") : <span>Pick date</span>}
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar 
                                        mode="single" 
                                        selected={field.value} 
                                        onSelect={field.onChange} 
                                        captionLayout="dropdown-buttons"
                                        fromYear={1950}
                                        toYear={new Date().getFullYear()}
                                        initialFocus 
                                    />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem> 
                     )} />
                     <FormField control={profileForm.control} name="lastDonationDate" render={({ field }) => ( <FormItem className="flex flex-col"><FormLabel>Last Donation Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className={cn(!field.value && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, "PPP") : <span>Pick date</span>}</Button></FormControl></PopoverTrigger><PopoverContent><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover><FormMessage /></FormItem> )} />
                     <FormField control={profileForm.control} name="gender" render={({ field }) => ( <FormItem><FormLabel>Gender</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{['Male', 'Female', 'Other'].map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )} />
                     <FormField control={profileForm.control} name="division" render={({ field }) => ( <FormItem><FormLabel>Division</FormLabel><Select onValueChange={v => {field.onChange(v); profileForm.setValue('district',''); profileForm.setValue('upazila','')}} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{Object.keys(locations).map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )} />
                     <FormField control={profileForm.control} name="district" render={({ field }) => ( <FormItem><FormLabel>District</FormLabel><Select onValueChange={v => {field.onChange(v); profileForm.setValue('upazila','')}} value={field.value} disabled={!selectedDivision}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{districtOptions.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )} />
                     <FormField control={profileForm.control} name="upazila" render={({ field }) => ( <FormItem><FormLabel>Upazila</FormLabel><Select onValueChange={field.onChange} value={field.value} disabled={!selectedDistrict}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{upazilaOptions.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )} />
                     <FormField control={profileForm.control} name="donationCount" render={({ field }) => ( <FormItem><FormLabel>Donation Count</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )} />
                  </div>
                  <FormField control={profileForm.control} name="isAvailable" render={({ field }) => ( <FormItem className="flex items-center space-x-3 space-y-0 pt-4"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel>Available to Donate</FormLabel><FormMessage /></FormItem> )} />
                  <div className="text-right"><Button type="submit" size="lg" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Profile'}</Button></div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="donations">
            <Card className="mt-6"><CardHeader><CardTitle>আমার ডোনেশন</CardTitle><CardDescription>যেসব রক্তের অনুরোধে আপনি সাড়া দিয়েছেন।</CardDescription></CardHeader>
                <CardContent>
                    {myDonations.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {myDonations.map(req => <RequestCard key={req.id} req={req} />)}
                        </div>
                    ) : <p className="text-muted-foreground">আপনি এখনো কোনো অনুরোধে সাড়া দেননি।</p>}
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="requests">
            <Card className="mt-6"><CardHeader><CardTitle>আমার অনুরোধ</CardTitle><CardDescription>আপনার তৈরি করা রক্তের অনুরোধগুলো।</CardDescription></CardHeader>
                <CardContent>
                     {myRequests.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {myRequests.map(req => <RequestCard key={req.id} req={req} />)}
                        </div>
                    ) : (
                        <div className="text-center py-10 border-2 border-dashed rounded-lg">
                           <p className="text-muted-foreground mb-4">আপনি এখনো কোনো রক্তের অনুরোধ করেননি।</p>
                           <Button asChild>
                            <Link href="/request-blood">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                নতুন অনুরোধ করুন
                            </Link>
                           </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="security">
             <Card className="mt-6"><CardHeader><CardTitle>নিরাপত্তা</CardTitle><CardDescription>আপনার অ্যাকাউন্টের পাসওয়ার্ড পরিচালনা করুন।</CardDescription></CardHeader>
                <CardContent>
                    <Form {...passwordForm}>
                        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6 max-w-md">
                           <FormField control={passwordForm.control} name="newPassword" render={({ field }) => ( <FormItem><FormLabel>নতুন পাসওয়ার্ড</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem> )} />
                           <FormField control={passwordForm.control} name="confirmPassword" render={({ field }) => ( <FormItem><FormLabel>নতুন পাসওয়ার্ড নিশ্চিত করুন</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem> )} />
                           <div><Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'আপডেট হচ্ছে...' : 'পাসওয়ার্ড আপডেট করুন'}</Button></div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </TabsContent>

      </Tabs>
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
