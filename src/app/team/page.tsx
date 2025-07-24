"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Crown, Shield, Mail, Phone, MapPin, User, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const administrators = [
  {
    name: "Mojib Rsm",
    role: "প্রধান পরিচালক",
    bloodGroup: "O+",
    phone: "01601519007",
    email: "mojibrsm@example.com",
    location: "Ramu, Cox's Bazar",
    avatar: "https://placehold.co/100x100.png",
    avatarHint: "man portrait"
  }
];

const moderators = [
  {
    name: "Abdullah Al Jahir",
    role: "Moderator",
    bloodGroup: "O+",
    phone: "01749395673",
    email: "abdullahaljahir017@gmail.com",
    location: "Barisal Sadar, Barishal, Barishal",
    avatar: "https://placehold.co/100x100.png",
    avatarHint: "man smiling"
  },
  {
    name: "Nasim-Ul-Goni",
    role: "Moderator",
    bloodGroup: "A+",
    phone: "01957379804",
    email: "experimentmr2@gmail.com",
    location: "Melandaha, Jamalpur, Mymensingh",
    avatar: "https://placehold.co/100x100.png",
    avatarHint: "man professional"
  },
  {
    name: "John Doe",
    role: "Moderator",
    bloodGroup: "AB+",
    phone: "01234567890",
    email: "johndoe@example.com",
    location: "Dhaka, Bangladesh",
    avatar: "https://placehold.co/100x100.png",
    avatarHint: "person smiling"
  },
  {
    name: "Jane Smith",
    role: "Moderator",
    bloodGroup: "A-",
    phone: "01987654321",
    email: "janesmith@example.com",
    location: "Chittagong, Bangladesh",
    avatar: "https://placehold.co/100x100.png",
    avatarHint: "woman professional"
  },
   {
    name: "Alex Johnson",
    role: "Moderator",
    bloodGroup: "O-",
    phone: "01555555555",
    email: "alexj@example.com",
    location: "Sylhet, Bangladesh",
    avatar: "https://placehold.co/100x100.png",
    avatarHint: "person portrait"
  }
];

const TeamMemberCard = ({ member }: { member: typeof administrators[0] | typeof moderators[0] }) => {
    const { toast } = useToast();
    const handleCopy = (number: string) => {
        navigator.clipboard.writeText(number);
        toast({ title: "Number copied!" });
    };

    return (
      <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-2 border-primary/20">
              <AvatarImage src={member.avatar} alt={member.name} data-ai-hint={member.avatarHint} />
              <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h3 className="text-xl font-bold font-headline">{member.name}</h3>
              <div className="flex items-center gap-2">
                <Badge variant={member.role === 'প্রধান পরিচালক' ? 'destructive' : 'secondary'}>{member.role}</Badge>
                <Badge variant="outline" className="text-primary border-primary">{member.bloodGroup}</Badge>
              </div>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="space-y-2 text-muted-foreground">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4" />
                    <span>{member.phone}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleCopy(member.phone)} className="h-8 w-8">
                    <Copy className="h-4 w-4" />
                </Button>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4" />
              <span>{member.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4" />
              <span>{member.location}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
};

export default function TeamPage() {
  return (
    <div className="bg-background">
      <section className="w-full bg-primary/10 py-20 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tighter text-primary md:text-6xl font-headline">
            আমাদের নিবেদিত টিম
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-lg text-foreground/80 md:text-xl">
            আমরা একটি उत्साही দল, যারা রক্তদানের মাধ্যমে জীবন বাঁচাতে এবং сообщество গড়তে প্রতিশ্রুতিবদ্ধ।
          </p>
        </div>
      </section>

      <section className="container mx-auto py-16 md:py-24 px-4 space-y-12">
        <div>
          <div className="flex items-center justify-center gap-3 mb-6">
            <Crown className="h-8 w-8 text-amber-500" />
            <h2 className="text-3xl font-bold font-headline text-primary">প্রধান পরিচালক</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
            {administrators.map((member) => (
              <div key={member.email} className="lg:col-start-2 flex justify-center">
                <TeamMemberCard member={member} />
              </div>
            ))}
          </div>
        </div>
        
        <Separator />

        <div>
           <div className="flex items-center gap-3 mb-6">
            <Shield className="h-8 w-8 text-blue-500" />
            <h2 className="text-3xl font-bold font-headline text-primary">Moderators</h2>
            <Badge variant="default" className="text-lg">{moderators.length}</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {moderators.map((member) => (
              <TeamMemberCard key={member.email} member={member} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
