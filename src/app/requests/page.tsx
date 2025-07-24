"use client";

import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { BloodRequest } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Droplet, MapPin, Calendar, Syringe, Phone, AlertTriangle, Copy } from 'lucide-react';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

async function getAllRequests(): Promise<BloodRequest[]> {
  try {
    const requestsRef = collection(db, 'requests');
    const q = query(requestsRef, orderBy('neededDate', 'asc'));
    const querySnapshot = await getDocs(q);
    const requests = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as BloodRequest[];
    return requests;
  } catch (error) {
    console.error("Error fetching all requests:", error);
    return [];
  }
}

const RequestCard = ({ req }: { req: BloodRequest }) => {
    const { toast } = useToast();
    const handleCopy = (number: string) => {
        navigator.clipboard.writeText(number);
        toast({ title: "Number copied!" });
    };

    return (
        <Card className="flex flex-col justify-between shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-start justify-between">
                <span className="text-xl flex items-center gap-2">
                   {req.isEmergency && <AlertTriangle className="h-5 w-5 text-destructive" />}
                   {req.patientName}
                </span>
                <span className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-base font-bold text-primary">
                  <Droplet className="h-4 w-4" />
                  {req.bloodGroup}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="h-5 w-5 flex-shrink-0" />
                <span>{`${req.hospitalLocation}, ${req.district}`}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Calendar className="h-5 w-5 flex-shrink-0" />
                <span>Needed by: {format(new Date(req.neededDate), "PPP")}</span>
              </div>
               <div className="flex items-center justify-between text-muted-foreground">
                    <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 flex-shrink-0" />
                        <span>{req.contactPhone}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleCopy(req.contactPhone)} className="h-8 w-8">
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Syringe className="h-5 w-5 flex-shrink-0" />
                <span>{req.numberOfBags} Bag(s)</span>
              </div>
            </CardContent>
        </Card>
    );
};

export default function AllRequestsPage() {
  const [allRequests, setAllRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
        setLoading(true);
        const requests = await getAllRequests();
        setAllRequests(requests);
        setLoading(false);
    }
    fetchRequests();
  }, [])

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
              <RequestCard key={req.id} req={req} />
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
