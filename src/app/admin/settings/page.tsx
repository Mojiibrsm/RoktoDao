

"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Bell, Wrench, Loader2, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AdminSettingsPage() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    const [siteName, setSiteName] = useState("RoktoDao");
    const [tagline, setTagline] = useState("রক্ত দিন, জীবন বাঁচান — এখন আরও সহজে!");
    const [adminEmail, setAdminEmail] = useState("mojibrsm@gmail.com");
    const [publicTotalDonors, setPublicTotalDonors] = useState(0);
    const [notifyNewDonor, setNotifyNewDonor] = useState(true);
    const [notifyNewRequest, setNotifyNewRequest] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('settings')
                    .select('*')
                    .eq('id', 'global')
                    .single();

                if (error && error.code !== 'PGRST116') throw error; // PGRST116: row not found

                if (data) {
                    setSiteName(data.siteName || "RoktoDao");
                    setTagline(data.tagline || "রক্ত দিন, জীবন বাঁচান — এখন আরও সহজে!");
                    setAdminEmail(data.adminEmail || "mojibrsm@gmail.com");
                    setPublicTotalDonors(data.publicTotalDonors || 0);
                    setNotifyNewDonor(data.notifyNewDonor !== false);
                    setNotifyNewRequest(data.notifyNewRequest !== false);
                }
            } catch (error: any) {
                console.error("Error fetching settings:", error);
                toast({
                    variant: 'destructive',
                    title: "Error",
                    description: "Could not fetch settings.",
                });
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, [toast]);

    const handleSaveChanges = async () => {
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('settings')
                .upsert({
                    id: 'global',
                    siteName,
                    tagline,
                    adminEmail,
                    publicTotalDonors,
                    notifyNewDonor,
                    notifyNewRequest
                }, { onConflict: 'id' });

            if (error) throw error;
            
            toast({
                title: "Settings Saved",
                description: "Your changes have been successfully saved.",
            });
        } catch (error: any) {
             console.error("Error saving settings:", error);
            toast({
                variant: 'destructive',
                title: "Error",
                description: `Could not save settings: ${error.message}`,
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
             <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
             </div>
        );
    }

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
                    <div className="space-y-2">
                        <Label htmlFor="public-total-donors">Public Total Donors</Label>
                        <Input id="public-total-donors" type="number" value={publicTotalDonors} onChange={(e) => setPublicTotalDonors(Number(e.target.value))} />
                        <p className="text-sm text-muted-foreground">This number will be shown on the homepage as the total donor count.</p>
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
                        <Switch checked={notifyNewDonor} onCheckedChange={setNotifyNewDonor} />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                            <h3 className="font-medium">New Blood Request</h3>
                            <p className="text-sm text-muted-foreground">Send an email to admin when a new blood request is submitted.</p>
                        </div>
                        <Switch checked={notifyNewRequest} onCheckedChange={setNotifyNewRequest} />
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button onClick={handleSaveChanges} size="lg" disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </div>
    );
}

    