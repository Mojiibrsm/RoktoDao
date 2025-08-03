
import * as admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';

let adminDb: admin.firestore.Firestore | null = null;
let adminAuth: admin.auth.Auth | null = null;

try {
  if (admin.apps.length === 0) {
    const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!serviceAccountString) {
      throw new Error('Firebase Admin SDK: FIREBASE_SERVICE_ACCOUNT environment variable is not set or empty. Admin features will be disabled.');
    }
    const serviceAccount = JSON.parse(serviceAccountString) as ServiceAccount;
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('Firebase Admin SDK initialized successfully.');
  }
  
  adminDb = admin.firestore();
  adminAuth = admin.auth();
  
} catch (error) {
  console.error('Firebase Admin SDK initialization failed:', error);
  // Keep adminDb and adminAuth as null if initialization fails
}

export { admin, adminDb, adminAuth };
