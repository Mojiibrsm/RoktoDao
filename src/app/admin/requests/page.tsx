
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function AdminRequestsPage() {
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
                    <CardTitle>Request List</CardTitle>
                    <CardDescription>Placeholder for blood request management table.</CardDescription>
                </CardHeader>
                {/* Request table will go here */}
            </Card>
        </div>
    );
}
