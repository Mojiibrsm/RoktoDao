import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { db } from '@/lib/firebase';
import type { BloodRequest } from '@/lib/types';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { Droplet, MapPin, Calendar, Syringe, Search, Link2, Heart, HeartHandshake } from 'lucide-react';
import { format } from 'date-fns';

async function getUrgentRequests() {
  try {
    const requestsRef = collection(db, 'requests');
    const q = query(requestsRef, orderBy('neededDate', 'asc'), limit(6));
    const querySnapshot = await getDocs(q);
    const requests = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as BloodRequest[];
    return requests;
  } catch (error) {
    console.error("Error fetching urgent requests:", error);
    return [];
  }
}

export default async function Home() {
  const urgentRequests = await getUrgentRequests();

  return (
    <div className="flex flex-col items-center">
      <section className="w-full bg-primary/10 py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tighter text-primary md:text-6xl font-headline">
            রক্ত দিন, জীবন বাঁচান — এখন আরও সহজে!
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-foreground/80 md:text-xl">
            দ্রুত রক্ত খুঁজুন অথবা স্বেচ্ছাসেবী হোন
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" variant="outline">
              <Link href="/search-donors"><Search className="mr-2 h-5 w-5" />রক্ত খুঁজুন</Link>
            </Button>
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/signup"><Heart className="mr-2 h-5 w-5" />রেজিস্টার করুন</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/request-blood"><HeartHandshake className="mr-2 h-5 w-5" />রক্ত চাওয়ার আবেদন</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="w-full py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-3xl font-bold text-primary md:text-4xl font-headline">
            How It Works
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-foreground/80">
            A simple three-step process to connect donors and recipients.
          </p>
          <Separator className="my-8" />
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <Card className="text-center shadow-lg">
              <CardHeader>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Search className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="mt-4 text-2xl font-headline">Search</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Find available blood donors in your area using our simple search filters.</p>
              </CardContent>
            </Card>
            <Card className="text-center shadow-lg">
              <CardHeader>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Link2 className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="mt-4 text-2xl font-headline">Connect</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Directly contact donors or view urgent requests to offer your help.</p>
              </CardContent>
            </Card>
            <Card className="text-center shadow-lg">
              <CardHeader>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="mt-4 text-2xl font-headline">Donate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Save a life by donating blood and become a hero in someone's story.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="w-full py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-3xl font-bold text-primary md:text-4xl font-headline">
            Urgent Blood Requests
          </h2>
          <Separator className="my-8" />
          {urgentRequests.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {urgentRequests.map((req) => (
                <Card key={req.id} className="flex flex-col justify-between shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{req.patientName}</span>
                      <span className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
                        <Droplet className="h-4 w-4" />
                        {req.bloodGroup}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <MapPin className="h-5 w-5" />
                      <span>{req.hospitalLocation}</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Calendar className="h-5 w-5" />
                      <span>Needed by: {format(new Date(req.neededDate), "PPP")}</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Syringe className="h-5 w-5" />
                      <span>{req.numberOfBags} Bag(s)</span>
                    </div>
                     <div className="flex items-center gap-3 text-muted-foreground">
                      <MapPin className="h-5 w-5" />
                      <span>Contact: {req.contactPhone}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">No urgent requests at the moment.</p>
          )}
        </div>
      </section>
    </div>
  );
}
