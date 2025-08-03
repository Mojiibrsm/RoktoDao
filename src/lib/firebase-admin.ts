
import * as admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';

let dbAdmin: admin.firestore.Firestore | null = null;
let adminAuth: admin.auth.Auth | null = null;

try {
  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
  
  if (serviceAccountString) {
    if (admin.apps.length === 0) {
      try {
        const serviceAccount = JSON.parse(serviceAccountString) as ServiceAccount;
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        dbAdmin = admin.firestore();
        adminAuth = admin.auth();
      } catch (parseError) {
         console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT. Make sure it is a valid JSON string.', parseError);
      }
    } else {
        dbAdmin = admin.firestore();
        adminAuth = admin.auth();
    }
  } else {
    console.warn('Firebase Admin SDK: FIREBASE_SERVICE_ACCOUNT environment variable is not set.');
  }
} catch (error) {
  console.error('Firebase Admin SDK initialization failed:', error);
}

export { admin, dbAdmin, adminAuth };
