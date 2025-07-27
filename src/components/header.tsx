
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Droplet, Menu, LogOut, UserCircle, HeartHandshake, LayoutDashboard, Info, Phone, Users } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import NoticeBar from './notice-bar';

const navLinks = [
  { href: '/search-donors', label: 'রক্তদাতা খুঁজুন' },
  { href: '/request-blood', label: 'রক্তের অনুরোধ' },
  { href: '/about', label: 'আমাদের সম্পর্কে' },
  { href: '/team', label: 'আমাদের টিম' },
];

export default function Header() {
  const { user, loading, signOutUser, isAdmin } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOutUser();
    router.push('/');
  };

  const profileLink = isAdmin ? '/admin' : '/profile';
  const profileButtonLabel = isAdmin ? 'ড্যাশবোর্ড' : 'প্রোফাইল';
  const ProfileIcon = isAdmin ? LayoutDashboard : UserCircle;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <NoticeBar />
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-primary text-xl">
          <Droplet className="h-7 w-7" />
          <span className="font-headline">RoktoDao</span>
          <HeartHandshake className="h-7 w-7" />
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary flex items-center gap-2">
              {link.label}
            </Link>
          ))}
           <Link href="mailto:support@roktobondhu.org" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              যোগাযোগ
            </Link>
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {loading ? (
             <div className="h-10 w-24 animate-pulse rounded-md bg-muted-foreground/20"></div>
          ) : user ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                 <Link href={profileLink}><ProfileIcon className="mr-2 h-4 w-4" />{profileButtonLabel}</Link>
              </Button>
              <Button variant="destructive" size="sm" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                লগআউট
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link href="/login">লগইন</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">রেজিস্ট্রেশন</Link>
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
               <SheetHeader>
                <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-6 pt-8">
                {navLinks.map(link => (
                  <Link key={link.href} href={link.href} className="text-lg font-medium text-muted-foreground transition-colors hover:text-primary flex items-center gap-2">
                    {link.label}
                  </Link>
                ))}
                 <Link href="/why-donate-blood" className="text-lg font-medium text-muted-foreground transition-colors hover:text-primary">
                    কেন রক্ত দিবেন
                  </Link>
                  <Link href="/faq" className="text-lg font-medium text-muted-foreground transition-colors hover:text-primary">
                    সাধারণ জিজ্ঞাসা
                  </Link>
                   <Link href="mailto:support@roktobondhu.org" className="text-lg font-medium text-muted-foreground transition-colors hover:text-primary">
                    যোগাযোগ
                  </Link>
              </nav>
               <div className="mt-8 flex flex-col gap-4">
                  {loading ? (
                    <div className="h-10 w-full animate-pulse rounded-md bg-muted-foreground/20"></div>
                  ) : user ? (
                    <>
                      <Button variant="ghost" asChild>
                         <Link href={profileLink}><ProfileIcon className="mr-2 h-4 w-4" />{profileButtonLabel}</Link>
                      </Button>
                      <Button variant="destructive" onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        লগআউট
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" asChild>
                        <Link href="/login">লগইন</Link>
                      </Button>
                      <Button asChild>
                        <Link href="/signup">রেজিস্ট্রেশন</Link>
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
