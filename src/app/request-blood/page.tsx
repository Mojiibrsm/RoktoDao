"use client";

import { useState } from 'react';
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
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { bloodGroups } from '@/lib/location-data';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';

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

  const form = useForm<z.infer<typeof requestSchema>>({
    resolver: zodResolver(requestSchema),
  });

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
        title: 'Request Submitted',
        description: 'Your blood request has been posted. We hope you find a donor soon.',
      });
      router.push('/thank-you');
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: 'Something went wrong. Please try again.',
      });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl py-12 px-4">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-primary">Request Blood</CardTitle>
          <CardDescription>
            Fill out the form below to post an urgent blood request. Your request will be visible to potential donors.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField control={form.control} name="patientName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient Full Name</FormLabel>
                  <FormControl><Input placeholder="Patient Name" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                 <FormField control={form.control} name="numberOfBags" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Bags</FormLabel>
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
                        <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
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
              
              <FormField control={form.control} name="hospitalLocation" render={({ field }) => (
                <FormItem>
                  <FormLabel>Hospital Name & Location</FormLabel>
                  <FormControl><Input placeholder="e.g., Dhaka Medical College Hospital" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="contactPhone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Phone Number</FormLabel>
                  <FormControl><Input placeholder="01XXXXXXXXX" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="text-right">
                <Button type="submit" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Post Request'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
