
import * as admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';

let adminDb: admin.firestore.Firestore | null = null;
let adminAuth: admin.auth.Auth | null = null;

const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;

try {
  // Check if the service account key is available in environment variables
  if (serviceAccountString) {
    // Check if the SDK is already initialized to prevent re-initialization
    if (admin.apps.length === 0) {
      const serviceAccount = JSON.parse(serviceAccountString) as ServiceAccount;
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

      console.log('Firebase Admin SDK initialized successfully.');
    } else {
      // If already initialized, just get the instances
      console.log('Firebase Admin SDK was already initialized.');
    }
    adminDb = admin.firestore();
    adminAuth = admin.auth();

  } else {
    // Log a clear warning if the environment variable is not set
    console.warn('Firebase Admin SDK: FIREBASE_SERVICE_ACCOUNT environment variable is not set. Admin features will be disabled.');
  }
} catch (error) {
  // Log any errors that occur during initialization
  console.error('Firebase Admin SDK initialization failed:', error);
}

export { admin, adminDb, adminAuth };
