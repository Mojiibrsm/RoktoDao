"use client";

import type { BloodRequest } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplet, MapPin, Calendar, Syringe, Phone, AlertTriangle, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';

export default function RequestCard({ req }: { req: BloodRequest }) {
  const { toast } = useToast();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard!" });
  };

  const formattedText = `🩸 জরুরী রক্তের আবেদন 🩸
রোগীর নামঃ ${req.patientName}
রক্তের গ্রুপঃ ${req.bloodGroup}
প্রয়োজনের তারিখঃ ${format(new Date(req.neededDate), "PPP")}
ব্যাগঃ ${req.numberOfBags}
হাসপাতালঃ ${req.hospitalLocation}, ${req.district}
যোগাযোগঃ ${req.contactPhone}`;

  return (
    <Card className="flex flex-col justify-between shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-start justify-between">
          <span className="text-xl flex items-center gap-2">
            {req.isEmergency && <AlertTriangle className="h-5 w-5 text-destructive" />}
            {req.patientName}
          </span>
          <span className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-base font-bold text-primary">
            <Droplet className="h-4 w-4" />
            {req.bloodGroup}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 flex-grow">
        <div className="flex items-center gap-3 text-muted-foreground">
          <MapPin className="h-5 w-5 flex-shrink-0" />
          <span>{`${req.hospitalLocation}, ${req.district}`}</span>
        </div>
        <div className="flex items-center gap-3 text-muted-foreground">
          <Calendar className="h-5 w-5 flex-shrink-0" />
          <span>Needed by: {format(new Date(req.neededDate), "PPP")}</span>
        </div>
        <div className="flex items-center gap-3 text-muted-foreground">
          <Phone className="h-5 w-5 flex-shrink-0" />
          <span>Contact: {req.contactPhone}</span>
        </div>
        <div className="flex items-center gap-3 text-muted-foreground">
          <Syringe className="h-5 w-5 flex-shrink-0" />
          <span>{req.numberOfBags} Bag(s)</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={() => handleCopy(formattedText)} variant="outline" className="w-full">
            <Share2 className="mr-2 h-4 w-4"/>
            শেয়ার করুন
        </Button>
      </CardFooter>
    </Card>
  );
}
