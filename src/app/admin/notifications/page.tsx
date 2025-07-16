
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function AdminNotificationsPage() {
    return (
        <div>
            <header className="py-4">
                <h1 className="text-2xl font-bold tracking-tight text-primary md:text-3xl font-headline">
                    Notifications
                </h1>
                <p className="text-muted-foreground">Send SMS/Email notifications to users.</p>
            </header>
            <Card>
                <CardHeader>
                    <CardTitle>Send Notification</CardTitle>
                    <CardDescription>Placeholder for notification sending form.</CardDescription>
                </CardHeader>
                {/* Notification form will go here */}
            </Card>
        </div>
    );
}
