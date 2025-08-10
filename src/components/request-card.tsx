
"use client";

import type { BloodRequest } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplet, MapPin, Calendar, Syringe, Phone, AlertTriangle, Share2, HandHeart } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from './ui/badge';

interface RequestCardProps {
  req: BloodRequest;
  onRespond?: (request: BloodRequest) => void;
  showRespondButton?: boolean;
}

export default function RequestCard({ req, onRespond, showRespondButton = false }: RequestCardProps) {
  const { toast } = useToast();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "ক্লিপবোর্ডে কপি করা হয়েছে!" });
  };

  const formattedText = `🩸 জরুরী রক্তের আবেদন 🩸
রোগীর নামঃ ${req.patientName}
রক্তের গ্রুপঃ ${req.bloodGroup}
প্রয়োজনের তারিখঃ ${req.neededDate}
ব্যাগঃ ${req.numberOfBags}
হাসপাতালঃ ${req.hospitalLocation}, ${req.district}
যোগাযোগঃ ${req.contactPhone}`;

  const getStatusBadgeClass = () => {
    switch (req.status) {
        case 'Approved': return 'bg-blue-600';
        case 'Fulfilled': return 'bg-green-600';
        case 'Pending': return 'bg-yellow-500';
        case 'Rejected': return 'bg-destructive';
        default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="flex flex-col justify-between shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-primary/20">
      <CardHeader>
        <div className="flex items-start justify-between">
            <CardTitle className="flex items-start flex-col gap-2">
            <span className="text-xl flex items-center gap-2">
                {req.isEmergency && <AlertTriangle className="h-5 w-5 text-destructive" />}
                {req.patientName}
            </span>
            <Badge className={getStatusBadgeClass()}>{req.status}</Badge>
            </CardTitle>
            <span className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-base font-bold text-primary">
                <Droplet className="h-4 w-4" />
                {req.bloodGroup}
            </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 flex-grow">
        <div className="flex items-center gap-3 text-muted-foreground">
          <MapPin className="h-5 w-5 flex-shrink-0" />
          <span>{`${req.hospitalLocation}, ${req.district}`}</span>
        </div>
        <div className="flex items-center gap-3 text-muted-foreground">
          <Calendar className="h-5 w-5 flex-shrink-0" />
          <span>প্রয়োজন: {req.neededDate}</span>
        </div>
        <div className="flex items-center gap-3 text-muted-foreground">
          <Phone className="h-5 w-5 flex-shrink-0" />
          <span>যোগাযোগ: {req.contactPhone}</span>
        </div>
        <div className="flex items-center gap-3 text-muted-foreground">
          <Syringe className="h-5 w-5 flex-shrink-0" />
          <span>{req.numberOfBags} ব্যাগ</span>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2">
        <Button onClick={() => handleCopy(formattedText)} variant="outline" className="w-full">
            <Share2 className="mr-2 h-4 w-4"/>
            শেয়ার করুন
        </Button>
        {showRespondButton && onRespond && req.status !== 'Fulfilled' && (
          <Button onClick={() => onRespond(req)} className="w-full bg-green-600 hover:bg-green-700">
            <HandHeart className="mr-2 h-4 w-4"/>
            আমি রক্ত দিতে চাই
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
