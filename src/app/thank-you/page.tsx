
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

export default function ThankYouPage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg text-center shadow-xl">
        <CardHeader>
          <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
          <CardTitle className="mt-4 text-3xl font-headline text-primary">ধন্যবাদ!</CardTitle>
          <CardDescription className="mt-2 text-lg text-muted-foreground">
            আপনার অনুরোধটি সফলভাবে জমা দেওয়া হয়েছে। এই জীবন বাঁচানোর উদ্যোগে আপনার অবদানের জন্য আমরা কৃতজ্ঞ।
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-muted-foreground">
             আমাদের টিম শিগগিরই আপনার দেওয়া নম্বরে যোগাযোগ করে অনুরোধটি যাচাই করবে। অনুমোদনের পর আপনার অনুরোধটি আমাদের প্ল্যাটফর্মে লাইভ হবে।
          </p>
          <p className="mb-6">
            একসাথে, আমরা একটি পরিবর্তন আনতে পারি। প্রতিটি রক্তবিন্দুই মূল্যবান।
          </p>
          <Button asChild size="lg">
            <Link href="/">হোম পেজে ফিরে যান</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
