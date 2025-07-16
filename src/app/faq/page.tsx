
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Separator } from "@/components/ui/separator";

const faqs = [
  {
    question: "রক্তদানের জন্য সর্বনিম্ন বয়স কত?",
    answer: "রক্তদানের জন্য আপনার বয়স কমপক্ষে ১৮ বছর হতে হবে। কিছু ক্ষেত্রে, ১৬ বা ১৭ বছর বয়সীরাও পিতামাতার সম্মতিতে রক্তদান করতে পারে, তবে আমাদের প্ল্যাটফর্মে আমরা ১৮+ বয়সকে উৎসাহিত করি।"
  },
  {
    question: "আমার ওজন কত কেজি হওয়া প্রয়োজন?",
    answer: "সুস্থভাবে রক্তদানের জন্য আপনার ওজন কমপক্ষে ৫০ কেজি (১১০ পাউন্ড) হওয়া উচিত।"
  },
  {
    question: "কতদিন পর পর রক্তদান করা যায়?",
    answer: "সাধারণত, একজন সুস্থ পুরুষ প্রতি ৩ মাস (১২ সপ্তাহ) পর পর এবং একজন সুস্থ নারী প্রতি ৪ মাস (১৬ সপ্তাহ) পর পর রক্তদান করতে পারেন।"
  },
  {
    question: "রক্তদান করতে কত সময় লাগে?",
    answer: "সম্পূর্ণ প্রক্রিয়াটি, রেজিস্ট্রেশন থেকে শুরু করে বিশ্রাম পর্যন্ত, প্রায় ৩০-৪৫ মিনিট সময় নিতে পারে। তবে, রক্ত সংগ্রহ করতে সাধারণত ৮-১০ মিনিটের বেশি সময় লাগে না।"
  },
  {
    question: "রক্ত দিলে কি আমার শরীরে রক্তের অভাব হবে?",
    answer: "না, রক্তদানের পর আপনার শরীর ২৪-৪৮ ঘণ্টার মধ্যে রক্তের জলীয় অংশ (প্লাজমা) পূরণ করে ফেলে এবং কয়েক সপ্তাহের মধ্যে লোহিত রক্তকণিকা পুনরায় তৈরি করে নেয়। তাই এতে আপনার শরীরে রক্তের কোনো অভাব হয় না।"
  },
  {
    question: "কোনো রোগ থাকলে কি রক্তদান করা যায়?",
    answer: "কিছু নির্দিষ্ট রোগ যেমন - এইচআইভি/এইডস, হেপাটাইটিস বি বা সি, সিফিলিস, বা অন্য কোনো রক্তবাহিত রোগে আক্রান্ত ব্যক্তিরা রক্তদান করতে পারবেন না। এছাড়াও, ঠান্ডা, জ্বর বা অন্য কোনো অস্থায়ী অসুস্থতা থাকলে সুস্থ হওয়ার পর রক্তদান করা উচিত।"
  },
  {
    question: "রক্তদানের আগে আমার কী করা উচিত?",
    answer: "রক্তদানের আগে পর্যাপ্ত পরিমাণে পানি পান করুন, স্বাস্থ্যকর খাবার খান (বিশেষ করে আয়রন সমৃদ্ধ), এবং কমপক্ষে ৬-৮ ঘণ্টা ঘুমান।"
  }
];


export default function FAQPage() {
  return (
    <div className="bg-background">
      <section className="w-full bg-primary/10 py-20 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tighter text-primary md:text-6xl font-headline">
            প্রায়শই জিজ্ঞাসিত প্রশ্ন (FAQ)
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-lg text-foreground/80 md:text-xl">
            রক্তদান সম্পর্কে আপনার মনের সাধারণ প্রশ্নগুলোর উত্তর এখানে খুঁজুন।
          </p>
        </div>
      </section>

      <section className="container mx-auto py-16 md:py-24 px-4 max-w-4xl">
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
      </section>
    </div>
  );
}
