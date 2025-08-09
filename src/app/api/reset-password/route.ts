
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin'; // Using the Supabase Admin client now
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, otp, newPassword } = await request.json();

    if (!phoneNumber || !otp || !newPassword) {
      return NextResponse.json({ error: 'Phone number, OTP, and new password are required.' }, { status: 400 });
    }

    // 1. Verify the OTP from the 'otp_codes' table
    const { data: otpData, error: otpError } = await supabase
        .from('otp_codes')
        .select('code, expires_at')
        .eq('phone', phoneNumber)
        .single();
    
    if (otpError || !otpData) {
        return NextResponse.json({ error: 'Invalid or expired OTP. Please try again.' }, { status: 400 });
    }

    if (otpData.code !== otp) {
      return NextResponse.json({ error: 'Invalid OTP. Please check the code and try again.' }, { status: 400 });
    }

    const expires = new Date(otpData.expires_at);
    if (expires < new Date()) {
      // Clean up expired OTP
      await supabase.from('otp_codes').delete().eq('phone', phoneNumber);
      return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 });
    }

    // OTP is valid, proceed to reset password
    // 2. Find the user by phone number in Firestore to get their UID
    const { data: donor, error: donorError } = await supabase
      .from('donors')
      .select('uid')
      .eq('phoneNumber', phoneNumber)
      .single();

    if (donorError || !donor) {
       return NextResponse.json({ error: 'User with this phone number not found.' }, { status: 404 });
    }

    const uid = donor.uid;

    // 3. Use the UID to update the password in Supabase Auth using the Admin client
    const { error: updateError } = await adminAuth.updateUserById(uid, {
      password: newPassword,
    });

    if (updateError) throw updateError;


    // 4. Delete the used OTP
    await supabase.from('otp_codes').delete().eq('phone', phoneNumber);

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
