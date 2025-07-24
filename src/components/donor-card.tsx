import type { Donor } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { cn } from '@/lib/utils';

type DonorCardProps = {
  donor: Donor;
};

export default function DonorCard({ donor }: DonorCardProps) {
  const isAvailable = donor.isAvailable;

  return (
    <Card className={cn(
        "text-center shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2",
        isAvailable ? 'border-transparent' : 'border-destructive/50 bg-destructive/5'
    )}>
      <CardContent className="p-6 flex flex-col items-center gap-3">
        <Avatar className="h-32 w-32 border-4 border-white shadow-md">
            <AvatarImage src={donor.profilePictureUrl || 'https://placehold.co/150x150.png'} alt={donor.fullName} />
            <AvatarFallback>{donor.fullName?.[0].toUpperCase()}</AvatarFallback>
        </Avatar>

        <h3 className="text-2xl font-bold font-headline mt-4">{donor.fullName}</h3>

        <p className="text-2xl font-bold text-primary">{donor.bloodGroup}</p>

        <p className="text-muted-foreground text-base">{donor.address.district}</p>

        {donor.donationCount && donor.donationCount > 0 && (
            <div className="mt-2 bg-primary/10 text-primary font-semibold px-4 py-2 rounded-full">
                দান করেছেন: {donor.donationCount} বার
            </div>
        )}

        {!isAvailable && (
             <div className="mt-2 bg-destructive/10 text-destructive font-semibold px-4 py-2 rounded-full">
                অনুপলব্ধ
            </div>
        )}
      </CardContent>
    </Card>
  );
}
