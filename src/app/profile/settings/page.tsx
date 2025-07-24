
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Shield, Bell, Power, Eye, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const settingsSchema = z.object({
  // Profile Settings
  fullName: z.string().min(3, "Full name is required."),
  
  // Notification Settings
  getBloodRequests: z.boolean().default(false),
  getEmailNotifications: z.boolean().default(true),
  getSmsAlerts: z.boolean().default(false),

  // Availability Settings
  isAvailable: z.boolean().default(true),

  // Privacy Settings
  contactVisibility: z.enum(['everyone', 'verified', 'hidden']).default('verified'),
  profileVisibility: z.enum(['public', 'admin', 'hidden']).default('public'),
});

export default function SettingsPage() {
  const { toast } = useToast();
  const { user, donorProfile } = useAuth();
  const router = useRouter();

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      fullName: donorProfile?.fullName || '',
      getBloodRequests: false,
      getEmailNotifications: true,
      getSmsAlerts: false,
      isAvailable: donorProfile?.isAvailable || true,
      contactVisibility: 'verified',
      profileVisibility: 'public',
    },
  });

  const onSubmit = (values: z.infer<typeof settingsSchema>) => {
    console.log(values);
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated.",
    });
  };

  const handlePasswordReset = () => {
    toast({
      title: "Password Reset Email Sent",
      description: "Check your inbox for instructions to reset your password.",
    });
    // Add Firebase sendPasswordResetEmail logic here
  };
  
  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4 space-y-8">
      <header>
          <h1 className="text-3xl font-bold font-headline text-primary">Settings</h1>
          <p className="text-muted-foreground">Manage your account and profile settings.</p>
      </header>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

          {/* Profile Settings Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User /> Profile Settings</CardTitle>
              <CardDescription>Update your personal information. Contact admin to change blood group.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={donorProfile?.profilePictureUrl || "https://placehold.co/200x200.png"} alt={donorProfile?.fullName || ''} data-ai-hint="placeholder person" />
                    <AvatarFallback>{donorProfile?.fullName?.[0]}</AvatarFallback>
                  </Avatar>
                  <Button type="button" variant="outline">Upload Photo</Button>
              </div>
               <FormField control={form.control} name="fullName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div>
                <Label>Blood Group</Label>
                <Input value={donorProfile?.bloodGroup} disabled />
              </div>
            </CardContent>
          </Card>

          {/* Account Settings Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Shield /> Account Settings</CardTitle>
              <CardDescription>Manage your account security and data.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input value={user?.email || ''} disabled />
              </div>
              <Button type="button" variant="outline" onClick={handlePasswordReset}>Change Password</Button>
               <Separator />
               <div className="space-y-2 rounded-lg border border-destructive p-4">
                 <h3 className="font-semibold text-destructive">Danger Zone</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Permanently delete your account and all associated data.</p>
                     <AlertDialog>
                      <AlertDialogTrigger asChild>
                         <Button type="button" variant="destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete Account</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction className="bg-destructive hover:bg-destructive/90">Delete Account</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
               </div>
            </CardContent>
          </Card>
          
           {/* Availability Settings Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Power /> Availability Settings</CardTitle>
              <CardDescription>Control when and how you are contacted for donations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="isAvailable" render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                    <FormLabel className="text-base">Available for Donation</FormLabel>
                    <FormDescription>Enable this if you are currently able to donate blood.</FormDescription>
                    </div>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
              )} />
            </CardContent>
          </Card>
          
          {/* Privacy Settings Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Eye /> Privacy Settings</CardTitle>
              <CardDescription>Manage who can see your profile and contact information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="contactVisibility"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Show Contact Info to</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select who can see your contact info" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="everyone">Everyone</SelectItem>
                          <SelectItem value="verified">Verified Requesters Only</SelectItem>
                          <SelectItem value="hidden">Admin Only</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="profileVisibility"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profile Visibility</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your profile visibility" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                           <SelectItem value="public">Public (Visible in Search)</SelectItem>
                           <SelectItem value="admin">Admin Only</SelectItem>
                           <SelectItem value="hidden">Hidden (Not searchable)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </CardContent>
          </Card>

          {/* Notification Settings Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Bell /> Notification Settings</CardTitle>
              <CardDescription>Choose which notifications you want to receive.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="getBloodRequests" render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                      <FormLabel className="text-base">Urgent Blood Requests</FormLabel>
                      <FormDescription>Get notified when someone in your area needs your blood group.</FormDescription>
                      </div>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  </FormItem>
              )} />
              <FormField control={form.control} name="getEmailNotifications" render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                      <FormLabel className="text-base">Email Notifications</FormLabel>
                      <FormDescription>Receive updates and newsletters via email.</FormDescription>
                      </div>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  </FormItem>
              )} />
               <FormField control={form.control} name="getSmsAlerts" render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                      <FormLabel className="text-base">SMS Alerts</FormLabel>
                      <FormDescription>Receive critical alerts via SMS (carrier charges may apply).</FormDescription>
                      </div>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  </FormItem>
              )} />
            </CardContent>
          </Card>
          
          <div className="flex justify-end">
            <Button type="submit" size="lg">Save All Settings</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

    

    