
import * as admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';

// This function initializes the Firebase Admin SDK.
// It will only initialize if the service account environment variable is available.
const initializeFirebaseAdmin = () => {
  try {
    if (!admin.apps.length) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT as string);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
  } catch (error) {
    console.error('Firebase Admin SDK initialization failed:', error);
  }
};

// Call the initialization function.
initializeFirebaseAdmin();

// Export admin and dbAdmin. They will be null/undefined if initialization failed.
// Code using these exports must handle the case where they are not available.
const dbAdmin = admin.apps.length ? admin.firestore() : null;
const adminAuth = admin.apps.length ? admin.auth() : null;

export { admin, dbAdmin, adminAuth };
