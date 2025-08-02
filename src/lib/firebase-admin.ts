
import * as admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';

// This function initializes the Firebase Admin SDK.
// It will only initialize if the service account environment variable is available.
const initializeFirebaseAdmin = () => {
  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;

  // Only proceed if the admin app is not already initialized AND the service account is available.
  if (!admin.apps.length && serviceAccountString) {
    try {
      const serviceAccount: ServiceAccount = JSON.parse(serviceAccountString);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } catch (error) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT or initialize Firebase Admin SDK:', error);
      // We don't throw an error here to allow the build to succeed.
      // Features depending on the Admin SDK will fail gracefully.
      return; 
    }
  }
};

// Call the initialization function.
initializeFirebaseAdmin();

// Export admin and dbAdmin. They will be null/undefined if initialization failed.
// Code using these exports must handle the case where they are not available.
const dbAdmin = admin.apps.length ? admin.firestore() : null;
const adminAuth = admin.apps.length ? admin.auth() : null;

export { admin, dbAdmin, adminAuth };
