
import * as admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';

let dbAdmin: admin.firestore.Firestore | null = null;
let adminAuth: admin.auth.Auth | null = null;

const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;

if (serviceAccountString) {
  try {
    const serviceAccount = JSON.parse(serviceAccountString) as ServiceAccount;
    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('Firebase Admin SDK initialized successfully.');
    }
    dbAdmin = admin.firestore();
    adminAuth = admin.auth();
  } catch (parseError) {
    console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT. Make sure it is a valid JSON string.', parseError);
  }
} else {
  console.warn('Firebase Admin SDK: FIREBASE_SERVICE_ACCOUNT environment variable is not set.');
}

export { admin, dbAdmin, adminAuth };
