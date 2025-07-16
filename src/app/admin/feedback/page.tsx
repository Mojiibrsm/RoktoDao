
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function AdminFeedbackPage() {
    return (
        <div>
            <header className="py-4">
                <h1 className="text-2xl font-bold tracking-tight text-primary md:text-3xl font-headline">
                    Feedback / Reports
                </h1>
                <p className="text-muted-foreground">View and manage user-submitted issues and feedback.</p>
            </header>
            <Card>
                <CardHeader>
                    <CardTitle>Feedback List</CardTitle>
                    <CardDescription>Placeholder for user feedback table.</CardDescription>
                </CardHeader>
                {/* Feedback table will go here */}
            </Card>
        </div>
    );
}
