
import 'server-only';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { dbAdmin } from '@/lib/firebase-admin';
import type { BloodRequest, Donor } from '@/lib/types';
import { Droplet, MapPin, Calendar, Syringe, Search, Heart, Phone, LifeBuoy, HeartPulse, ShieldCheck, Stethoscope, LocateFixed, MessageCircle, Newspaper, Github, Linkedin, Twitter, Users, Globe, HandHeart, ListChecks, AlertTriangle, ArrowRight, Pin } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Image from 'next/image';
import DonorCard from '@/components/donor-card';
import RequestCard from '@/components/request-card';
import { Timestamp } from 'firebase-admin/firestore';


interface GalleryImage {
    id: string;
    imageUrl: string;
    status: 'approved' | 'pending';
}
interface Stats {
  totalDonors: number;
  totalRequests: number;
  donationsFulfilled: number;
}
interface Member {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

const faqs = [
  {
    question: "রক্তদানের জন্য সর্বনিম্ন বয়স কত?",
    answer: "রক্তদানের জন্য আপনার বয়স কমপক্ষে ১৮ বছর হতে হবে।"
  },
  {
    question: "আমার ওজন কত কেজি হওয়া প্রয়োজন?",
    answer: "সুস্থভাবে রক্তদানের জন্য আপনার ওজন কমপক্ষে ৫০ কেজি (১১০ পাউন্ড) হওয়া উচিত।"
  },
  {
    question: "কতদিন পর পর রক্তদান করা যায়?",
    answer: "একজন সুস্থ পুরুষ প্রতি ৩ মাস পর পর এবং একজন সুস্থ নারী প্রতি ৪ মাস পর পর রক্তদান করতে পারেন।"
  },
];

async function getHomepageData() {
    try {
        const requestsRef = dbAdmin.collection('requests');
        const donorsRef = dbAdmin.collection('donors');
        const modsCollection = dbAdmin.collection('moderators');
        const imagesRef = dbAdmin.collection('gallery');

        // Define all queries
        const reqQuery = requestsRef.where('status', '==', 'Approved').orderBy('neededDate', 'asc').limit(6);
        const pinnedDonorsQuery = donorsRef.where('isPinned', '==', true).where('isAvailable', '==', true).limit(6);
        const otherDonorsQuery = donorsRef.where('isAvailable', '==', true).limit(12);
        const directorQuery = modsCollection.where('role', '==', 'প্রধান পরিচালক').limit(1);
        const galleryQuery = imagesRef.where('status', '==', 'approved').orderBy('createdAt', 'desc').limit(8);

        // Fetch all data in parallel
        const [
            reqSnapshot,
            pinnedSnapshot,
            otherSnapshot,
            donorCountSnap,
            requestCountSnap,
            fulfilledCountSnap,
            directorSnapshot,
            gallerySnapshot
        ] = await Promise.all([
            reqQuery.get(),
            pinnedDonorsQuery.get(),
            otherDonorsQuery.get(),
            donorsRef.count().get(),
            requestsRef.count().get(),
            requestsRef.where("status", "==", "Fulfilled").count().get(),
            directorQuery.get(),
            galleryQuery.get(),
        ]);

        // Process Urgent Requests
        const urgentRequests = reqSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                neededDate: data.neededDate, // No conversion needed for server components if passed as string
                createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : (data.createdAt || new Date().toISOString()),
            } as BloodRequest;
        });
        
        // Process Donors
        const pinnedDonors = pinnedSnapshot.docs.map(doc => {
            const data = doc.data();
            return { 
                id: doc.id, 
                ...data,
                lastDonationDate: data.lastDonationDate,
                createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : (data.createdAt || new Date().toISOString()),
            } as Donor;
        });

        let donors: Donor[] = [...pinnedDonors];
        if (donors.length < 6) {
          const otherDonors = otherSnapshot.docs.map(doc => {
              const data = doc.data();
              return { 
                id: doc.id, 
                ...data,
                lastDonationDate: data.lastDonationDate,
                createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : (data.createdAt || new Date().toISOString()),
              } as Donor
          });
          const nonPinnedDonors = otherDonors.filter(d => !donors.some(pd => pd.uid === d.uid));
          donors = [...donors, ...nonPinnedDonors].slice(0, 6);
        }

        // Process Stats
        const stats = {
            totalDonors: donorCountSnap.data().count,
            totalRequests: requestCountSnap.data().count,
            donationsFulfilled: fulfilledCountSnap.data().count,
        };

        // Process Director
        let director: Member | null = null;
        if (!directorSnapshot.empty) {
            const directorDoc = directorSnapshot.docs[0];
            director = { id: directorDoc.id, ...directorDoc.data() } as Member;
        }

        // Process Gallery Images
        const galleryImages = gallerySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GalleryImage));
        
        return { urgentRequests, donors, stats, director, galleryImages, error: null };

      } catch (error) {
        console.error("Error fetching homepage data:", error);
        return { 
          urgentRequests: [], 
          donors: [], 
          stats: { totalDonors: 0, totalRequests: 0, donationsFulfilled: 0 }, 
          director: null, 
          galleryImages: [], 
          error: "Failed to load page data. Please check Firestore security rules and try again later."
        };
      }
}


export default async function Home() {
  const { urgentRequests, donors, stats, director, galleryImages, error } = await getHomepageData();

  if(error) {
    return <div className="container mx-auto py-20 text-center text-destructive">{error}</div>
  }

  return (
    <div className="flex flex-col items-center">
       <section className="w-full bg-primary/5">
        <div className="container mx-auto flex flex-col items-center text-center py-20 md:py-32 px-4">
            <div className="space-y-6 max-w-3xl">
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-primary font-headline">
                🩸 “আপনার রক্তে বাঁচবে অন্যের স্বপ্ন!”
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                জরুরী মুহূর্তে রক্ত খুঁজে পেতে বা রক্তদানের মাধ্যমে জীবন বাঁচাতে আমাদের প্ল্যাটফর্মে যোগ দিন। আপনার সামান্য ত্যাগই পারে অন্যের জীবনে বিশাল পরিবর্তন আনতে।
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      <Link href="/signup"><Heart className="mr-2" /> রক্ত দিতে চাই</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                      <Link href="/search-donors"><Search className="mr-2" /> রক্ত খুঁজছি</Link>
                  </Button>
              </div>
            </div>
            <div className="flex items-center gap-8 pt-12">
              <div className="text-center">
                <p className="text-3xl font-bold">{stats.totalDonors.toLocaleString()}+</p>
                <p className="text-sm text-muted-foreground">নিবন্ধিত ডোনার</p>
              </div>
                <div className="text-center">
                <p className="text-3xl font-bold">{stats.donationsFulfilled.toLocaleString()}+</p>
                <p className="text-sm text-muted-foreground">সফল ডোনেশন</p>
              </div>
            </div>
        </div>
      </section>

      <section className="bg-background w-full py-12 md:py-16">
        <div className="container mx-auto px-4">
            <h2 className="text-center text-3xl font-bold text-primary md:text-4xl font-headline">
                কেন রক্তদান করবেন?
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-center text-lg text-foreground/80">
              রক্তদান শুধুমাত্র অন্যের জীবন বাঁচায় না, আপনার স্বাস্থ্যের জন্যও এটি উপকারী।
            </p>
            <Separator className="my-8" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <Card className="p-6 shadow-lg transition-transform duration-300 hover:scale-105 hover:shadow-xl hover:-translate-y-1 border-primary/20">
                    <HeartPulse className="mx-auto h-12 w-12 text-primary mb-4" />
                    <h3 className="text-xl font-bold">হার্ট ভালো থাকে</h3>
                    <p className="text-muted-foreground mt-2">নিয়মিত রক্তদান করলে শরীরে আয়রনের মাত্রা নিয়ন্ত্রণে থাকে, যা হৃদরোগের ঝুঁকি কমায়।</p>
                </Card>
                <Card className="p-6 shadow-lg transition-transform duration-300 hover:scale-105 hover:shadow-xl hover:-translate-y-1 border-primary/20">
                    <ShieldCheck className="mx-auto h-12 w-12 text-primary mb-4" />
                    <h3 className="text-xl font-bold">নতুন রক্তকণিকা তৈরি হয়</h3>
                    <p className="text-muted-foreground mt-2">রক্তদানের পর শরীর নতুন রক্তকণিকা তৈরিতে উৎসাহিত হয়, যা শরীরকে সতেজ রাখে।</p>
                </Card>
                <Card className="p-6 shadow-lg transition-transform duration-300 hover:scale-105 hover:shadow-xl hover:-translate-y-1 border-primary/20">
                    <Stethoscope className="mx-auto h-12 w-12 text-primary mb-4" />
                    <h3 className="text-xl font-bold">বিনামূল্যে স্বাস্থ্য পরীক্ষা</h3>
                    <p className="text-muted-foreground mt-2">প্রতিবার রক্তদানের আগে আপনার স্বাস্থ্য পরীক্ষা করা হয়, যা আপনার সুস্থতা সম্পর্কে ধারণা দেয়।</p>
                </Card>
            </div>
            <div className="mt-12 text-center">
              <Button asChild>
                  <Link href="/why-donate-blood">বিস্তারিত জানুন</Link>
              </Button>
            </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-16 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-primary md:text-4xl font-headline">
              আমাদের রক্তযোদ্ধারা
            </h2>
            <p className="mt-2 text-lg text-muted-foreground">Our active and available donors</p>
          </div>
          <Separator className="my-8" />
          {donors.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {donors.map((donor) => (
                <DonorCard key={donor.uid} donor={donor} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">No active donors found at the moment.</p>
          )}
           <div className="mt-12 text-center">
            <Button asChild>
                <Link href="/search-donors"><Users className="mr-2 h-5 w-5" />সকল ডোনার দেখুন</Link>
            </Button>
          </div>
        </div>
      </section>
      
      <section className="w-full bg-background py-12 md:py-16">
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
                <RequestCard key={req.id} req={req} />
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

       <section className="w-full bg-primary/5 py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-primary md:text-4xl font-headline">
                আমাদের পরিসংখ্যান
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-lg text-foreground/80">
                আমাদের সম্প্রদায়ের সম্মিলিত প্রভাব দেখুন।
            </p>
            <Separator className="my-8" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex flex-col items-center gap-2">
                    <Users className="h-12 w-12 text-primary" />
                    <p className="text-4xl font-bold">{stats.totalDonors.toLocaleString()}+</p>
                    <p className="text-muted-foreground">মোট ডোনার</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <ListChecks className="h-12 w-12 text-primary" />
                    <p className="text-4xl font-bold">{stats.totalRequests.toLocaleString()}+</p>
                    <p className="text-muted-foreground">মোট রিকোয়েস্ট</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <HandHeart className="h-12 w-12 text-primary" />
                    <p className="text-4xl font-bold">{stats.donationsFulfilled.toLocaleString()}+</p>
                    <p className="text-muted-foreground">সফল ডোনেশন</p>
                </div>
            </div>
        </div>
      </section>
      
      {director && <section className="w-full py-12 md:py-16 bg-background">
        <div className="container mx-auto px-4">
            <Card className="bg-primary/5 p-8 rounded-lg shadow-lg">
                <div className="grid md:grid-cols-3 gap-8 items-center">
                    <div className="md:col-span-1 flex justify-center">
                        <Image
                            src={director.avatar || "/mojibrsm.png"}
                            alt={director.name}
                            width={200}
                            height={200}
                            data-ai-hint="man portrait"
                            className="rounded-full object-cover shadow-xl"
                        />
                    </div>
                    <div className="md:col-span-2 text-center md:text-left">
                        <h2 className="text-3xl font-bold text-primary font-headline">
                            পরিচালকের বার্তা
                        </h2>
                        <Separator className="my-4" />
                        <p className="text-muted-foreground leading-relaxed">
                            "RoktoDao একটি অলাভজনক উদ্যোগ যা রক্তদাতা এবং গ্রহীতাদের মধ্যে একটি সেতুবন্ধন তৈরির লক্ষ্যে কাজ করে। প্রযুক্তি ব্যবহার করে জীবন বাঁচানোর এই যাত্রায় আমাদের সঙ্গী হওয়ার জন্য আপনাকে ধন্যবাদ।"
                        </p>
                        <p className="font-semibold mt-4"> - {director.name}, প্রতিষ্ঠাতা</p>
                        <div className="flex justify-center md:justify-start gap-4 mt-4">
                            <Link href="https://www.facebook.com/MoJiiB.RsM" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-facebook"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                            </Link>
                            <Link href="https://www.linkedin.com/in/mojibrsm/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary"><Linkedin size={24} /></Link>
                            <Link href="https://github.com/mojib-rsm" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary"><Github size={24} /></Link>
                            <Link href="http://mojibrsm.com/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary"><Globe size={24} /></Link>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
      </section>}


      <section className="w-full py-12 md:py-16 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-primary font-headline">
                আপনার এলাকাতেই খুঁজুন রক্তদাতা
              </h2>
              <Separator className="my-4" />
              <p className="text-muted-foreground leading-relaxed">
                আমাদের ওয়েবসাইটে আপনি খুব সহজেই বিভাগ এবং জেলা অনুযায়ী রক্ত দাতাদের খুঁজে নিতে পারেন। জরুরি মুহূর্তে আপনার নিকটবর্তী রক্ত দাতাকে খুঁজে পাওয়া এখন আগের চেয়ে অনেক সহজ।
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
                src="/files/blood_donation_info.png"
                alt="Blood donation information infographic"
                data-ai-hint="infographic blood donation"
                className="rounded-lg object-cover w-full h-full shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>
      
       <section className="w-full py-12 md:py-16 bg-background">
        <div className="container mx-auto px-4">
           <h2 className="text-center text-3xl font-bold text-primary md:text-4xl font-headline">
            কেন রক্তদাও ব্যবহার করবেন?
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-center text-lg text-foreground/80">
            রক্তদান একটি মহৎ কাজ। এর মাধ্যমে আপনি অন্যের জীবন বাঁচাতে পারেন। রক্তদাও এই প্রক্রিয়াকে আরও সহজ করে তুলেছে।
          </p>
          <Separator className="my-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-6 shadow-lg transition-transform duration-300 hover:scale-105 hover:shadow-xl hover:-translate-y-1 border-primary/20">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <LifeBuoy className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold font-headline">জীবন বাঁচান</h3>
                <p className="text-muted-foreground mt-2">আপনার এক ব্যাগ রক্ত একজন মুমূর্ষু রোগীর জীবন বাঁচাতে পারে। জরুরি মুহূর্তে আপনার এই ত্যাগ অমূল্য।</p>
            </Card>
             <Card className="text-center p-6 shadow-lg transition-transform duration-300 hover:scale-105 hover:shadow-xl hover:-translate-y-1 border-primary/20">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <LocateFixed className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold font-headline">লোকেশন ভিত্তিক সার্চ</h3>
                <p className="text-muted-foreground mt-2">বিভাগ ও জেলা অনুযায়ী রক্তদাতা খুঁজে জরুরি মুহূর্তে সময় বাঁচান।</p>
            </Card>
             <Card className="text-center p-6 shadow-lg transition-transform duration-300 hover:scale-105 hover:shadow-xl hover:-translate-y-1 border-primary/20">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <MessageCircle className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold font-headline">দ্রুত যোগাযোগ</h3>
                <p className="text-muted-foreground mt-2">প্ল্যাটফর্মের মাধ্যমে সরাসরি ডোনারের সাথে যোগাযোগ করে রক্ত সংগ্রহ করুন।</p>
            </Card>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-16 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-primary md:text-4xl font-headline">
             আমাদের ব্লগ থেকে পড়ুন
            </h2>
            <p className="mt-2 text-lg text-muted-foreground">Stay informed with our latest articles</p>
          </div>
          <Separator className="my-8" />
           <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Card className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                <Image
                    src="https://placehold.co/600x400.png"
                    alt="রক্তদানের যোগ্যতা"
                    width={600}
                    height={400}
                    className="w-full h-48 object-cover"
                    data-ai-hint="medical check"
                  />
                <CardHeader>
                  <CardTitle>রক্তদানের যোগ্যতা</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground">রক্তদানের আগে আপনার কী কী যোগ্যতা থাকা প্রয়োজন সে সম্পর্কে বিস্তারিত জানুন।</p>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="link" className="pl-0">
                    <Link href="/why-donate-blood">
                      বিস্তারিত পড়ুন <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
              <Card className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                <Image
                    src="https://placehold.co/600x400.png"
                    alt="রক্তদানের উপকারিতা"
                    width={600}
                    height={400}
                    className="w-full h-48 object-cover"
                    data-ai-hint="health benefit"
                  />
                <CardHeader>
                  <CardTitle>রক্তদানের উপকারিতা</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground">রক্তদান শুধু অন্যের জীবন বাঁচায় না, আপনার নিজের স্বাস্থ্যের জন্যও এটি অত্যন্ত উপকারী।</p>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="link" className="pl-0">
                    <Link href="/why-donate-blood">
                      বিস্তারিত পড়ুন <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
              <Link href="/team" className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg no-underline">
               <Card className="flex flex-col flex-grow">
                <Image
                    src="https://placehold.co/600x400.png"
                    alt="আমাদের টিম"
                    width={600}
                    height={400}
                    className="w-full h-48 object-cover"
                    data-ai-hint="team photo"
                  />
                <CardHeader>
                  <CardTitle>আমাদের টিম</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground">আমাদের নিবেদিতপ্রাণ টিম সম্পর্কে জানুন যারা এই প্ল্যাটফর্মটি পরিচালনা করছেন।</p>
                </CardContent>
                <CardFooter>
                  <p className="text-sm font-medium text-primary hover:underline flex items-center">
                      বিস্তারিত পড়ুন <ArrowRight className="ml-2 h-4 w-4" />
                  </p>
                </CardFooter>
              </Card>
              </Link>
            </div>

           <div className="mt-12 text-center">
            <Button asChild>
                <Link href="/blog"><Newspaper className="mr-2 h-5 w-5" />আরো পড়ুন</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container mx-auto py-12 md:py-16 px-4 max-w-4xl">
        <h2 className="text-center text-3xl font-bold text-primary md:text-4xl font-headline">
            সাধারণ জিজ্ঞাসা
        </h2>
        <Separator className="my-8" />
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem value={`item-${index}`} key={index}>
              <AccordionTrigger className="text-lg font-semibold text-left hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <div className="mt-12 text-center">
          <Button asChild variant="outline">
              <Link href="/faq">আরো প্রশ্ন দেখুন</Link>
          </Button>
        </div>
      </section>

      <section className="w-full py-12 md:py-16 bg-primary/5">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-3xl font-bold text-primary md:text-4xl font-headline">
            রক্তদানের মুহূর্ত (গ্যালারি)
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-center text-lg text-foreground/80">
            আমাদের রক্তযোদ্ধাদের কিছু অনুপ্রেরণামূলক মুহূর্ত।
          </p>
          <Separator className="my-8" />
          {galleryImages.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {galleryImages.map(image => (
                  <div key={image.id} className="overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <Image
                      src={image.imageUrl}
                      alt="Blood donation moment"
                      width={400}
                      height={400}
                      className="w-full h-full object-cover aspect-square"
                    />
                  </div>
              ))}
            </div>
          ) : (
             <p className="col-span-full text-center text-muted-foreground">গ্যালারিতে কোনো ছবি পাওয়া যায়নি।</p>
          )}
          <div className="mt-12 text-center">
            <Button asChild>
                <Link href="/gallery">সম্পূর্ণ গ্যালারি দেখুন</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-16 bg-background border-t">
        <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-primary md:text-4xl font-headline">
            জীবন বাঁচানোর সম্প্রদায়ে যোগ দিন
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-foreground/80">
            আজই একজন দাতা হিসাবে নিবন্ধন করুন এবং কারো গল্পের নায়ক হয়ে উঠুন। এটি সহজ, নিরাপদ এবং গভীরভাবে প্রভাবশালী।
            </p>
            <div className="mt-8">
            <Button asChild size="lg">
                <Link href="/signup">
                দান করতে নিবন্ধন করুন <Heart className="ml-2 h-5 w-5" />
                </Link>
            </Button>
            </div>
        </div>
      </section>

    </div>
  );
}
