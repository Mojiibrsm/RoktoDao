import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs, setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { db } from '@/lib/firebase';

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

    // 1. Check if user exists using the client-facing db instance
    const donorsRef = collection(db, 'donors');
    const q = query(donorsRef, where('phoneNumber', '==', phoneNumber));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return NextResponse.json({ success: false, error: 'No account is associated with this phone number.' }, { status: 404 });
    }

    // 2. Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 10); // OTP expires in 10 minutes

    // 3. Store OTP securely in Firestore with an expiration using the Admin SDK
    const otpRef = doc(adminDb, 'otp_codes', phoneNumber);
    await setDoc(otpRef, {
      code: otp,
      expires: expires.toISOString(),
      createdAt: serverTimestamp(),
    });

    // 4. Send OTP via SMS
    const smsMessage = `Your RoktoDao OTP is: ${otp}`;
    const smsSent = await sendSms(phoneNumber, smsMessage);

    if (!smsSent) {
      throw new Error('Failed to send OTP SMS.');
    }

    // 5. Respond to client without the OTP
    return NextResponse.json({ success: true, message: 'OTP has been sent to your phone number.' });

  } catch (error: any) {
    console.error('Error generating OTP:', error);
    return NextResponse.json({ success: false, error: error.message || 'An internal server error occurred.' }, { status: 500 });
  }
}
