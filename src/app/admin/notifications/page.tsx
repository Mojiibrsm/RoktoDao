"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { bloodGroups, locations } from '@/lib/location-data';
import { Send, Users, Locate, Droplet } from 'lucide-react';

export default function AdminNotificationsPage() {
    const [message, setMessage] = useState('');
    const [targetGroup, setTargetGroup] = useState('all');
    const [bloodGroup, setBloodGroup] = useState('');
    const [district, setDistrict] = useState('');
    const { toast } = useToast();

    const handleSendNotification = () => {
        if (!message) {
            toast({
                variant: 'destructive',
                title: 'Message is empty',
                description: 'Please write a message to send.',
            });
            return;
        }

        // Placeholder for sending logic
        console.log({
            message,
            targetGroup,
            bloodGroup,
            district
        });

        toast({
            title: 'Notification Sent!',
            description: 'Your message has been queued for delivery.',
        });

        // Reset form
        setMessage('');
    };

    return (
        <div>
            <header className="py-4">
                <h1 className="text-2xl font-bold tracking-tight text-primary md:text-3xl font-headline">
                    Notifications
                </h1>
                <p className="text-muted-foreground">Send SMS/Email notifications to donors.</p>
            </header>
            <Card>
                <CardHeader>
                    <CardTitle>Send Notification</CardTitle>
                    <CardDescription>Compose and send a message to your donor community.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="all" onValueChange={setTargetGroup} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="all">
                                <Users className="mr-2 h-4 w-4" />
                                All Donors
                            </TabsTrigger>
                            <TabsTrigger value="targeted">
                                <Locate className="mr-2 h-4 w-4" />
                                Targeted Donors
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="all" className="pt-4">
                            <p className="text-sm text-muted-foreground">
                                This message will be sent to all registered donors.
                            </p>
                        </TabsContent>
                        <TabsContent value="targeted" className="pt-4">
                             <Card className="p-4 bg-muted/50">
                                <CardDescription className="mb-4">
                                  Send a message to donors with a specific blood group or in a specific district.
                                </CardDescription>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="blood-group" className="flex items-center">
                                            <Droplet className="mr-2 h-4 w-4" />
                                            Blood Group (Optional)
                                        </Label>
                                        <Select value={bloodGroup} onValueChange={setBloodGroup}>
                                            <SelectTrigger id="blood-group">
                                                <SelectValue placeholder="Select blood group" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="">Any</SelectItem>
                                                {bloodGroups.map(group => <SelectItem key={group} value={group}>{group}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="district" className="flex items-center">
                                            <Locate className="mr-2 h-4 w-4" />
                                             District (Optional)
                                        </Label>
                                        <Select value={district} onValueChange={setDistrict}>
                                            <SelectTrigger id="district">
                                                <SelectValue placeholder="Select district" />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-60">
                                                 <SelectItem value="">Any</SelectItem>
                                                {Object.values(locations).flatMap(division => division.districts).sort((a,b) => a.localeCompare(b, 'bn')).map(dist => (
                                                    <SelectItem key={dist} value={dist}>{dist}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </Card>
                        </TabsContent>
                    </Tabs>
                    
                    <div className="mt-6 space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                            id="message"
                            placeholder="Write your notification message here..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={6}
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSendNotification} className="ml-auto">
                        <Send className="mr-2 h-4 w-4" />
                        Send Notification
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
