
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Droplet } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

const loginSchema = z.object({
  identifier: z.string().min(1, { message: 'Phone number or email is required.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { user, loading } = useAuth();

  useEffect(() => {
    // AuthProvider will handle the redirect, this is a fallback.
    if (!loading && user) {
      router.replace('/profile');
    }
  }, [user, loading, router]);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    let emailToLogin = values.identifier;

    try {
        if (/^\d{11,}$/.test(values.identifier) && !values.identifier.includes('@')) {
             const { data: donor, error } = await supabase
                .from('donors')
                .select('email')
                .eq('phoneNumber', values.identifier)
                .single();

            if (error || !donor || !donor.email) {
                 throw new Error('User with this phone number not found or no email associated.');
            }
            emailToLogin = donor.email;
        }

      const { error } = await supabase.auth.signInWithPassword({
        email: emailToLogin,
        password: values.password,
      });

      if (error) throw error;

      toast({
        title: 'Login Successful',
        description: 'Welcome back!',
      });
      router.push('/profile');
    } catch (error: any) {
      let description = 'ভুল ফোন নম্বর/ইমেল বা পাসওয়ার্ড। অনুগ্রহ করে আবার চেষ্টা করুন।';
      if (error.message.includes('Invalid login credentials')) {
        description = 'ভুল ফোন নম্বর/ইমেল বা পাসওয়ার্ড। অনুগ্রহ করে আবার চেষ্টা করুন।';
      } else {
        description = error.message;
      }
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: description,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (loading || user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader className="text-center">
          <Droplet className="mx-auto h-12 w-12 text-primary" />
          <CardTitle className="text-2xl font-headline">Welcome Back</CardTitle>
          <CardDescription>Log in to your RoktoDao account</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="identifier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number or Email</FormLabel>
                    <FormControl>
                      <Input placeholder="01XXXXXXXXX or you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                        <FormLabel>Password</FormLabel>
                        <Link href="/forgot-password" passHref>
                           <p className="text-sm underline hover:text-primary">Forgot Password?</p>
                        </Link>
                    </div>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Log In'}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Don't have an account?{' '}
            <Link href="/signup" className="underline hover:text-primary">
              Become a Donor
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
