

import { Separator } from '@/components/ui/separator';
import { Calendar, User } from 'lucide-react';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import type { BlogPost } from '@/lib/types';
import { notFound } from 'next/navigation';

async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
    const blogsRef = collection(db, 'blogs');
    const q = query(blogsRef, where("slug", "==", slug), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return null;
    }
    
    const doc = querySnapshot.docs[0];
    const data = doc.data();

    return {
        id: doc.id,
        ...data
    } as BlogPost;
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getBlogPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="bg-background">
      <section className="w-full bg-primary/10 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <Image
              src={post.image}
              alt={post.title}
              width={1200}
              height={600}
              className="w-full max-h-[500px] object-cover rounded-lg shadow-xl"
              data-ai-hint={post.hint}
            />
        </div>
      </section>
      <article className="container mx-auto max-w-4xl py-12 md:py-16 px-4">
          <h1 className="text-3xl md:text-5xl font-bold font-headline text-primary mb-4">{post.title}</h1>
          <div className="flex items-center gap-6 text-muted-foreground mb-6">
              <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>By {post.author}</span>
              </div>
          </div>
          <Separator className="my-8" />
          <div 
            className="prose prose-lg dark:prose-invert max-w-none leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
      </article>
    </div>
  );
}
