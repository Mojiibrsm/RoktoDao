
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { doc, getDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, otp, newPassword } = await request.json();

    if (!phoneNumber || !otp || !newPassword) {
      return NextResponse.json({ error: 'Phone number, OTP, and new password are required.' }, { status: 400 });
    }

    // 1. Verify the OTP
    const otpRef = doc(adminDb, 'otp_codes', phoneNumber);
    const otpSnap = await getDoc(otpRef);

    if (!otpSnap.exists()) {
      return NextResponse.json({ error: 'Invalid or expired OTP. Please try again.' }, { status: 400 });
    }

    const otpData = otpSnap.data();
    if (otpData.code !== otp) {
      return NextResponse.json({ error: 'Invalid OTP. Please check the code and try again.' }, { status: 400 });
    }

    const expires = new Date(otpData.expires);
    if (expires < new Date()) {
      await deleteDoc(otpRef);
      return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 });
    }

    // OTP is valid, proceed to reset password
    // 2. Find the user by phone number in Firestore to get their UID
    const donorsRef = collection(adminDb, 'donors');
    const q = query(donorsRef, where('phoneNumber', '==', phoneNumber));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return NextResponse.json({ error: 'User with this phone number not found.' }, { status: 404 });
    }

    const userDoc = querySnapshot.docs[0];
    const uid = userDoc.id; // The UID is the document ID

    // 3. Use the UID to update the password in Firebase Auth
    await adminAuth.updateUser(uid, {
      password: newPassword,
    });

    // 4. Delete the used OTP
    await deleteDoc(otpRef);

    return NextResponse.json({ success: true, message: 'Password has been reset successfully.' });

  } catch (error: any) {
    console.error('Error resetting password:', error);
    let errorMessage = 'An internal server error occurred.';
    if (error.code === 'auth/user-not-found') {
        errorMessage = 'User not found in Firebase Authentication.';
    } else if (error.message.includes('Firebase Admin SDK')) {
        errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
