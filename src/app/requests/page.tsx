
"use client";

import { supabase } from '@/lib/supabase';
import type { BloodRequest, Donor } from '@/lib/types';
import { useEffect, useState } from 'react';
import RequestCard from '@/components/request-card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { format } from 'date-fns';

async function getAllRequests(): Promise<BloodRequest[]> {
  try {
    const { data: requests, error } = await supabase
      .from('requests')
      .select('*')
      .eq('status', 'Approved') // Fetch only approved requests
      .order('createdAt', { ascending: false });
    
    if (error) throw error;

    return requests.map(req => ({
      ...req,
      neededDate: format(new Date(req.neededDate), 'PPP'),
    })) as BloodRequest[];

  } catch (error) {
    console.error("Error fetching all requests:", error);
    return [];
  }
}

async function sendSms(number: string, message: string) {
    try {
        await fetch('/api/send-sms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ number, message }),
        });
    } catch (error) {
        console.error("Failed to call send-sms API:", error);
    }
}

async function sendEmail(payload: any) {
    try {
        await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
    } catch (error) {
        console.error("Failed to call send-email API:", error);
    }
}


export default function AllRequestsPage() {
  const [allRequests, setAllRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const { toast } = useToast();
  const { user, donorProfile } = useAuth();

  const fetchRequests = async () => {
      setLoading(true);
      const requests = await getAllRequests();
      setAllRequests(requests);
      setLoading(false);
  }

  useEffect(() => {
    fetchRequests();
  }, [])

  const handleCanDonate = async (request: BloodRequest) => {
    if (!user || !donorProfile) {
      toast({ variant: 'destructive', title: 'অনুগ্রহ করে সাড়া দেওয়ার জন্য লগইন করুন।' });
      return;
    }
    
    setRespondingId(request.id);

    try {
      const { data, error: fetchError } = await supabase
        .from('requests')
        .select('responders')
        .eq('id', request.id)
        .single();
      
      if(fetchError) throw fetchError;

      const currentResponders = data.responders || [];
      
      if (currentResponders.includes(user.id)) {
        toast({ title: 'ইতিমধ্যে সাড়া দিয়েছেন', description: 'আপনি এই অনুরোধে ইতিমধ্যে সাড়া দিয়েছেন।' });
        setRespondingId(null);
        return;
      }
      
      const { error: updateError } = await supabase
        .from('requests')
        .update({ responders: [...currentResponders, user.id] })
        .eq('id', request.id);

      if (updateError) throw updateError;
      
      // Send notifications in the background (don't await them)
      const smsMessage = `সুসংবাদ! ${donorProfile.fullName} (${donorProfile.bloodGroup}) আপনার ${request.bloodGroup} রক্তের অনুরোধে সাড়া দিয়েছেন। যোগাযোগ: ${donorProfile.phoneNumber}. - RoktoDao`;
      sendSms(request.contactPhone, smsMessage);
      
      sendEmail({
          type: 'donor_response',
          data: {
              request,
              donor: donorProfile,
          }
      });

      toast({ title: 'ধন্যবাদ!', description: 'আপনার সাড়া রেকর্ড করা হয়েছে। রোগী আপনার সাথে যোগাযোগ করতে পারেন।' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'ত্রুটি', description: `আপনার সাড়া রেকর্ড করা যায়নি: ${error.message}` });
    } finally {
        setRespondingId(null);
    }
  };

  return (
    <div className="bg-background">
      <section className="w-full bg-primary/10 py-20 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tighter text-primary md:text-6xl font-headline">
            সকল রক্তের অনুরোধ
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-lg text-foreground/80 md:text-xl">
            রক্তদানের জন্য সকল সক্রিয় অনুরোধ ব্রাউজ করুন। আপনার সাহায্য একটি জীবন বাঁচাতে পারে।
          </p>
        </div>
      </section>

      <section className="container mx-auto py-16 md:py-24 px-4">
        {loading ? (
             <div className="text-center py-16">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
                <p className="mt-4 text-muted-foreground">অনুরোধ লোড হচ্ছে...</p>
            </div>
        ) : allRequests.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {allRequests.map((req) => (
              <RequestCard 
                key={req.id} 
                req={req} 
                onRespond={handleCanDonate} 
                showRespondButton={true}
                isResponding={respondingId === req.id}
               />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground text-lg">এই মুহূর্তে কোনো সক্রিয় রক্তের অনুরোধ নেই।</p>
            <p className="text-sm text-muted-foreground/80 mt-2">পরে আবার দেখুন অথবা একজন ডোনার হয়ে নোটিফিকেশন পান!</p>
          </div>
        )}
      </section>
    </div>
  );
}
