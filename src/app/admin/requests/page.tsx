
"use client";

import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { BloodRequest } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

export default function AdminRequestsPage() {
    const [requests, setRequests] = useState<BloodRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRequests = async () => {
            setLoading(true);
            const requestsRef = collection(db, 'requests');
            const q = query(requestsRef, orderBy('neededDate', 'desc'));
            const querySnapshot = await getDocs(q);
            const requestsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BloodRequest));
            setRequests(requestsList);
            setLoading(false);
        };
        fetchRequests();
    }, []);

    return (
        <div>
            <header className="py-4">
                <h1 className="text-2xl font-bold tracking-tight text-primary md:text-3xl font-headline">
                    Blood Requests
                </h1>
                <p className="text-muted-foreground">View, Filter, and Manage Blood Requests.</p>
            </header>
            <Card>
                <CardHeader>
                    <CardTitle>All Blood Requests</CardTitle>
                    <CardDescription>A list of all user-submitted blood requests.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient Name</TableHead>
                        <TableHead>Blood Group</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Date Needed</TableHead>
                        <TableHead>Bags</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                         <TableRow>
                            <TableCell colSpan={6} className="text-center">Loading requests...</TableCell>
                        </TableRow>
                      ) : requests.map((req) => (
                        <TableRow key={req.id}>
                          <TableCell className="font-medium">{req.patientName}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-primary border-primary">
                              {req.bloodGroup}
                            </Badge>
                          </TableCell>
                          <TableCell>{req.hospitalLocation}</TableCell>
                          <TableCell>{req.contactPhone}</TableCell>
                          <TableCell>
                            {format(new Date(req.neededDate), 'dd MMM yyyy')}
                          </TableCell>
                           <TableCell className="text-center">{req.numberOfBags}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  { !loading && requests.length === 0 && (
                    <p className="text-center text-muted-foreground p-8">No blood requests found.</p>
                  )}
                </CardContent>
            </Card>
        </div>
    );
}
