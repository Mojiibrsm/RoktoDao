"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { HeartHandshake, Menu, LogOut, UserCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About Us' },
  { href: '/search-donors', label: 'Search Donors' },
  { href: '/request-blood', label: 'Request Blood' },
];

export default function Header() {
  const { user, loading, signOutUser } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOutUser();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-primary text-xl">
          <HeartHandshake className="h-7 w-7" />
          <span className="font-headline">RoktoBondhu</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {loading ? (
             <div className="h-10 w-24 animate-pulse rounded-md bg-muted-foreground/20"></div>
          ) : user ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                 <Link href="/profile"><UserCircle className="mr-2 h-4 w-4" />Profile</Link>
              </Button>
              <Button variant="destructive" size="sm" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>

        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-6 pt-8">
                {navLinks.map(link => (
                  <Link key={link.href} href={link.href} className="text-lg font-medium text-muted-foreground transition-colors hover:text-primary">
                    {link.label}
                  </Link>
                ))}
              </nav>
               <div className="mt-8 flex flex-col gap-4">
                  {loading ? (
                    <div className="h-10 w-full animate-pulse rounded-md bg-muted-foreground/20"></div>
                  ) : user ? (
                    <>
                      <Button variant="ghost" asChild>
                         <Link href="/profile"><UserCircle className="mr-2 h-4 w-4" />Profile</Link>
                      </Button>
                      <Button variant="destructive" onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" asChild>
                        <Link href="/login">Login</Link>
                      </Button>
                      <Button asChild>
                        <Link href="/signup">Sign Up</Link>
                      </Button>
                    </>
                  )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
