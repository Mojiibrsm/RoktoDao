
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { KeyRound, Loader2 } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

const phoneSchema = z.object({
  phoneNumber: z.string().min(11, { message: 'Please enter a valid 11-digit phone number.' }).max(11),
});

const otpSchema = z.object({
  otp: z.string().min(6, { message: "Please enter the 6-digit OTP." }),
  newPassword: z.string().min(6, { message: "Password must be at least 6 characters." }),
});


export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');

  const phoneForm = useForm<z.infer<typeof phoneSchema>>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phoneNumber: '' },
  });

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '', newPassword: '' },
  });
  
  const onPhoneSubmit = async (values: z.infer<typeof phoneSchema>) => {
    setIsLoading(true);
    try {
        const response = await fetch('/api/generate-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber: values.phoneNumber }),
        });

        const result = await response.json();
        if (!response.ok || !result.success) {
            throw new Error(result.error || 'Failed to send OTP.');
        }
        
        setPhoneNumber(values.phoneNumber);
        setStep('otp');
        otpForm.reset({ otp: '', newPassword: '' });
        toast({ title: 'OTP Sent', description: `An OTP has been sent to ${values.phoneNumber}.` });

    } catch (error: any) {
      console.error("OTP sending error:", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Could not send OTP. Please check the phone number and try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onOtpSubmit = async (values: z.infer<typeof otpSchema>) => {
    setIsLoading(true);
    try {
        const response = await fetch('/api/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                phoneNumber: phoneNumber, 
                otp: values.otp,
                newPassword: values.newPassword 
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to reset password.');
        }

        toast({ title: 'Success', description: 'Your password has been reset successfully.' });
        setStep('phone');
        phoneForm.reset();
        otpForm.reset();

    } catch (error: any) {
         toast({
            variant: 'destructive',
            title: 'Error',
            description: error.message || 'Failed to reset password. Please try again.',
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader className="text-center">
          <KeyRound className="mx-auto h-12 w-12 text-primary" />
          <CardTitle className="text-2xl font-headline">Reset Password</CardTitle>
           <CardDescription>
            {step === 'phone' 
                ? 'Enter your phone number to receive an OTP.'
                : 'Enter the OTP and your new password.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'phone' ? (
            <Form {...phoneForm}>
              <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4">
                <FormField
                  control={phoneForm.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="01XXXXXXXXX" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <><Loader2 className="animate-spin" /> Sending OTP...</> : 'Send OTP'}
                </Button>
              </form>
            </Form>
          ) : (
             <Form {...otpForm}>
              <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-6">
                <FormField
                  control={otpForm.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Enter OTP</FormLabel>
                      <FormControl>
                        <InputOTP maxLength={6} {...field}>
                            <InputOTPGroup>
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSlot index={2} />
                                <InputOTPSlot index={3} />
                                <InputOTPSlot index={4} />
                                <InputOTPSlot index={5} />
                            </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={otpForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <><Loader2 className="animate-spin" /> Resettiing...</> : 'Reset Password'}
                </Button>
              </form>
            </Form>
          )}
           <div className="mt-4 text-center text-sm">
            Remembered your password?{' '}
            <Link href="/login" className="underline hover:text-primary">
              Log In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
