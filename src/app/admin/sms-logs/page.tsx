
"use client";

import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { SmsLog } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, AlertCircle, CheckCircle, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

type SmsLogWithId = SmsLog & { id: string };

export default function SmsLogsPage() {
    const [logs, setLogs] = useState<SmsLogWithId[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchLogs = async () => {
            setLoading(true);
            try {
                const logsCollection = collection(db, 'sms_logs');
                const q = query(logsCollection, orderBy('createdAt', 'desc'));
                const logsSnapshot = await getDocs(q);
                const logsList = logsSnapshot.docs.map(doc => {
                    const data = doc.data();
                    const createdAt = data.createdAt as Timestamp;
                    return { 
                        id: doc.id,
                        ...data,
                        createdAt: createdAt ? createdAt.toDate() : new Date(),
                    } as SmsLogWithId;
                });
                setLogs(logsList);
            } catch (error) {
                console.error("Error fetching SMS logs:", error);
                toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch SMS logs.' });
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, [toast]);

    return (
        <div>
            <header className="py-4">
                <h1 className="text-2xl font-bold tracking-tight text-primary md:text-3xl font-headline flex items-center gap-2">
                    <Send /> SMS Logs
                </h1>
                <p className="text-muted-foreground">Monitor the status of all outgoing SMS messages.</p>
            </header>
            <Card>
                <CardHeader>
                    <CardTitle>SMS Delivery History</CardTitle>
                    <CardDescription>A list of all attempted SMS messages sent from the system.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date & Time</TableHead>
                                <TableHead>Recipient</TableHead>
                                <TableHead className="w-[40%]">Message</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>API Used</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10">
                                        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                                        <p className="mt-2 text-muted-foreground">Loading logs...</p>
                                    </TableCell>
                                </TableRow>
                            ) : logs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10">
                                        <p className="text-muted-foreground">No SMS logs found.</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                logs.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell>
                                            {format(new Date(log.createdAt), 'PPpp')}
                                        </TableCell>
                                        <TableCell className="font-medium">{log.number}</TableCell>
                                        <TableCell className="max-w-sm truncate" title={log.message}>
                                            {log.message}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={log.status === 'success' ? 'default' : 'destructive'} className={log.status === 'success' ? 'bg-green-600' : ''}>
                                                {log.status === 'success' ? <CheckCircle className="mr-1 h-3 w-3" /> : <AlertCircle className="mr-1 h-3 w-3" />}
                                                {log.status}
                                            </Badge>
                                        </TableCell>
                                         <TableCell>
                                            <Badge variant="secondary">
                                                {log.apiUsed}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
