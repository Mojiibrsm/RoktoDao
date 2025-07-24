
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { CalendarIcon, CheckIcon, ChevronsUpDown } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { bloodGroups, locations, hospitalsByDistrict } from '@/lib/location-data';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { Checkbox } from '@/components/ui/checkbox';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';


const requestSchema = z.object({
  patientName: z.string().min(3, { message: 'Patient name is required.' }),
  bloodGroup: z.string({ required_error: 'Blood group is required.' }),
  numberOfBags: z.coerce.number().min(1, { message: 'At least 1 bag is required.' }),
  neededDate: z.date({ required_error: 'A date is required.' }),
  district: z.string().min(1, 'District is required'),
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
    );

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
      status: 'Pending',
    };

    try {
      await addDoc(collection(db, 'requests'), requestData);
      toast({
        title: 'অনুরোধ জমা দেওয়া হয়েছে',
        description: 'আপনার রক্তের অনুরোধ পোস্ট করা হয়েছে। আমরা আশা করি আপনি দ্রুত একজন দাতা খুঁজে পাবেন।',
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
    <div className="container mx-auto max-w-2xl py-12 px-4">
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
                  <FormItem className="flex flex-col">
                    <FormLabel>জেলা</FormLabel>
                     <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? districtOptions.find(
                                  (district) => district.value === field.value
                                )?.label
                              : "জেলা নির্বাচন করুন"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                           <CommandInput placeholder="জেলা খুঁজুন..." />
                            <CommandEmpty>কোন জেলা পাওয়া যায়নি।</CommandEmpty>
                          <CommandGroup>
                            {districtOptions.map((district) => (
                              <CommandItem
                                value={district.label}
                                key={district.value}
                                onSelect={() => {
                                  form.setValue("district", district.value)
                                  form.setValue('hospitalLocation', '');
                                }}
                              >
                                <CheckIcon
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    district.value === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {district.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
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
                           {availableHospitals.map(hospital => (
                            <SelectItem key={hospital} value={hospital}>{hospital}</SelectItem>
                           ))}
                           <SelectItem value="Other">অন্যান্য</SelectItem>
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
    </div>
  );
}

    