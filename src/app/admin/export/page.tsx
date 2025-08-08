
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Download, Loader2 } from 'lucide-react';
import { exportDonorsToCsvAction } from '@/actions/export-data';
import Papa from 'papaparse';
import type { Donor } from '@/lib/types';

export default function ExportDataPage() {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleExport = async () => {
        setLoading(true);
        toast({ title: "Starting Export", description: "Fetching data from Firestore..." });

        try {
            const donors = await exportDonorsToCsvAction();

            if (donors.length === 0) {
                toast({ variant: 'destructive', title: "No Data", description: "No donors found to export." });
                return;
            }

            // Map the data to a flat structure suitable for CSV, ensuring address is a JSON string
            const csvData = donors.map(d => ({
                uid: d.uid,
                fullName: d.fullName,
                email: d.email,
                bloodGroup: d.bloodGroup,
                phoneNumber: d.phoneNumber,
                address: d.address ? JSON.stringify(d.address) : null,
                lastDonationDate: d.lastDonationDate,
                isAvailable: d.isAvailable,
                dateOfBirth: d.dateOfBirth,
                gender: d.gender,
                donationCount: d.donationCount,
                isAdmin: d.isAdmin,
                profilePictureUrl: d.profilePictureUrl,
                isVerified: d.isVerified,
                isPinned: d.isPinned,
                createdAt: d.createdAt,
            }));
            
            const csv = Papa.unparse(csvData);
            
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", "donors.csv");
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }

            toast({ title: "Export Successful", description: `${donors.length} records have been downloaded.` });

        } catch (error: any) {
            console.error(error);
            toast({ variant: 'destructive', title: "Export Failed", description: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <header className="py-4">
                <h1 className="text-2xl font-bold tracking-tight text-primary md:text-3xl font-headline">
                    Export Data
                </h1>
                <p className="text-muted-foreground">Download your Firestore data as a CSV file.</p>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>Export Donors Collection</CardTitle>
                    <CardDescription>
                        Click the button below to download all documents from the 'donors' collection.
                        This is useful for migrating to another database like Supabase.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleExport} disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                        {loading ? 'Exporting...' : 'Export Donors to CSV'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
