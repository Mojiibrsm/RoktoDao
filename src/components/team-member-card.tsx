
"use client";

import { Card, CardContent } from '@/components/ui/card';
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

const TeamMemberCard = ({ member }: { member: Member }) => {
    const { toast } = useToast();
    const handleCopy = (number: string) => {
        navigator.clipboard.writeText(number);
        toast({ title: "Number copied!" });
    };

    return (
      <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 w-full max-w-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-2 border-primary/20">
              <AvatarImage src={member.avatar} alt={member.name} data-ai-hint={member.avatarHint} />
              <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h3 className="text-xl font-bold font-headline">{member.name}</h3>
              <div className="flex items-center gap-2">
                <Badge variant='secondary'>{member.role}</Badge>
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

export default TeamMemberCard;
