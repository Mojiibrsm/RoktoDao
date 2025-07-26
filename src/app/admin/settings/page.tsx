
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Bell, Wrench } from 'lucide-react';

export default function AdminSettingsPage() {
    const { toast } = useToast();
    const [siteName, setSiteName] = useState("RoktoDao");
    const [tagline, setTagline] = useState("রক্ত দিন, জীবন বাঁচান — এখন আরও সহজে!");
    const [adminEmail, setAdminEmail] = useState("mojibrsm@gmail.com");

    const handleSaveChanges = () => {
        // In a real app, you would save these to Firestore or a config file
        console.log("Saving settings:", { siteName, tagline, adminEmail });
        toast({
            title: "Settings Saved",
            description: "Your changes have been successfully saved.",
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
                    <CardDescription>Configure notifications for admin users. (Note: Backend for email sending is required for this to work).</CardDescription>
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

            <div className="flex justify-end">
                <Button onClick={handleSaveChanges} size="lg">Save Changes</Button>
            </div>
        </div>
    );
}
