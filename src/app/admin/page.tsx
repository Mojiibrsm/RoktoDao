
"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Bar, BarChart, CartesianGrid, XAxis, Pie, PieChart, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { bloodGroups } from '@/lib/location-data';
import { subDays, format as formatDate } from 'date-fns';

interface MonthlyRequestData {
  month: string;
  total: number;
}

interface BloodGroupData {
  name: string;
  value: number;
  fill: string;
}

const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#FF4560'];


export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalDonors: 0,
    activeRequests: 0,
    newSignups: 0,
    requestsFulfilled: 0,
  });
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState<MonthlyRequestData[]>([]);
  const [bloodGroupData, setBloodGroupData] = useState<BloodGroupData[]>([]);
  

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
        
        // Fetch stats in parallel
        const [
          { count: totalDonors },
          { count: activeRequests },
          { count: requestsFulfilled },
          { count: newSignups },
          { data: allDonorsData },
          { data: allRequestsData }
        ] = await Promise.all([
          supabase.from('donors').select('*', { count: 'exact', head: true }),
          supabase.from('requests').select('*', { count: 'exact', head: true }).in('status', ['Pending', 'Approved']),
          supabase.from('requests').select('*', { count: 'exact', head: true }).eq('status', 'Fulfilled'),
          supabase.from('donors').select('*', { count: 'exact', head: true }).gte('createdAt', thirtyDaysAgo),
          supabase.from('donors').select('bloodGroup'),
          supabase.from('requests').select('neededDate')
        ]);

        setStats({
          totalDonors: totalDonors ?? 0,
          activeRequests: activeRequests ?? 0,
          requestsFulfilled: requestsFulfilled ?? 0,
          newSignups: newSignups ?? 0,
        });
        
        // Process blood group distribution
        if (allDonorsData) {
          const groupCounts: { [key: string]: number } = {};
          allDonorsData.forEach(donor => {
              const group = donor.bloodGroup;
              if (group) {
                  groupCounts[group] = (groupCounts[group] || 0) + 1;
              }
          });
          const pieData: BloodGroupData[] = bloodGroups.map((group, index) => ({
              name: group,
              value: groupCounts[group] || 0,
              fill: CHART_COLORS[index % CHART_COLORS.length],
          })).filter(item => item.value > 0);
          setBloodGroupData(pieData);
        }

        // Process monthly donation requests for the last 6 months
        if (allRequestsData) {
            const monthlyCounts: { [key: string]: number } = {};
            const today = new Date();
            for (let i = 5; i >= 0; i--) {
                const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
                const monthKey = formatDate(date, 'MMM yy');
                monthlyCounts[monthKey] = 0;
            }

            allRequestsData.forEach(req => {
                const requestDate = new Date(req.neededDate);
                const monthKey = formatDate(requestDate, 'MMM yy');
                 if (monthlyCounts.hasOwnProperty(monthKey)) {
                    monthlyCounts[monthKey]++;
                }
            });
            
            const barData = Object.keys(monthlyCounts).map(month => ({
                month,
                total: monthlyCounts[month],
            }));
            setMonthlyData(barData);
        }


      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <header className="py-4">
        <h1 className="text-2xl font-bold tracking-tight text-primary md:text-3xl font-headline">
          Dashboard
        </h1>
        <p className="text-muted-foreground">Welcome to the RoktoDao Admin Panel.</p>
      </header>
      <Separator />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/donors">
          <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Donors</CardTitle>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{stats.totalDonors}</div>}
              <p className="text-xs text-muted-foreground">All registered donors</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/requests">
          <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Requests</CardTitle>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-5.5-4-4 2.5-5.5 4-3 3.5-3 5.5a7 7 0 0 0 7 7z"></path></svg>
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{stats.activeRequests}</div>}
              <p className="text-xs text-muted-foreground">Total pending & approved requests</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/requests">
          <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Requests Fulfilled</CardTitle>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{stats.requestsFulfilled}</div>}
              <p className="text-xs text-muted-foreground">Total fulfilled requests</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/users">
          <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Signups</CardTitle>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" x2="19" y1="8" y2="14"></line><line x1="22" x2="16" y1="11" y2="11"></line></svg>
            </CardHeader>
            <CardContent>
               {loading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">+{stats.newSignups}</div>}
              <p className="text-xs text-muted-foreground">In the last 30 days</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Donation Trends</CardTitle>
            <CardDescription>Monthly donation and request trends.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
             {loading ? <Skeleton className="w-full h-72" /> : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total" fill="hsl(var(--primary))" name="Requests" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Blood Group Distribution</CardTitle>
            <CardDescription>Distribution of blood groups among donors.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="w-full h-72" /> : (
               <ResponsiveContainer width="100%" height={300}>
                 <PieChart>
                    <Pie data={bloodGroupData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                        {bloodGroupData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                 </PieChart>
               </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    