
"use client";

import { collection, getDocs, orderBy, query, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { BloodRequest } from '@/lib/types';
import { useEffect, useState } from 'react';
import RequestCard from '@/components/request-card';

async function getAllRequests(): Promise<BloodRequest[]> {
  try {
    const requestsRef = collection(db, 'requests');
    const q = query(requestsRef, orderBy('neededDate', 'asc'));
    const querySnapshot = await getDocs(q);
    const requests = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
        neededDate: data.neededDate instanceof Timestamp ? data.neededDate.toDate().toISOString() : data.neededDate,
      } as BloodRequest;
    });
    return requests;
  } catch (error) {
    console.error("Error fetching all requests:", error);
    return [];
  }
}

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
