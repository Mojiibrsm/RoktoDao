
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
import { CalendarIcon, ChevronsUpDown, Check } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { bloodGroups } from '@/lib/location-data';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { searchHospitals, HospitalSearchResult } from '@/ai/flows/search-hospitals-flow';
import { useDebounce } from 'use-debounce';

const requestSchema = z.object({
  patientName: z.string().min(3, { message: 'Patient name is required.' }),
  bloodGroup: z.string({ required_error: 'Blood group is required.' }),
  numberOfBags: z.coerce.number().min(1, { message: 'At least 1 bag is required.' }),
  neededDate: z.date({ required_error: 'A date is required.' }),
  hospitalLocation: z.string().min(5, { message: 'Hospital name and location are required.' }),
  contactPhone: z.string().min(11, { message: 'A valid contact number is required.' }),
});

export default function RequestBloodPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for hospital search combobox
  const [isHospitalPopoverOpen, setIsHospitalPopoverOpen] = useState(false);
  const [hospitalSearchQuery, setHospitalSearchQuery] = useState('');
  const [debouncedSearchQuery] = useDebounce(hospitalSearchQuery, 300);
  const [hospitalResults, setHospitalResults] = useState<HospitalSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);


  const form = useForm<z.infer<typeof requestSchema>>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      patientName: '',
      bloodGroup: '',
      numberOfBags: 1,
      hospitalLocation: '',
      contactPhone: '',
    }
  });

  useEffect(() => {
    if (debouncedSearchQuery.length > 2) {
      setIsSearching(true);
      searchHospitals(debouncedSearchQuery)
        .then(setHospitalResults)
        .catch(err => console.error("Error searching hospitals:", err))
        .finally(() => setIsSearching(false));
    } else {
      setHospitalResults([]);
    }
  }, [debouncedSearchQuery]);

  const onSubmit = async (values: z.infer<typeof requestSchema>) => {
    setIsSubmitting(true);
    
    const requestData = {
      ...values,
      neededDate: values.neededDate.toISOString(),
      uid: user?.uid, // Optional: associate request with user
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
  
  const currentHospitalValue = form.watch('hospitalLocation');

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
                name="hospitalLocation"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>হাসপাতালের নাম ও ঠিকানা</FormLabel>
                    <Popover open={isHospitalPopoverOpen} onOpenChange={setIsHospitalPopoverOpen}>
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
                           <span className="truncate">
                              {currentHospitalValue || "হাসপাতাল নির্বাচন করুন"}
                            </span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] p-0">
                        <Command>
                          <CommandInput 
                            placeholder="হাসপাতাল খুঁজুন..." 
                            value={hospitalSearchQuery}
                            onValueChange={setHospitalSearchQuery}
                          />
                          <CommandList>
                            {isSearching && <CommandEmpty>অনুসন্ধান করা হচ্ছে...</CommandEmpty>}
                            {!isSearching && hospitalResults.length === 0 && hospitalSearchQuery.length > 2 && <CommandEmpty>কোনো হাসপাতাল পাওয়া যায়নি।</CommandEmpty>}
                            <CommandGroup>
                              {hospitalResults.map((hospital, index) => (
                                <CommandItem
                                  value={hospital.title}
                                  key={`${hospital.title}-${index}`}
                                  onSelect={() => {
                                    form.setValue("hospitalLocation", hospital.title)
                                    setHospitalSearchQuery('');
                                    setHospitalResults([]);
                                    setIsHospitalPopoverOpen(false)
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      hospital.title === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  <div dangerouslySetInnerHTML={{ __html: hospital.title }} />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                           </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                     <FormMessage />
                  </FormItem>
                )}
              />

              <FormField control={form.control} name="contactPhone" render={({ field }) => (
                <FormItem>
                  <FormLabel>যোগাযোগের ফোন নম্বর</FormLabel>
                  <FormControl><Input placeholder="01XXXXXXXXX" {...field} /></FormControl>
                  <FormMessage />
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
