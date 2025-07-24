
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
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
} from "@/components/ui/alert-dialog";
import { Trash2, Bell, Wrench } from 'lucide-react';

export default function AdminSettingsPage() {
    const { toast } = useToast();
    const [siteName, setSiteName] = useState("RoktoDao");
    const [tagline, setTagline] = useState("রক্ত দিন, জীবন বাঁচান — এখন আরও সহজে!");
    const [adminEmail, setAdminEmail] = useState("admin@roktodao.com");

    const handleSaveChanges = () => {
        toast({
            title: "Settings Saved",
            description: "Your changes have been successfully saved.",
        });
    };

    const handleClearRequests = () => {
        toast({
            variant: "destructive",
            title: "Action Triggered",
            description: "All blood requests would be cleared (logic not implemented).",
        });
    };
    
     const handleClearDonors = () => {
        toast({
            variant: "destructive",
            title: "Action Triggered",
            description: "Old donor records would be cleared (logic not implemented).",
        });
    };

    return (
        <div className="space-y-8">
            <header className="py-4">
                <h1 className="text-2xl font-bold tracking-tight text-primary md:text-3xl font-headline">
                    Settings
                </h1>
                <p className="text-muted-foreground">Manage site-level settings and configurations.</p>
            </header>

            {/* General Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Wrench /> General Settings</CardTitle>
                    <CardDescription>Manage basic information for your site.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="site-name">Site Name</Label>
                        <Input id="site-name" value={siteName} onChange={(e) => setSiteName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="tagline">Tagline</Label>
                        <Input id="tagline" value={tagline} onChange={(e) => setTagline(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="admin-email">Admin Email</Label>
                        <Input id="admin-email" type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} />
                        <p className="text-sm text-muted-foreground">Email for receiving system notifications.</p>
                    </div>
                </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Bell /> Notification Settings</CardTitle>
                    <CardDescription>Configure notifications for admin users.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                            <h3 className="font-medium">New Donor Registration</h3>
                            <p className="text-sm text-muted-foreground">Send an email to admin when a new donor signs up.</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                            <h3 className="font-medium">New Blood Request</h3>
                            <p className="text-sm text-muted-foreground">Send an email to admin when a new blood request is submitted.</p>
                        </div>
                        <Switch />
                    </div>
                </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive">
                <CardHeader>
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                    <CardDescription>These actions are permanent and cannot be undone.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                            <h3 className="font-medium">Clear All Blood Requests</h3>
                            <p className="text-sm text-muted-foreground">This will permanently delete all pending and fulfilled requests.</p>
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">Clear Requests</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete all blood requests from the database.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleClearRequests} className="bg-destructive hover:bg-destructive/90">
                                    Yes, clear all requests
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                            <h3 className="font-medium">Clear Old Donor Records</h3>
                            <p className="text-sm text-muted-foreground">Delete donor accounts that have been inactive for more than 2 years.</p>
                        </div>
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" >Clear Donors</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                   This action cannot be undone. This will permanently delete old and inactive donor profiles.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleClearDonors} className="bg-destructive hover:bg-destructive/90">
                                    Yes, clear old records
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button onClick={handleSaveChanges} size="lg">Save Changes</Button>
            </div>
        </div>
    );
}
