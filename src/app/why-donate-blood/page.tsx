
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, HeartPulse, ShieldCheck, Stethoscope } from 'lucide-react';
import Image from 'next/image';

export default function WhyDonateBloodPage() {
  return (
    <div className="bg-background">
      <section className="w-full bg-primary/10 py-20 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tighter text-primary md:text-6xl font-headline">
            কেন রক্তদান করবেন?
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-lg text-foreground/80 md:text-xl">
            আপনার এক ব্যাগ রক্ত পারে একটি জীবন বাঁচাতে। রক্তদানের উপকারিতা ও যোগ্যতা সম্পর্কে জানুন।
          </p>
        </div>
      </section>

      <section className="container mx-auto py-16 md:py-24 px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-primary font-headline">রক্তদানের যোগ্যতা</h2>
            <Separator className="my-4" />
            <ul className="space-y-4 text-lg text-muted-foreground">
              <li className="flex items-start gap-4">
                <CheckCircle2 className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                <span>আপনার বয়স ১৮ থেকে ৬০ বছরের মধ্যে হতে হবে।</span>
              </li>
              <li className="flex items-start gap-4">
                <CheckCircle2 className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                <span>আপনার ওজন কমপক্ষে ৫০ কেজি হতে হবে।</span>
              </li>
              <li className="flex items-start gap-4">
                <CheckCircle2 className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                <span>আপনাকে শারীরিকভাবে সুস্থ এবং রক্তবাহিত রোগমুক্ত হতে হবে।</span>
              </li>
              <li className="flex items-start gap-4">
                <CheckCircle2 className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                <span>রক্তচাপ স্বাভাবিক এবং হিমোগ্লোবিনের মাত্রা সঠিক থাকতে হবে।</span>
              </li>
               <li className="flex items-start gap-4">
                <CheckCircle2 className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                <span>নারী darদের ক্ষেত্রে, গর্ভাবস্থায় বা সন্তান জন্মের ১ বছরের মধ্যে রক্তদান করা উচিত নয়।</span>
              </li>
            </ul>
          </div>
          <div>
             <Image
                src="https://placehold.co/600x400.png"
                alt="Happy blood donor"
                data-ai-hint="happy donor"
                width={600}
                height={400}
                className="rounded-lg object-cover w-full h-full shadow-xl"
              />
          </div>
        </div>
      </section>

      <section className="bg-primary/5 w-full py-16 md:py-24">
        <div className="container mx-auto px-4">
            <h2 className="text-center text-3xl font-bold text-primary md:text-4xl font-headline">
                রক্তদানের উপকারিতা
            </h2>
            <Separator className="my-8" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <Card className="p-6 shadow-lg">
                    <HeartPulse className="mx-auto h-12 w-12 text-primary mb-4" />
                    <h3 className="text-xl font-bold">হার্ট ভালো থাকে</h3>
                    <p className="text-muted-foreground mt-2">নিয়মিত রক্তদান করলে শরীরে আয়রনের মাত্রা নিয়ন্ত্রণে থাকে, যা হৃদরোগ ও হার্ট অ্যাটাকের ঝুঁকি কমায়।</p>
                </Card>
                <Card className="p-6 shadow-lg">
                    <ShieldCheck className="mx-auto h-12 w-12 text-primary mb-4" />
                    <h3 className="text-xl font-bold">নতুন রক্তকণিকা তৈরি হয়</h3>
                    <p className="text-muted-foreground mt-2">রক্তদানের পর শরীর নতুন রক্তকণিকা তৈরিতে উৎসাহিত হয়, যা শরীরের রক্ত সঞ্চালন ব্যবস্থাকে সতেজ ও فعال রাখে।</p>
                </Card>
                <Card className="p-6 shadow-lg">
                    <Stethoscope className="mx-auto h-12 w-12 text-primary mb-4" />
                    <h3 className="text-xl font-bold">বিনামূল্যে স্বাস্থ্য পরীক্ষা</h3>
                    <p className="text-muted-foreground mt-2">প্রতিবার রক্তদানের আগে আপনার রক্তচাপ, হিমোগ্লোবিন, এবং শরীরের তাপমাত্রা পরীক্ষা করা হয়, যা আপনার স্বাস্থ্যের একটি চিত্র দেয়।</p>
                </Card>
            </div>
        </div>
      </section>

       <section className="container mx-auto py-16 md:py-24 px-4">
        <h2 className="text-center text-3xl font-bold text-primary md:text-4xl font-headline">
            রক্তদান প্রক্রিয়া
        </h2>
        <Separator className="my-8" />
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="flex items-start gap-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xl flex-shrink-0">১</div>
                <div>
                    <h3 className="text-xl font-bold">নিবন্ধন ও স্বাস্থ্য পরীক্ষা</h3>
                    <p className="text-muted-foreground mt-1">প্রথমে আপনাকে একটি ফর্ম পূরণ করতে হবে এবং একজন স্বাস্থ্যকর্মী আপনার সাধারণ স্বাস্থ্য (রক্তচাপ, হিমোগ্লোবিন) পরীক্ষা করবেন।</p>
                </div>
            </div>
             <div className="flex items-start gap-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xl flex-shrink-0">২</div>
                <div>
                    <h3 className="text-xl font-bold">রক্ত সংগ্রহ</h3>
                    <p className="text-muted-foreground mt-1">আপনাকে একটি আরামদায়ক আসনে বসানো হবে এবং একজন প্রশিক্ষিত নার্স বা টেকনিশিয়ান একটি জীবাণুমুক্ত সুচের মাধ্যমে আপনার বাহু থেকে রক্ত সংগ্রহ করবেন, যা প্রায় ৮-১০ মিনিট সময় নেয়।</p>
                </div>
            </div>
             <div className="flex items-start gap-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xl flex-shrink-0">৩</div>
                <div>
                    <h3 className="text-xl font-bold">বিশ্রাম ও জলখাবার</h3>
                    <p className="text-muted-foreground mt-1">রক্তদানের পর আপনাকে কিছুক্ষণ বিশ্রাম নিতে বলা হবে এবং হালকা কিছু জলখাবার ও পানীয় দেওয়া হবে। এটি আপনার শরীরের চিনির মাত্রা স্বাভাবিক রাখতে সাহায্য করে।</p>
                </div>
            </div>
        </div>
      </section>

    </div>
  );
}
