
import * as admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';

let adminDb: admin.firestore.Firestore | null = null;
let adminAuth: admin.auth.Auth | null = null;

// Ensure this block runs only once.
if (admin.apps.length === 0) {
  try {
    const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!serviceAccountString) {
      throw new Error('Firebase Admin SDK: FIREBASE_SERVICE_ACCOUNT environment variable is not set or empty. Admin features will be disabled.');
    }
    const serviceAccount = JSON.parse(serviceAccountString) as ServiceAccount;
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('Firebase Admin SDK initialized successfully.');
  } catch (error) {
    console.error('Firebase Admin SDK initialization failed:', error);
  }
}

// Assign the instances after initialization (or attempt).
// This way, they are either valid instances or remain null.
try {
  adminDb = admin.firestore();
  adminAuth = admin.auth();
} catch (error) {
    console.error('Failed to get Firestore or Auth instance from Firebase Admin SDK. They might not be initialized.', error);
}

export { admin, adminDb, adminAuth };
