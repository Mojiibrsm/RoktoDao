
import type { Metadata } from 'next';
import { PT_Sans } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/context/auth-provider';
import Header from '@/components/header';
import Footer from '@/components/footer';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import './globals.css';

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://roktodao.bartanow.com'),
  title: {
    default: 'RoktoDao - রক্ত দিন, জীবন বাঁচান',
    template: '%s | RoktoDao',
  },
  description: 'জরুরী মুহূর্তে রক্ত খুঁজে পেতে এবং রক্তদানের মাধ্যমে জীবন বাঁচাতে সাহায্য করার জন্য একটি অনলাইন প্ল্যাটফর্ম। RoktoDao is a platform to find blood in emergency and save lives through blood donation.',
  keywords: ['blood donation', 'RoktoDao', 'emergency blood', 'find donor', 'রক্তদান', 'রক্ত দাও', 'জরুরী রক্ত'],
  verification: {
    google: '9hdDjfCFxhYkkaDpgTL0XWMlTPhQEq0uHKkn8YlickE',
  },
   openGraph: {
    title: 'RoktoDao - রক্ত দিন, জীবন বাঁচান',
    description: 'জরুরী মুহূর্তে রক্ত খুঁজে পেতে এবং রক্তদানের মাধ্যমে জীবন বাঁচাতে সাহায্য করার জন্য একটি অনলাইন প্ল্যাটফর্ম।',
    url: 'https://roktodao.bartanow.com',
    siteName: 'RoktoDao',
    images: [
      {
        url: 'https://ik.imagekit.io/uekohag7w/roktodao/gallery/About%20us%20page%20Roktodao',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'bn_BD',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
   twitter: {
    card: 'summary_large_image',
    title: 'RoktoDao - রক্ত দিন, জীবন বাঁচান',
    description: 'জরুরী মুহূর্তে রক্ত খুঁজে পেতে এবং রক্তদানের মাধ্যমে জীবন বাঁচাতে সাহায্য করার জন্য একটি অনলাইন প্ল্যাটফর্ম।',
    images: ['https://ik.imagekit.io/uekohag7w/roktodao/gallery/About%20us%20page%20Roktodao'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased ${ptSans.variable}`}>
        {process.env.NEXT_PUBLIC_GA_TRACKING_ID && <GoogleAnalytics GA_TRACKING_ID={process.env.NEXT_PUBLIC_GA_TRACKING_ID} />}
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
