
"use client";

import { supabase } from '@/lib/supabase';
import type { BloodRequest } from '@/lib/types';
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

export default function AllRequestsPage() {
  const [allRequests, setAllRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchRequests = async () => {
      setLoading(true);
      const requests = await getAllRequests();
      setAllRequests(requests);
      setLoading(false);
  }

  useEffect(() => {
    fetchRequests();
  }, [])

  const handleCanDonate = async (requestId: string) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Please log in to respond.' });
      return;
    }
    try {
      // First, fetch the current responders
      const { data, error: fetchError } = await supabase
        .from('requests')
        .select('responders')
        .eq('id', requestId)
        .single();
      
      if(fetchError) throw fetchError;

      const currentResponders = data.responders || [];
      
      // Avoid adding duplicate UIDs
      if (currentResponders.includes(user.id)) {
        toast({ title: 'Already Responded', description: 'You have already responded to this request.' });
        return;
      }
      
      // Update with the new responder
      const { error: updateError } = await supabase
        .from('requests')
        .update({ responders: [...currentResponders, user.id] })
        .eq('id', requestId);

      if (updateError) throw updateError;
      
      toast({ title: 'Thank you!', description: 'Your response has been recorded. The patient may contact you.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: `Could not record your response: ${error.message}` });
    }
  };

  return (
    <div className="bg-background">
      <section className="w-full bg-primary/10 py-20 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tighter text-primary md:text-6xl font-headline">
            All Blood Requests
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-lg text-foreground/80 md:text-xl">
            Browse all active requests for blood donation. Your help can save a life.
          </p>
        </div>
      </section>

      <section className="container mx-auto py-16 md:py-24 px-4">
        {loading ? (
             <div className="text-center py-16">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
                <p className="mt-4 text-muted-foreground">Loading Requests...</p>
            </div>
        ) : allRequests.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {allRequests.map((req) => (
              <RequestCard key={req.id} req={req} onRespond={handleCanDonate} showRespondButton={true} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground text-lg">No active blood requests at the moment.</p>
            <p className="text-sm text-muted-foreground/80 mt-2">Check back later or become a donor to get notified!</p>
          </div>
        )}
      </section>
    </div>
  );
}
