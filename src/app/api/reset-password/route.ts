
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, dbAdmin } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  if (!adminAuth || !dbAdmin) {
    return NextResponse.json({ error: 'Admin SDK not initialized.' }, { status: 500 });
  }

  try {
    const { phoneNumber, newPassword } = await request.json();

    if (!phoneNumber || !newPassword) {
      return NextResponse.json({ error: 'Phone number and new password are required.' }, { status: 400 });
    }

    // Find the user by phone number in Firestore first
    const donorsRef = dbAdmin.collection('donors');
    const querySnapshot = await donorsRef.where('phoneNumber', '==', phoneNumber.substring(3)).limit(1).get(); // remove +88

    if (querySnapshot.empty) {
      return NextResponse.json({ error: 'User with this phone number not found.' }, { status: 404 });
    }

    const userDoc = querySnapshot.docs[0];
    const uid = userDoc.id; // The UID is the document ID

    // Use the UID to update the password in Firebase Auth
    await adminAuth.updateUser(uid, {
      password: newPassword,
    });

    return NextResponse.json({ success: true, message: 'Password has been reset successfully.' });

  } catch (error: any) {
    console.error('Error resetting password:', error);
    let errorMessage = 'An internal server error occurred.';
    if (error.code === 'auth/user-not-found') {
        errorMessage = 'User not found.';
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
