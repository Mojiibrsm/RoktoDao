
"use client";

import { useState, useEffect, useTransition, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { bloodGroups, locations, upazilas } from '@/lib/location-data';
import { supabase } from '@/lib/supabase';
import type { Donor } from '@/lib/types';
import DonorCard from '@/components/donor-card';
import { Search } from 'lucide-react';

export default function SearchDonorsPage() {
  const [bloodGroup, setBloodGroup] = useState('any');
  const [division, setDivision] = useState('any');
  const [district, setDistrict] = useState('any');
  const [upazila, setUpazila] = useState('any');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  const [donors, setDonors] = useState<Donor[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isClient, setIsClient] = useState(false);

  const fetchDonors = useCallback(() => {
    startTransition(async () => {
      let query = supabase
        .from('donors')
        .select('*')
        .eq('isAvailable', true);
      
      if (bloodGroup && bloodGroup !== 'any') {
        query = query.eq('bloodGroup', bloodGroup);
      }
      if (division && division !== 'any') {
        query = query.eq('address->>division', division);
      }
      if (district && district !== 'any') {
        query = query.eq('address->>district', district);
      }
      if (upazila && upazila !== 'any') {
        query = query.eq('address->>upazila', upazila);
      }
      if (name) {
        query = query.ilike('fullName', `%${name}%`);
      }
      if (phoneNumber) {
        query = query.eq('phoneNumber', phoneNumber);
      }

      const { data: fetchedDonors, error } = await query;
      
      if (error) {
        console.error("Error fetching donors:", error);
        setDonors([]);
      } else {
        setDonors(fetchedDonors as Donor[]);
      }
    });
  }, [bloodGroup, division, district, upazila, name, phoneNumber]);
  
  useEffect(() => {
    setIsClient(true);
    // Initial fetch on component mount
    fetchDonors();
  }, []);

  useEffect(() => {
    if (isClient) {
      // Refetch when filters change
      const timer = setTimeout(() => {
        fetchDonors();
      }, 300); // Debounce to avoid too many requests
      return () => clearTimeout(timer);
    }
  }, [bloodGroup, division, district, upazila, isClient, fetchDonors]);

  
  const districtOptions = useMemo(() => {
    if (division === 'any' || !locations[division as keyof typeof locations]) {
      return Object.values(locations).flatMap(div => div.districts).sort((a,b) => a.localeCompare(b, 'bn'));
    }
    return locations[division as keyof typeof locations].districts.sort((a, b) => a.localeCompare(b, 'bn'));
  }, [division]);

  const upazilaOptions = useMemo(() => {
    if (district === 'any' || !upazilas[district as keyof typeof upazilas]) {
      return [];
    }
    return upazilas[district as keyof typeof upazilas].sort((a, b) => a.localeCompare(b, 'bn'));
  }, [district]);


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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Donor's name" value={name} onChange={e => setName(e.target.value)} />
            </div>
             <div className="space-y-2">
              <Label htmlFor="phone-number">Phone Number</Label>
              <Input id="phone-number" placeholder="01XXXXXXXXX" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} />
            </div>
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
                        {districtOptions.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                </Select>
              </div>
             <div className="space-y-2">
              <Label htmlFor="upazila">Upazila / Area</Label>
              <Select value={upazila} onValueChange={setUpazila} disabled={district === 'any'}>
                <SelectTrigger id="upazila"><SelectValue placeholder="Any" /></SelectTrigger>
                <SelectContent>
                   <SelectItem value="any">Any</SelectItem>
                   {upazilaOptions.map(up => <SelectItem key={up} value={up}>{up}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
             <div className="lg:col-span-2 flex justify-end">
                <Button onClick={fetchDonors} disabled={isPending} className="w-full lg:w-auto">
                    <Search className="mr-2 h-4 w-4" />
                    {isPending ? 'Searching...' : 'Search'}
                </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div>
        <h3 className="text-2xl font-bold mb-6">Search Results ({donors.length})</h3>
        {isPending ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                        <CardHeader className="flex flex-row items-center gap-4">
                           <div className="h-12 w-12 rounded-full bg-muted"></div>
                           <div className="space-y-2">
                             <div className="h-4 w-24 bg-muted rounded"></div>
                             <div className="h-4 w-16 bg-muted rounded"></div>
                           </div>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-6">
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
