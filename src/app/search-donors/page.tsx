"use client";

import { useState, useEffect, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { bloodGroups, locations } from '@/lib/location-data';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Donor } from '@/lib/types';
import DonorCard from '@/components/donor-card';

export default function SearchDonorsPage() {
  const [bloodGroup, setBloodGroup] = useState('');
  const [division, setDivision] = useState('');
  const [district, setDistrict] = useState('');
  const [donors, setDonors] = useState<Donor[]>([]);
  const [isPending, startTransition] = useTransition();

  const handleSearch = () => {
    startTransition(async () => {
      const donorsRef = collection(db, 'donors');
      let q = query(donorsRef, where('isAvailable', '==', true));
      
      if (bloodGroup) {
        q = query(q, where('bloodGroup', '==', bloodGroup));
      }
      if (division) {
        q = query(q, where('address.division', '==', division));
      }
      if (district) {
        q = query(q, where('address.district', '==', district));
      }

      const querySnapshot = await getDocs(q);
      const fetchedDonors = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Donor[];
      setDonors(fetchedDonors);
    });
  };

  useEffect(() => {
    // Initial search for all available donors
    handleSearch();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container mx-auto py-12 px-4">
      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-primary">Search for Donors</CardTitle>
          <CardDescription>Find available blood donors in your area.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="blood-group">Blood Group</Label>
              <Select value={bloodGroup} onValueChange={setBloodGroup}>
                <SelectTrigger id="blood-group"><SelectValue placeholder="Any" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any</SelectItem>
                  {bloodGroups.map(group => <SelectItem key={group} value={group}>{group}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="division">Division</Label>
              <Select value={division} onValueChange={(val) => {setDivision(val); setDistrict('');}}>
                <SelectTrigger id="division"><SelectValue placeholder="Any" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any</SelectItem>
                  {Object.keys(locations).map(div => <SelectItem key={div} value={div}>{div}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="district">District</Label>
              <Select value={district} onValueChange={setDistrict} disabled={!division}>
                <SelectTrigger id="district"><SelectValue placeholder="Any" /></SelectTrigger>
                <SelectContent>
                   <SelectItem value="">Any</SelectItem>
                  {division && locations[division as keyof typeof locations]?.districts.map(dist => <SelectItem key={dist} value={dist}>{dist}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSearch} disabled={isPending} className="w-full">
              {isPending ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div>
        <h3 className="text-2xl font-bold mb-6">Search Results</h3>
        {isPending ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                        <CardHeader><div className="h-6 w-3/4 bg-muted rounded"></div></CardHeader>
                        <CardContent className="space-y-3">
                            <div className="h-5 w-full bg-muted rounded"></div>
                            <div className="h-5 w-2/3 bg-muted rounded"></div>
                            <div className="h-5 w-1/2 bg-muted rounded"></div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        ) : donors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {donors.map(donor => <DonorCard key={donor.id} donor={donor} />)}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">No donors found matching your criteria.</p>
            <p className="text-sm text-muted-foreground/80">Try broadening your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
