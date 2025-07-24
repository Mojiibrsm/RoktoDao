
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { CalendarIcon, CheckIcon, ChevronsUpDown, AlertTriangle, Droplet, MapPin, Syringe, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { bloodGroups, locations, hospitalsByDistrict } from '@/lib/location-data';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { Checkbox } from '@/components/ui/checkbox';
import type { BloodRequest } from '@/lib/types';
import { Separator } from '@/components/ui/separator';


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


export default function RequestBloodPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentRequests, setRecentRequests] = useState<BloodRequest[]>([]);

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
  const [districtSearch, setDistrictSearch] = useState("");
  const [hospitalSearch, setHospitalSearch] = useState("");

   const fetchRecentRequests = async () => {
    try {
        const requestsRef = collection(db, 'requests');
        const q = query(requestsRef, orderBy('createdAt', 'desc'), limit(6));
        const querySnapshot = await getDocs(q);
        const requests = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        })) as BloodRequest[];
        setRecentRequests(requests);
    } catch (error) {
        console.error("Error fetching recent requests:", error);
    }
  };
  
  useEffect(() => {
    if (selectedDistrict && hospitalsByDistrict[selectedDistrict]) {
      setAvailableHospitals(hospitalsByDistrict[selectedDistrict]);
    } else {
      const allHospitals = Object.values(hospitalsByDistrict).flat().sort((a, b) => a.localeCompare(b, 'bn'));
      setAvailableHospitals(allHospitals);
    }
    form.setValue('hospitalLocation', '');
    fetchRecentRequests();
  }, [selectedDistrict, form]);

    const districtOptions = Object.keys(locations).flatMap(division => 
        locations[division as keyof typeof locations].districts.map(district => ({
            value: district,
            label: district,
        }))
    ).sort((a, b) => a.label.localeCompare(b.label, 'bn'));

  const onSubmit = async (values: z.infer<typeof requestSchema>) => {
    setIsSubmitting(true);
    
    const finalHospitalName = values.hospitalLocation === 'Other' ? values.otherHospital : values.hospitalLocation;

    const requestData = {
      patientName: values.patientName,
      bloodGroup: values.bloodGroup,
      numberOfBags: values.numberOfBags,
      neededDate: values.neededDate.toISOString(),
      district: values.district,
      hospitalLocation: finalHospitalName,
      contactPhone: values.contactPhone,
      uid: user?.uid,
      isEmergency: values.isEmergency,
      status: 'Approved',
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, 'requests'), requestData);
      toast({
        title: 'ধন্যবাদ!',
        description: 'আপনার রক্তের অনুরোধ সফলভাবে জমা দেওয়া হয়েছে।',
      });
      router.push('/thank-you');
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'জমা দিতে ব্যর্থ হয়েছে',
        description: 'কিছু একটা ভুল হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
      });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-primary">রক্তের জন্য অনুরোধ</CardTitle>
          <CardDescription>
            জরুরী রক্তের অনুরোধ পোস্ট করতে নীচের ফর্মটি পূরণ করুন। আপনার অনুরোধ সম্ভাব্য দাতাদের কাছে দৃশ্যমান হবে।
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField control={form.control} name="patientName" render={({ field }) => (
                <FormItem>
                  <FormLabel>রোগীর পুরো নাম</FormLabel>
                  <FormControl><Input placeholder="রোগীর নাম" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="bloodGroup" render={({ field }) => (
                  <FormItem>
                    <FormLabel>রক্তের গ্রুপ</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="রক্তের গ্রুপ নির্বাচন করুন" /></SelectTrigger></FormControl>
                      <SelectContent>{bloodGroups.map(group => <SelectItem key={group} value={group}>{group}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                 <FormField control={form.control} name="numberOfBags" render={({ field }) => (
                  <FormItem>
                    <FormLabel>ব্যাগের সংখ্যা</FormLabel>
                    <FormControl><Input type="number" min="1" placeholder="যেমন, ২" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

               <FormField control={form.control} name="neededDate" render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>প্রয়োজনের তারিখ</FormLabel>
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
                    <Select onValueChange={field.onChange} value={field.value}>
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
                           <Input className="mb-2" placeholder="হাসপাতাল খুঁজুন..." value={hospitalSearch} onChange={(e) => setHospitalSearch(e.target.value)}/>
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
                    <FormLabel>অন্যান্য হাসপাতালের নাম</FormLabel>
                    <FormControl><Input placeholder="হাসপাতালের নাম লিখুন" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              )}


              <FormField control={form.control} name="contactPhone" render={({ field }) => (
                <FormItem>
                  <FormLabel>যোগাযোগের ফোন নম্বর</FormLabel>
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

              <div className="text-right">
                <Button type="submit" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? 'জমা দেওয়া হচ্ছে...' : 'অনুরোধ পোস্ট করুন'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <section className="mt-16">
        <h2 className="text-3xl font-bold text-center mb-2 font-headline text-primary">সকল সক্রিয় অনুরোধ</h2>
        <Separator className="my-6" />
        {recentRequests.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recentRequests.map((req) => (
              <Card key={req.id} className="flex flex-col justify-between shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-start justify-between">
                    <span className="text-xl flex items-center gap-2">
                       {req.isEmergency && <AlertTriangle className="h-5 w-5 text-destructive" />}
                       {req.patientName}
                    </span>
                    <span className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-base font-bold text-primary">
                      <Droplet className="h-4 w-4" />
                      {req.bloodGroup}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <MapPin className="h-5 w-5 flex-shrink-0" />
                    <span>{`${req.hospitalLocation}, ${req.district}`}</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <CalendarIcon className="h-5 w-5 flex-shrink-0" />
                    <span>Needed by: {format(new Date(req.neededDate), "PPP")}</span>
                  </div>
                   <div className="flex items-center gap-3 text-muted-foreground">
                    <Phone className="h-5 w-5 flex-shrink-0" />
                    <span>Contact: {req.contactPhone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Syringe className="h-5 w-5 flex-shrink-0" />
                    <span>{req.numberOfBags} Bag(s)</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground text-lg">No active blood requests at the moment.</p>
          </div>
        )}
        <div className="mt-8 text-center">
            <Button asChild variant="outline">
                <a href="/requests">সকল অনুরোধ দেখুন</a>
            </Button>
        </div>
      </section>

    </div>
  );
}
