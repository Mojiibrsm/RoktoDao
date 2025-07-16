
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { BloodRequest } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Droplet, MapPin, Calendar, Syringe, Phone } from 'lucide-react';
import { format } from 'date-fns';

async function getAllRequests() {
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

export default async function AllRequestsPage() {
  const allRequests = await getAllRequests();

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
        {allRequests.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {allRequests.map((req) => (
              <Card key={req.id} className="flex flex-col justify-between shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-start justify-between">
                    <span className="text-xl">{req.patientName}</span>
                    <span className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-base font-bold text-primary">
                      <Droplet className="h-4 w-4" />
                      {req.bloodGroup}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <MapPin className="h-5 w-5 flex-shrink-0" />
                    <span>{req.hospitalLocation}</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Calendar className="h-5 w-5 flex-shrink-0" />
                    <span>Needed by: {format(new Date(req.neededDate), "PPP")}</span>
                  </div>
                   <div className="flex items-center gap-3 text-muted-foreground">
                    <Phone className="h-5 w-5 flex-shrink-0" />
                    <span>Contact: {req.contactPhone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Syringe className="h-5 w-5 flex-shrink-0" />
                    <span>{req.numberOfBags} Bag(s)</span>
                  </div>
                </CardContent>
              </Card>
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
