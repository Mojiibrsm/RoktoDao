
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Download, Loader2 } from 'lucide-react';
import Papa from 'papaparse';
import { 
    exportBlogsAction,
    exportDonorsAction,
    exportGalleryAction,
    exportMarqueeNoticesAction,
    exportModeratorsAction,
    exportRequestsAction,
    exportSettingsAction,
    exportSmsLogsAction
} from '@/actions/export-all-data';

type CollectionExporter = {
    name: string;
    action: () => Promise<Record<string, any>[]>;
};

const collectionsToExport: CollectionExporter[] = [
    { name: "blogs", action: exportBlogsAction },
    { name: "donors", action: exportDonorsAction },
    { name: "gallery", action: exportGalleryAction },
    { name: "marquee-notices", action: exportMarqueeNoticesAction },
    { name: "moderators", action: exportModeratorsAction },
    { name: "requests", action: exportRequestsAction },
    { name: "settings", action: exportSettingsAction },
    { name: "sms_logs", action: exportSmsLogsAction },
];

export default function ExportDataPage() {
    const [loading, setLoading] = useState<string | null>(null);
    const { toast } = useToast();

    const handleExport = async (collectionName: string, exportAction: () => Promise<Record<string, any>[]>) => {
        setLoading(collectionName);
        toast({ title: `Starting Export: ${collectionName}`, description: "Fetching data from Firestore..." });

        try {
            const data = await exportAction();

            if (data.length === 0) {
                toast({ variant: 'destructive', title: "No Data", description: `No documents found in '${collectionName}' to export.` });
                return;
            }
            
            const csv = Papa.unparse(data);
            
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", `${collectionName}.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }

            toast({ title: "Export Successful", description: `${data.length} records from '${collectionName}' have been downloaded.` });

        } catch (error: any) {
            console.error(error);
            toast({ variant: 'destructive', title: "Export Failed", description: error.message });
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="space-y-8">
            <header className="py-4">
                <h1 className="text-2xl font-bold tracking-tight text-primary md:text-3xl font-headline">
                    Export Data
                </h1>
                <p className="text-muted-foreground">Download your Firestore collections as CSV files for migration.</p>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>Export Collections</CardTitle>
                    <CardDescription>
                        Click a button below to download all documents from the corresponding collection.
                        This is useful for migrating to another database like Supabase.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {collectionsToExport.map(({ name, action }) => (
                         <Card key={name} className="p-4 flex flex-col justify-between">
                            <h3 className="font-semibold text-lg capitalize">{name.replace(/_/g, ' ')}</h3>
                            <p className="text-sm text-muted-foreground mb-4">Export the '{name}' collection.</p>
                            <Button onClick={() => handleExport(name, action)} disabled={!!loading}>
                                {loading === name ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                                {loading === name ? 'Exporting...' : `Export ${name}`}
                            </Button>
                        </Card>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
