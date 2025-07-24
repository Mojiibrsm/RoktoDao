
"use client";

import { useState, useEffect, useTransition, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { bloodGroups, locations, upazilas } from '@/lib/location-data';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Donor } from '@/lib/types';
import DonorCard from '@/components/donor-card';

export default function SearchDonorsPage() {
  const [bloodGroup, setBloodGroup] = useState('any');
  const [division, setDivision] = useState('any');
  const [district, setDistrict] = useState('any');
  const [upazila, setUpazila] = useState('any');
  const [donors, setDonors] = useState<Donor[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSearch = useCallback(() => {
    startTransition(async () => {
      const donorsRef = collection(db, 'donors');
      let q = query(donorsRef, where('isAvailable', '==', true));
      
      if (bloodGroup && bloodGroup !== 'any') {
        q = query(q, where('bloodGroup', '==', bloodGroup));
      }
      if (division && division !== 'any') {
        q = query(q, where('address.division', '==', division));
      }
      if (district && district !== 'any') {
        q = query(q, where('address.district', '==', district));
      }
      if (upazila && upazila !== 'any') {
        q = query(q, where('address.upazila', '==', upazila));
      }

      const querySnapshot = await getDocs(q);
      const fetchedDonors = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Donor[];
      setDonors(fetchedDonors);
    });
  }, [bloodGroup, division, district, upazila]);

  useEffect(() => {
    if (isClient) {
      handleSearch();
    }
  }, [isClient, handleSearch]);
  
  const districtOptions = division !== 'any' 
    ? locations[division as keyof typeof locations]?.districts.map(d => ({ value: d, label: d })).sort((a, b) => a.label.localeCompare(b.label, 'bn'))
    : Object.keys(locations).flatMap(div => 
        locations[div as keyof typeof locations].districts.map(d => ({ value: d, label: d }))
      ).sort((a, b) => a.label.localeCompare(b.label, 'bn'));

  if (!isClient) {
    return null;
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-primary">Search for Donors</CardTitle>
          <CardDescription>Find available blood donors in your area.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="blood-group">Blood Group</Label>
              <Select value={bloodGroup} onValueChange={setBloodGroup}>
                <SelectTrigger id="blood-group"><SelectValue placeholder="Any" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  {bloodGroups.map(group => <SelectItem key={group} value={group}>{group}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="division">Division</Label>
              <Select value={division} onValueChange={(val) => {setDivision(val); setDistrict('any'); setUpazila('any');}}>
                <SelectTrigger id="division"><SelectValue placeholder="Any" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  {Object.keys(locations).map(div => <SelectItem key={div} value={div}>{div}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="district">District</Label>
                <Select value={district} onValueChange={(val) => {setDistrict(val); setUpazila('any');}}>
                    <SelectTrigger id="district"><SelectValue placeholder="Any" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="any">Any</SelectItem>
                        {districtOptions.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                    </SelectContent>
                </Select>
              </div>
             <div className="space-y-2">
              <Label htmlFor="upazila">Upazila / Area</Label>
              <Select value={upazila} onValueChange={setUpazila} disabled={!district || district === 'any'}>
                <SelectTrigger id="upazila"><SelectValue placeholder="Any" /></SelectTrigger>
                <SelectContent>
                   <SelectItem value="any">Any</SelectItem>
                   {district && district !== 'any' && upazilas[district as keyof typeof upazilas]?.map(up => <SelectItem key={up} value={up}>{up}</SelectItem>)}
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
