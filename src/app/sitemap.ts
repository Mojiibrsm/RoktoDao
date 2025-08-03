import { MetadataRoute } from 'next';

const URL = 'https://roktodao.bartanow.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    '/',
    '/about',
    '/blog',
    '/contact',
    '/faq',
    '/gallery',
    '/login',
    '/profile',
    '/request-blood',
    '/requests',
    '/search-donors',
    '/signup',
    '/team',
    '/thank-you',
    '/why-donate-blood',
  ];

  // In the future, you can fetch dynamic routes (e.g., for each blog post)
  // and add them to the sitemap.
  
  // const dynamicPosts = await fetch(...);
  // const postRoutes = dynamicPosts.map(post => ({...}));

  const routes = staticRoutes.map((route) => ({
    url: `${URL}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: route === '/' ? 1.0 : 0.8,
  }));

  return [
    ...routes,
    // ...postRoutes
  ];
}
