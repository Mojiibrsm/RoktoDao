
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Supabase Admin Client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);


export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, otp, newPassword } = await request.json();

    if (!phoneNumber || !otp || !newPassword) {
      return NextResponse.json({ error: 'Phone number, OTP, and new password are required.' }, { status: 400 });
    }

    // 1. Verify the OTP from the 'donors' table
    const { data: donor, error: donorError } = await supabase
      .from('donors')
      .select('uid, otp_code, otp_expires_at')
      .eq('phoneNumber', phoneNumber)
      .single();

    if (donorError || !donor) {
      return NextResponse.json({ error: 'User not found or database error.' }, { status: 404 });
    }

    if (!donor.otp_code || !donor.otp_expires_at) {
        return NextResponse.json({ error: 'Invalid or expired OTP. Please try again.' }, { status: 400 });
    }
    
    if (donor.otp_code !== otp) {
      return NextResponse.json({ error: 'Invalid OTP. Please check the code and try again.' }, { status: 400 });
    }

    const expires = new Date(donor.otp_expires_at);
    if (expires < new Date()) {
      // Clean up expired OTP
      await supabase.from('donors').update({ otp_code: null, otp_expires_at: null }).eq('phoneNumber', phoneNumber);
      return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 });
    }

    // OTP is valid, proceed to reset password
    const uid = donor.uid;

    // 2. Use the UID to update the password in Supabase Auth using the Admin client
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(uid, {
      password: newPassword,
    });

    if (updateError) throw updateError;


    // 3. Delete the used OTP
    await supabase.from('donors').update({ otp_code: null, otp_expires_at: null }).eq('phoneNumber', phoneNumber);

    return NextResponse.json({ success: true, message: 'Password has been reset successfully.' });

  } catch (error: any) {
    console.error('Error resetting password:', error);
    let errorMessage = 'An internal server error occurred.';
     if (error.message) {
        errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
