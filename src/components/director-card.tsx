
"use client";

import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Mail, Phone, MapPin, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface Member {
  id: string;
  name: string;
  role: string;
  bloodGroup: string;
  phone: string;
  email: string;
  location: string;
  avatar: string;
  avatarHint?: string;
}

const DirectorCard = ({ member }: { member: Member }) => {
    const { toast } = useToast();
    const handleCopy = (number: string) => {
        navigator.clipboard.writeText(number);
        toast({ title: "Number copied!" });
    };

    return (
        <Card className="w-full max-w-2xl overflow-hidden shadow-xl transition-all duration-300 hover:shadow-2xl bg-gradient-to-br from-card to-muted/50">
            <div className="md:flex">
                <div className="md:flex-shrink-0 p-6 flex items-center justify-center">
                    <Avatar className="h-32 w-32 border-4 border-primary/30 shadow-lg">
                        <AvatarImage src={member.avatar} alt={member.name} data-ai-hint={member.avatarHint} />
                        <AvatarFallback className="text-4xl">{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                </div>
                <div className="p-6 flex-grow">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-3xl font-bold font-headline text-primary">{member.name}</h2>
                            <p className="text-lg font-semibold text-amber-600">{member.role}</p>
                        </div>
                        <Badge variant="outline" className="text-lg text-primary border-primary">{member.bloodGroup}</Badge>
                    </div>
                    <Separator className="my-4" />
                    <div className="space-y-3 text-muted-foreground text-sm">
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
                </div>
            </div>
        </Card>
    );
};

export default DirectorCard;
