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
          <CardTitle className="mt-4 text-3xl font-headline text-primary">Thank You!</CardTitle>
          <CardDescription className="mt-2 text-lg text-muted-foreground">
            Your submission has been received. We appreciate your contribution to this life-saving cause.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-6">
            Together, we can make a difference. Every drop counts.
          </p>
          <Button asChild size="lg">
            <Link href="/">Return to Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
