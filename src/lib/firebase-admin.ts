
import * as admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';

let dbAdmin: admin.firestore.Firestore | null = null;
let adminAuth: admin.auth.Auth | null = null;

try {
  if (admin.apps.length === 0) {
    const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
    
    if (serviceAccountString) {
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
      console.warn('Firebase Admin SDK: FIREBASE_SERVICE_ACCOUNT environment variable is not set.');
    }
  } else {
      dbAdmin = admin.firestore();
      adminAuth = admin.auth();
  }
} catch (error) {
  console.error('Firebase Admin SDK initialization failed:', error);
}

export { admin, dbAdmin, adminAuth };
