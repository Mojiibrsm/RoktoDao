
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { db } from '@/lib/firebase';
import type { BloodRequest } from '@/lib/types';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { Droplet, MapPin, Calendar, Syringe, Search, Heart, HeartHandshake, Phone, Radio, Mail, ClipboardList, Smartphone, LocateFixed, MessageCircle, LifeBuoy } from 'lucide-react';
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
              <Link href="/signup"><Heart className="mr-2 h-5 w-5" />ডোনার হোন</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="w-full py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-primary md:text-4xl font-headline">
              জরুরি রক্তের রিকোয়েস্ট
            </h2>
            <p className="mt-2 text-lg text-muted-foreground">Live urgent blood requests</p>
          </div>
          <Separator className="my-8" />
          {urgentRequests.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {urgentRequests.map((req) => (
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
            <p className="text-center text-muted-foreground">No urgent requests at the moment.</p>
          )}
          <div className="mt-12 text-center">
            <Button asChild variant="outline">
                <Link href="/requests">আরো দেখুন</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="w-full py-16 md:py-24 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-primary font-headline">
                আপনার এলাকাতেই খুঁজুন রক্তদাতা
              </h2>
              <Separator className="my-4" />
              <p className="text-muted-foreground leading-relaxed">
                আমাদের ওয়েবসাইটে আপনি খুব সহজেই বিভাগ এবং জেলা অনুযায়ী রক্তদাতাদের খুঁজে নিতে পারেন। জরুরি মুহূর্তে আপনার নিকটবর্তী রক্তদাতাকে খুঁজে পাওয়া এখন আগের চেয়ে অনেক সহজ।
              </p>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                কেবলমাত্র প্রয়োজনীয় রক্তের গ্রুপ, বিভাগ এবং জেলা নির্বাচন করুন, আর মুহূর্তেই পেয়ে যান আপনার এলাকার সকল রেজিস্টার্ড রক্তদাতাদের তালিকা।
              </p>
              <Button asChild className="mt-6">
                <Link href="/search-donors">
                  <Search className="mr-2 h-5 w-5" />
                  এখনই খুঁজুন
                </Link>
              </Button>
            </div>
            <div>
              <img
                src="https://placehold.co/600x400.png"
                alt="Map of Bangladesh for location based search"
                data-ai-hint="map Bangladesh"
                className="rounded-lg object-cover w-full h-full shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>
      
      <section className="w-full py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
           <h2 className="text-center text-3xl font-bold text-primary md:text-4xl font-headline">
            কেন রক্তবন্ধু ব্যবহার করবেন?
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-center text-lg text-foreground/80">
            রক্তদান একটি মহৎ কাজ। এর মাধ্যমে আপনি অন্যের জীবন বাঁচাতে পারেন। রক্তবন্ধু এই প্রক্রিয়াকে আরও সহজ করে তুলেছে।
          </p>
          <Separator className="my-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-6 shadow-lg">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <LifeBuoy className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold font-headline">জীবন বাঁচান</h3>
                <p className="text-muted-foreground mt-2">আপনার এক ব্যাগ রক্ত একজন মুমূর্ষু রোগীর জীবন বাঁচাতে পারে। জরুরি মুহূর্তে আপনার এই ত্যাগ অমূল্য।</p>
            </Card>
             <Card className="text-center p-6 shadow-lg">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <LocateFixed className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold font-headline">লোকেশন ভিত্তিক সার্চ</h3>
                <p className="text-muted-foreground mt-2">বিভাগ, জেলা এবং উপজেলা অনুযায়ী রক্তদাতা খুঁজে জরুরি মুহূর্তে সময় বাঁচান।</p>
            </Card>
             <Card className="text-center p-6 shadow-lg">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <MessageCircle className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold font-headline">দ্রুত যোগাযোগ</h3>
                <p className="text-muted-foreground mt-2">প্ল্যাটফর্মের মাধ্যমে সরাসরি ডোনারের সাথে যোগাযোগ করে রক্ত সংগ্রহ করুন।</p>
            </Card>
          </div>
        </div>
      </section>


      <section className="w-full py-16 md:py-24 bg-primary/5">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-3xl font-bold text-primary md:text-4xl font-headline">
            Key Features
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-foreground/80">
            Our platform is packed with features to make blood donation seamless.
          </p>
          <Separator className="my-8" />
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            <Card className="text-center shadow-lg">
              <CardHeader>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Radio className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="mt-4 text-2xl font-headline">রিয়েল টাইম রিকোয়েস্ট</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Get live updates on urgent blood needs in your area.</p>
              </CardContent>
            </Card>
            <Card className="text-center shadow-lg">
              <CardHeader>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="mt-4 text-2xl font-headline">SMS/Email নোটিফিকেশন</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Receive instant notifications for matching blood requests.</p>
              </CardContent>
            </Card>
            <Card className="text-center shadow-lg">
              <CardHeader>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <ClipboardList className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="mt-4 text-2xl font-headline">রক্তদানের রেকর্ড</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Keep a personal log of your blood donations and eligibility.</p>
              </CardContent>
            </Card>
            <Card className="text-center shadow-lg">
              <CardHeader>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Smartphone className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="mt-4 text-2xl font-headline">মোবাইল রেসপন্সিভ</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Access our platform on any device, anywhere, anytime.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

    </div>
  );
}
