import Link from 'next/link';
import { HeartHandshake } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t bg-card text-card-foreground">
      <div className="container mx-auto flex flex-col items-center justify-between gap-6 px-4 py-8 md:flex-row">
        <div className="flex items-center gap-2">
          <HeartHandshake className="h-6 w-6 text-primary" />
          <p className="text-lg font-bold text-primary font-headline">RoktoBondhu</p>
        </div>
        <div className="text-center text-sm text-muted-foreground md:text-left">
          <p>&copy; {new Date().getFullYear()} RoktoBondhu. All rights reserved.</p>
          <p>A mission to connect blood donors with recipients.</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">
            About Us
          </Link>
          <span className="text-muted-foreground">|</span>
          <Link href="/team" className="text-muted-foreground hover:text-primary transition-colors">
            Our Team
          </Link>
          <span className="text-muted-foreground">|</span>
          <Link href="mailto:support@roktodan.xyz" className="text-muted-foreground hover:text-primary transition-colors">
            support@roktodan.xyz
          </Link>
        </div>
      </div>
    </footer>
  );
}
