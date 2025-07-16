import type { Donor } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, MapPin, CalendarCheck2, UserCheck, Droplet } from 'lucide-react';
import { differenceInDays, format, parseISO } from 'date-fns';

type DonorCardProps = {
  donor: Donor;
};

export default function DonorCard({ donor }: DonorCardProps) {
  const lastDonatedDaysAgo = donor.lastDonationDate
    ? differenceInDays(new Date(), parseISO(donor.lastDonationDate))
    : null;
    
  const canDonate = lastDonatedDaysAgo === null || lastDonatedDaysAgo >= 120;
  const isAvailable = canDonate && donor.isAvailable;

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
            <CardTitle className="text-xl font-bold">{donor.fullName}</CardTitle>
            <Badge variant={isAvailable ? 'default' : 'destructive'} className={isAvailable ? 'bg-green-600 text-white' : 'bg-destructive'}>
                {isAvailable ? 'Available' : 'Unavailable'}
            </Badge>
        </div>
        <CardDescription className="flex items-center gap-2 pt-2">
            <Droplet className="h-5 w-5 text-primary" />
            <span className="font-bold text-primary text-lg">{donor.bloodGroup}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Phone className="h-5 w-5 flex-shrink-0" />
          <span>{donor.phoneNumber}</span>
        </div>
        <div className="flex items-center gap-3 text-muted-foreground">
          <MapPin className="h-5 w-5 flex-shrink-0" />
          <span>{`${donor.address.upazila}, ${donor.address.district}`}</span>
        </div>
        <div className="flex items-center gap-3 text-muted-foreground">
            <CalendarCheck2 className="h-5 w-5 flex-shrink-0" />
            {donor.lastDonationDate ? (
                <span>Last Donated: {format(parseISO(donor.lastDonationDate), "PPP")}</span>
            ) : (
                <span>Never donated before</span>
            )}
        </div>
         <div className="flex items-center gap-3 text-muted-foreground">
            <UserCheck className="h-5 w-5 flex-shrink-0" />
            <span>Eligibility: {canDonate ? "Can donate" : `Can donate in ${120-(lastDonatedDaysAgo || 0)} days`}</span>
        </div>
      </CardContent>
    </Card>
  );
}
