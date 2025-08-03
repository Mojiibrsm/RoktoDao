
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// Since we are linking to external blogs, this page is no longer necessary
// for displaying content. We'll just redirect to the main blog page.
export default function BlogPostPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/blog');
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-4">Redirecting...</p>
    </div>
  );
}
