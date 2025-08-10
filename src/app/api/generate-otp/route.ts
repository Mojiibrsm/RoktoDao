
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

async function sendSms(number: string, message: string) {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    try {
        const response = await fetch(`${baseUrl}/api/send-sms`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ number, message }),
        });
        return response.ok;
    } catch (error) {
        console.error("Failed to call send-sms API:", error);
        return false;
    }
}

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json({ success: false, error: 'Phone number is required.' }, { status: 400 });
    }

    // Step 1: Check if a donor exists with the given phone number
    const { data: donor, error: donorError } = await supabase
      .from('donors')
      .select('uid')
      .eq('phoneNumber', phoneNumber)
      .limit(1)
      .single();

    // Step 2: Handle errors from the donor check
    if (donorError) {
      // If the error code is PGRST116, it means no row was found. This is an expected case.
      if (donorError.code === 'PGRST116') {
        return NextResponse.json({ success: false, error: 'No account is associated with this phone number.' }, { status: 404 });
      }
      // For any other unexpected database error, log it and return a generic error.
      console.error("Supabase donor check error:", donorError);
      return NextResponse.json({ success: false, error: "Database error while checking for donor." }, { status: 500 });
    }
    
    // This check is redundant due to the error handling above, but adds an extra layer of safety.
    if (!donor) {
       return NextResponse.json({ success: false, error: 'No account is associated with this phone number.' }, { status: 404 });
    }

    // Step 3: Generate and store the OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 10); // OTP expires in 10 minutes

    const { error: otpError } = await supabase
      .from('otp_codes')
      .upsert({ 
        phone: phoneNumber, 
        code: otp, 
        expires_at: expires.toISOString() 
      }, { onConflict: 'phone' });

    if (otpError) {
      console.error("Supabase OTP storage error:", otpError);
      throw new Error("Could not store OTP due to a database issue.");
    }
    
    // Step 4: Send the OTP via SMS
    const smsMessage = `Your RoktoDao OTP is: ${otp}`;
    const smsSent = await sendSms(phoneNumber, smsMessage);

    if (!smsSent) {
      throw new Error('Failed to send OTP SMS. Please try again later.');
    }

    return NextResponse.json({ success: true, message: 'An OTP has been sent to your phone number.' });

  } catch (error: any) {
    console.error('Error in generate-otp API:', error);
    return NextResponse.json({ success: false, error: error.message || 'An internal server error occurred.' }, { status: 500 });
  }
}
