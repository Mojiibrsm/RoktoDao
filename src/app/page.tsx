
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { db } from '@/lib/firebase';
import type { BloodRequest, Donor } from '@/lib/types';
import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { Droplet, MapPin, Calendar, Syringe, Search, Heart, Phone, LifeBuoy, HeartPulse, ShieldCheck, Stethoscope, LocateFixed, MessageCircle, Newspaper, Github, Linkedin, Twitter, Users, Globe } from 'lucide-react';
import { format } from 'date-fns';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getBlogPosts } from '@/lib/blog-data';
import Image from 'next/image';
import DonorCard from '@/components/donor-card';

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

async function getTopDonors() {
  try {
    const donorsRef = collection(db, 'donors');
    const q = query(donorsRef, where('isAvailable', '==', true), limit(6));
    const querySnapshot = await getDocs(q);
    const donors = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Donor[];
    return donors;
  } catch (error) {
    console.error("Error fetching top donors:", error);
    return [];
  }
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

export default async function Home() {
  const urgentRequests = await getUrgentRequests();
  const topDonors = await getTopDonors();
  const latestPosts = getBlogPosts().slice(0, 3);

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
          <div className="text-center">
            <h2 className="text-3xl font-bold text-primary md:text-4xl font-headline">
              আমাদের সক্রিয় রক্তদাতারা
            </h2>
            <p className="mt-2 text-lg text-muted-foreground">Our active and available donors</p>
          </div>
          <Separator className="my-8" />
          {topDonors.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {topDonors.map((donor) => (
                <DonorCard key={donor.id} donor={donor} />
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

      <section className="w-full py-16 md:py-24 bg-background">
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
                src="https://placehold.co/600x400.png"
                alt="Map of Bangladesh for location based search"
                data-ai-hint="map Bangladesh"
                className="rounded-lg object-cover w-full h-full shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>
      
       <section className="w-full py-16 md:py-24 bg-primary/5">
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
                <p className="text-muted-foreground mt-2">বিভাগ ও জেলা অনুযায়ী রক্তদাতা খুঁজে জরুরি মুহূর্তে সময় বাঁচান।</p>
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

      <section className="bg-background w-full py-16 md:py-24">
        <div className="container mx-auto px-4">
            <h2 className="text-center text-3xl font-bold text-primary md:text-4xl font-headline">
                কেন রক্তদান করবেন?
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-center text-lg text-foreground/80">
              রক্তদান শুধুমাত্র অন্যের জীবন বাঁচায় না, আপনার স্বাস্থ্যের জন্যও এটি উপকারী।
            </p>
            <Separator className="my-8" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <Card className="p-6 shadow-lg">
                    <HeartPulse className="mx-auto h-12 w-12 text-primary mb-4" />
                    <h3 className="text-xl font-bold">হার্ট ভালো থাকে</h3>
                    <p className="text-muted-foreground mt-2">নিয়মিত রক্তদান করলে শরীরে আয়রনের মাত্রা নিয়ন্ত্রণে থাকে, যা হৃদরোগের ঝুঁকি কমায়।</p>
                </Card>
                <Card className="p-6 shadow-lg">
                    <ShieldCheck className="mx-auto h-12 w-12 text-primary mb-4" />
                    <h3 className="text-xl font-bold">নতুন রক্তকণিকা তৈরি হয়</h3>
                    <p className="text-muted-foreground mt-2">রক্তদানের পর শরীর নতুন রক্তকণিকা তৈরিতে উৎসাহিত হয়, যা শরীরকে সতেজ রাখে।</p>
                </Card>
                <Card className="p-6 shadow-lg">
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

       <section className="w-full py-16 md:py-24 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
            <div className="mx-auto max-w-2xl h-40 flex items-center justify-center rounded-lg bg-muted/50 border-2 border-dashed">
                <p className="text-muted-foreground">Advertisement Placeholder</p>
            </div>
        </div>
      </section>

      <section className="w-full py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-primary md:text-4xl font-headline">
              আমাদের ব্লগ থেকে পড়ুন
            </h2>
            <p className="mt-2 text-lg text-muted-foreground">Stay informed with our latest articles</p>
          </div>
          <Separator className="my-8" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {latestPosts.map((post) => (
                <Card key={post.slug} className="flex flex-col justify-between shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle>
                      <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                        {post.title}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground line-clamp-3">{post.excerpt}</p>
                  </CardContent>
                  <CardContent>
                     <p className="text-sm text-muted-foreground">{post.date} by {post.author}</p>
                  </CardContent>
                </Card>
              ))}
          </div>
           <div className="mt-12 text-center">
            <Button asChild>
                <Link href="/blog"><Newspaper className="mr-2 h-5 w-5" />আরো পড়ুন</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="w-full py-16 md:py-24 bg-primary/5">
        <div className="container mx-auto px-4">
            <Card className="bg-background/80 p-8 rounded-lg shadow-lg">
                <div className="grid md:grid-cols-3 gap-8 items-center">
                    <div className="md:col-span-1 flex justify-center">
                        <Image
                            src="https://placehold.co/400x400.png"
                            alt="Developer Portrait"
                            data-ai-hint="man portrait"
                            width={200}
                            height={200}
                            className="rounded-full object-cover shadow-xl"
                        />
                    </div>
                    <div className="md:col-span-2 text-center md:text-left">
                        <h2 className="text-3xl font-bold text-primary font-headline">
                            পরিচালকের বার্তা
                        </h2>
                        <Separator className="my-4" />
                        <p className="text-muted-foreground leading-relaxed">
                            "রক্তবন্ধু একটি অলাভজনক উদ্যোগ যা রক্তদাতা এবং গ্রহীতাদের মধ্যে একটি সেতুবন্ধন তৈরির লক্ষ্যে কাজ করে। প্রযুক্তি ব্যবহার করে জীবন বাঁচানোর এই যাত্রায় আমাদের সঙ্গী হওয়ার জন্য আপনাকে ধন্যবাদ।"
                        </p>
                        <p className="font-semibold mt-4"> - মুজিবুর রহমান, প্রতিষ্ঠাতা</p>
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
      </section>

      <section className="container mx-auto py-16 md:py-24 px-4 max-w-4xl">
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

    </div>
  );
}

    