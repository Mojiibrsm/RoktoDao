
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, LineChart, PieChart } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function AdminDashboard() {
  return (
    <div className="flex flex-col gap-4">
        <header className="py-4">
            <h1 className="text-2xl font-bold tracking-tight text-primary md:text-3xl font-headline">
                Dashboard
            </h1>
            <p className="text-muted-foreground">Welcome to the RoktoBondhu Admin Panel.</p>
        </header>
        <Separator />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Donors</CardTitle>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">1,256</div>
                    <p className="text-xs text-muted-foreground">+50 in the last month</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Requests</CardTitle>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-5.5-4-4 2.5-5.5 4-3 3.5-3 5.5a7 7 0 0 0 7 7z"></path></svg>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">89</div>
                    <p className="text-xs text-muted-foreground">+12 since last week</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Requests Fulfilled</CardTitle>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">342</div>
                    <p className="text-xs text-muted-foreground">+80 in the last month</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">New Signups</CardTitle>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" x2="19" y1="8" y2="14"></line><line x1="22" x2="16" y1="11" y2="11"></line></svg>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+120</div>
                    <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
            </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
                <CardHeader>
                    <CardTitle>Donation Trends</CardTitle>
                    <CardDescription>Monthly donation and request trends.</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                    <div className="w-full h-72 bg-muted flex items-center justify-center rounded-lg">
                        <LineChart className="h-16 w-16 text-muted-foreground/50" />
                        <p className="text-muted-foreground ml-4">Line Chart Placeholder</p>
                    </div>
                </CardContent>
            </Card>
            <Card className="lg:col-span-3">
                <CardHeader>
                    <CardTitle>Blood Group Distribution</CardTitle>
                    <CardDescription>Distribution of blood groups among donors.</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="w-full h-72 bg-muted flex items-center justify-center rounded-lg">
                        <PieChart className="h-16 w-16 text-muted-foreground/50" />
                        <p className="text-muted-foreground ml-4">Pie Chart Placeholder</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
