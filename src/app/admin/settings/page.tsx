
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function AdminSettingsPage() {
    return (
        <div>
            <header className="py-4">
                <h1 className="text-2xl font-bold tracking-tight text-primary md:text-3xl font-headline">
                    Settings
                </h1>
                <p className="text-muted-foreground">Manage site-level settings and configurations.</p>
            </header>
            <Card>
                <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                    <CardDescription>Placeholder for site settings form.</CardDescription>
                </CardHeader>
                {/* Settings form will go here */}
            </Card>
        </div>
    );
}
