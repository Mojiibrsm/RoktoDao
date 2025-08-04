
import * as admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';

let adminDb: admin.firestore.Firestore | null = null;
let adminAuth: admin.auth.Auth | null = null;

if (admin.apps.length === 0) {
  try {
    const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!serviceAccountString) {
      console.warn('Firebase Admin SDK: FIREBASE_SERVICE_ACCOUNT environment variable is not set or empty. Admin features will be disabled.');
    } else {
        const serviceAccount = JSON.parse(serviceAccountString) as ServiceAccount;
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
        console.log('Firebase Admin SDK initialized successfully.');
        adminDb = admin.firestore();
        adminAuth = admin.auth();
    }
  } catch (error) {
    console.error('Firebase Admin SDK initialization failed:', error);
  }
} else {
    adminDb = admin.firestore();
    adminAuth = admin.auth();
}

export { admin, adminDb, adminAuth };
