
'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import type { BlogPost } from '@/lib/types';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';

async function getBlogPosts(): Promise<BlogPost[]> {
    try {
        const { data, error } = await supabase
            .from('blogs')
            .select('*')
            .order('createdAt', { ascending: false });

        if (error) throw error;
        return data as BlogPost[];
    } catch (error) {
        console.error("Error fetching blog posts from Supabase: ", error);
        return [];
    }
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
        const fetchedPosts = await getBlogPosts();
        setPosts(fetchedPosts);
        setLoading(false);
    }
    fetchPosts();
  }, []);

  return (
    <div className="bg-background">
      <section className="w-full bg-primary/10 py-20 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tighter text-primary md:text-6xl font-headline">
            RoktoDao Blog
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-lg text-foreground/80 md:text-xl">
            Stay updated with the latest news, stories, and information about blood donation.
          </p>
        </div>
      </section>

      <section className="container mx-auto py-16 md:py-24 px-4">
        {loading ? (
          <div className="text-center">Loading posts...</div>
        ) : posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post: BlogPost) => (
              <a key={post.id} href={post.link} target="_blank" rel="noopener noreferrer" className="flex flex-col no-underline">
                <Card className="flex flex-col flex-grow overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <Image
                      src={post.image}
                      alt={post.title}
                      width={600}
                      height={400}
                      className="w-full h-48 object-cover"
                      data-ai-hint={post.hint}
                    />
                  <CardHeader>
                    <CardTitle>{post.title}</CardTitle>
                    <CardDescription>
                      <span>{new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span> &bull; <span>by {post.author}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-muted-foreground">{post.excerpt}</p>
                  </CardContent>
                  <CardFooter>
                     <p className="text-sm font-medium text-primary hover:underline flex items-center">
                      বিস্তারিত পড়ুন <ArrowRight className="ml-2 h-4 w-4" />
                    </p>
                  </CardFooter>
                </Card>
              </a>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">No blog posts found.</p>
        )}
      </section>
    </div>
  );
}
