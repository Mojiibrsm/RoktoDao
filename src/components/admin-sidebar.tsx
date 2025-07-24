
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Droplet, Home, Users, Bell, UserPlus, Settings, MessageSquareWarning, Droplet as BloodDrop } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';

const navLinks = [
  { href: '/admin', label: 'Dashboard', icon: Home },
  { href: '/admin/donors', label: 'Donors', icon: Users },
  { href: '/admin/requests', label: 'Blood Requests', icon: BloodDrop },
  { href: '/admin/notifications', label: 'Notifications', icon: Bell },
  { href: '/admin/users', label: 'Admin Users', icon: UserPlus },
  { href: '/admin/feedback', label: 'Feedback/Reports', icon: MessageSquareWarning },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 flex-col border-r bg-background sm:flex">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/admin" className="flex items-center gap-2 font-semibold">
          <Droplet className="h-6 w-6 text-primary" />
          <span className="">RoktoDao Admin</span>
        </Link>
      </div>
      <nav className="flex-1 overflow-auto py-4">
        <div className="flex-1">
          <ul className="grid items-start px-4 text-sm font-medium">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                    {
                      'bg-muted text-primary': pathname === href,
                    }
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
      <Separator />
       <div className="p-4">
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
              Back to Main Site
          </Link>
       </div>
    </aside>
  );
}
