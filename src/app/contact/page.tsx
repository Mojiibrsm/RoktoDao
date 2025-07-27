
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import React, { useState } from 'react';

export default function ContactPage() {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        const form = event.target as HTMLFormElement;
        const formData = new FormData(form);
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const message = formData.get('message') as string;

        try {
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: 'contact_form',
                    data: { name, email, message },
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to send message.');
            }

            toast({
                title: "বার্তা পাঠানো হয়েছে!",
                description: "আপনার বার্তাটি আমরা পেয়েছি। শীঘ্রই আপনার সাথে যোগাযোগ করা হবে।",
            });
            form.reset();
        } catch (error) {
            console.error('Contact form error:', error);
            toast({
                variant: 'destructive',
                title: "ত্রুটি!",
                description: "বার্তা পাঠাতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

  return (
    <div className="bg-background">
      <section className="w-full bg-primary/10 py-20 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tighter text-primary md:text-6xl font-headline">
            যোগাযোগ করুন
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-lg text-foreground/80 md:text-xl">
            আপনার যেকোনো প্রশ্ন, মতামত বা পরামর্শ থাকলে আমাদের জানান। আমরা আপনার বার্তা শোনার জন্য প্রস্তুত।
          </p>
        </div>
      </section>

      <section className="container mx-auto py-16 md:py-24 px-4">
        <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
                <div>
                    <h2 className="text-3xl font-bold text-primary font-headline">আমাদের সাথে যোগাযোগ</h2>
                    <Separator className="my-4" />
                    <p className="text-muted-foreground leading-relaxed">
                        সরাসরি যোগাযোগ করতে বা আমাদের অফিসে আসতে নিচের তথ্য ব্যবহার করুন। আমরা আপনাকে সাহায্য করতে পারলে খুশি হব।
                    </p>
                </div>
                <div className="space-y-6">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                           <MapPin className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold">আমাদের ঠিকানা</h3>
                            <p className="text-muted-foreground">House: 25, Road: 10, Sector: 11, Uttara, Dhaka-1230</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                           <Mail className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold">ইমেইল করুন</h3>
                            <p className="text-muted-foreground">mojibrsm@gmail.com</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                           <Phone className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold">ফোন করুন</h3>
                            <p className="text-muted-foreground">+8801600151907</p>
                        </div>
                    </div>
                </div>
            </div>
            {/* Contact Form */}
            <div>
                <Card className="shadow-lg p-4 sm:p-6">
                    <CardHeader>
                        <CardTitle>আপনার বার্তা পাঠান</CardTitle>
                        <CardDescription>আমরা ২৪ ঘণ্টার মধ্যে উত্তর দেওয়ার চেষ্টা করব।</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">আপনার নাম</Label>
                                <Input id="name" name="name" placeholder="সম্পূর্ণ নাম" required />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="email">আপনার ইমেইল</Label>
                                <Input id="email" name="email" type="email" placeholder="you@example.com" required />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="message">আপনার বার্তা</Label>
                                <Textarea id="message" name="message" placeholder="আপনার বার্তা এখানে লিখুন..." required rows={5} />
                            </div>
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? 'পাঠানো হচ্ছে...' : 'বার্তা পাঠান'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
      </section>
    </div>
  );
}
