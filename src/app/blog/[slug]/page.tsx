
import { getBlogPostBySlug } from '@/lib/blog-data';
import { notFound } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { Calendar, User } from 'lucide-react';
import Image from 'next/image';

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getBlogPostBySlug(params.slug);

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
                  <span>{post.date}</span>
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

// Basic prose styling for blog content
const proseStyles = `
  .prose h2 {
    font-size: 1.875rem;
    margin-top: 2.5em;
    margin-bottom: 1em;
    font-weight: 600;
  }
  .prose p {
    margin-bottom: 1.25em;
  }
  .prose ul {
    list-style-type: disc;
    padding-left: 1.5em;
    margin-bottom: 1.25em;
  }
  .prose li {
    margin-bottom: 0.5em;
  }
  .prose a {
    color: hsl(var(--primary));
    text-decoration: none;
  }
  .prose a:hover {
    text-decoration: underline;
  }
`;

export function generateStaticParams() {
  // You might want to fetch this from a real data source
  const posts = [
    { slug: 'the-importance-of-regular-donation' },
    { slug: 'myths-about-blood-donation' },
    { slug: 'how-your-donation-saves-lives' },
  ];
  return posts.map((post) => ({
    slug: post.slug,
  }));
}
