
"use client";

import type { Donor } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { cn } from '@/lib/utils';
import { format, differenceInDays, addDays } from 'date-fns';
import { Phone, MapPin, Calendar, UserCheck, Droplet, Copy } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import Image from 'next/image';

type DonorCardProps = {
  donor: Donor;
};

export default function DonorCard({ donor }: DonorCardProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState(donor.profilePictureUrl || '');

  useEffect(() => {
    if (typeof window !== 'undefined') {
        const storedImage = localStorage.getItem(`profilePic_${donor.uid}`);
        if (storedImage) {
            setProfileImageUrl(storedImage);
        }
    }
  }, [donor.uid]);
  
  const isAvailable = donor.isAvailable;
  
  const eligibility = () => {
    if (!donor.lastDonationDate) {
      return { canDonate: true, daysRemaining: 0 };
    }
    const lastDonation = new Date(donor.lastDonationDate);
    const nextDonationDate = addDays(lastDonation, 120); // Assuming 120 days restriction
    const daysRemaining = differenceInDays(nextDonationDate, new Date());

    if (daysRemaining <= 0) {
      return { canDonate: true, daysRemaining: 0 };
    }
    return { canDonate: false, daysRemaining };
  };

  const eligibilityStatus = eligibility();

  const handleCopy = () => {
    navigator.clipboard.writeText(donor.phoneNumber);
    setCopied(true);
    toast({ title: "Number copied!" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-primary/20">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
                 <Avatar className="h-12 w-12">
                    <AvatarImage src={profileImageUrl} alt={donor.fullName} />
                    <AvatarFallback>{donor.fullName?.[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                    <h3 className="text-xl font-bold font-headline">{donor.fullName}</h3>
                    <p className="flex items-center gap-2 text-primary font-bold text-lg">
                        <Droplet className="h-5 w-5" />
                        {donor.bloodGroup}
                    </p>
                </div>
            </div>
            <Badge variant={isAvailable && eligibilityStatus.canDonate ? 'default' : 'destructive'} className={isAvailable && eligibilityStatus.canDonate ? 'bg-green-600 text-white' : 'bg-destructive text-destructive-foreground'}>
              {(isAvailable && eligibilityStatus.canDonate) ? 'উপলব্ধ' : 'অনুপলব্ধ'}
            </Badge>
        </div>

        <div className="space-y-3 text-muted-foreground">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4" />
                    <span>{donor.phoneNumber}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={handleCopy} className="h-8 w-8">
                    <Copy className="h-4 w-4" />
                </Button>
            </div>
            <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4" />
                <span>{`${donor.address.upazila}, ${donor.address.district}`}</span>
            </div>
            {donor.lastDonationDate && (
                <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4" />
                    <span>শেষ রক্তদান: {format(new Date(donor.lastDonationDate), "PPP")}</span>
                </div>
            )}
             <div className="flex items-center gap-3">
                <UserCheck className="h-4 w-4" />
                <span>
                    {eligibilityStatus.canDonate 
                        ? 'রক্তদানে সক্ষম'
                        : `${eligibilityStatus.daysRemaining} দিন পর রক্ত দিতে পারবেন`
                    }
                </span>
            </div>
             {donor.donationCount && donor.donationCount > 0 && (
                <div className="flex items-center gap-3">
                    <Droplet className="h-4 w-4" />
                    <span>
                        {donor.donationCount} বার রক্ত দিয়েছেন
                    </span>
                </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}

    