
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Globe, Save } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Textarea } from '@/components/ui/textarea';

const initialPages = [
    {
        id: 'home',
        name: 'Home Page',
        path: '/',
        title: 'RoktoDao - রক্ত দিন, জীবন বাঁচান',
        description: 'জরুরী মুহূর্তে রক্ত খুঁজে পেতে এবং রক্তদানের মাধ্যমে জীবন বাঁচাতে সাহায্য করার জন্য একটি অনলাইন প্ল্যাটফর্ম।',
        keywords: 'blood donation, RoktoDao, emergency blood, find donor, রক্তদান',
    },
    {
        id: 'about',
        name: 'About Us',
        path: '/about',
        title: 'আমাদের সম্পর্কে | RoktoDao',
        description: 'আমাদের লক্ষ্য এবং উদ্দেশ্য সম্পর্কে জানুন। আমরা রক্তদাতা এবং গ্রহীতাদের মধ্যে একটি সেতুবন্ধন তৈরির লক্ষ্যে কাজ করছি।',
        keywords: 'about RoktoDao, our mission, vision, রক্তবন্ধু',
    },
    {
        id: 'blog',
        name: 'Blog',
        path: '/blog',
        title: 'ব্লগ | RoktoDao',
        description: 'রক্তদান সম্পর্কিত সর্বশেষ খবর, টিপস এবং তথ্য পেতে আমাদের ব্লগ পড়ুন।',
        keywords: 'blood donation blog, health tips, stories, রক্তদান ব্লগ',
    }
];


export default function SeoManagementPage() {
    const { toast } = useToast();
    const [pages, setPages] = useState(initialPages);

    const handleInputChange = (pageId: string, field: 'title' | 'description' | 'keywords', value: string) => {
        setPages(pages.map(page =>
            page.id === pageId ? { ...page, [field]: value } : page
        ));
    };

    const handleSaveChanges = () => {
        // Here you would typically save the 'pages' state to your database (e.g., Firestore)
        console.log('Saving SEO data:', pages);
        toast({
            title: "SEO Settings Saved",
            description: "Your changes have been successfully saved.",
        });
    };

    return (
        <div className="space-y-8">
            <header className="py-4">
                <h1 className="text-2xl font-bold tracking-tight text-primary md:text-3xl font-headline flex items-center gap-2">
                    <Globe /> SEO Management
                </h1>
                <p className="text-muted-foreground">Manage Search Engine Optimization settings for your pages.</p>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>Page Metadata</CardTitle>
                    <CardDescription>Update the meta title, description, and keywords for each page to improve search engine visibility.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        {pages.map(page => (
                             <AccordionItem value={page.id} key={page.id}>
                                <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                                    {page.name} <code className="text-sm text-muted-foreground ml-4 p-1 bg-muted rounded-md">{page.path}</code>
                                </AccordionTrigger>
                                <AccordionContent className="space-y-4 pt-2">
                                    <div className="space-y-2">
                                        <Label htmlFor={`title-${page.id}`}>Meta Title</Label>
                                        <Input 
                                            id={`title-${page.id}`} 
                                            value={page.title} 
                                            onChange={(e) => handleInputChange(page.id, 'title', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`description-${page.id}`}>Meta Description</Label>
                                        <Textarea
                                            id={`description-${page.id}`} 
                                            value={page.description} 
                                            onChange={(e) => handleInputChange(page.id, 'description', e.target.value)}
                                            rows={3}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`keywords-${page.id}`}>Keywords (comma separated)</Label>
                                        <Input
                                            id={`keywords-${page.id}`}
                                            value={page.keywords} 
                                            onChange={(e) => handleInputChange(page.id, 'keywords', e.target.value)}
                                        />
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button onClick={handleSaveChanges} size="lg">
                    <Save className="mr-2 h-4 w-4" />
                    Save All Changes
                </Button>
            </div>
        </div>
    );
}
