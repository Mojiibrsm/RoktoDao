
import * as admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';

// This function initializes the Firebase Admin SDK.
// It will only initialize if the service account environment variable is available.
const initializeFirebaseAdmin = () => {
  try {
    const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
    
    // Check if the service account string is available and not empty
    if (!serviceAccountString || serviceAccountString.trim() === '') {
      console.warn('Firebase Admin SDK: FIREBASE_SERVICE_ACCOUNT environment variable is not set or is empty.');
      return;
    }

    // Check if there are already initialized apps
    if (admin.apps.length === 0) {
      let serviceAccount: ServiceAccount;
      try {
        serviceAccount = JSON.parse(serviceAccountString) as ServiceAccount;
      } catch (parseError) {
        console.error('Firebase Admin SDK: Failed to parse FIREBASE_SERVICE_ACCOUNT string.', parseError);
        return;
      }
      
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

// Export admin and dbAdmin. They will be null if initialization failed.
// Code using these exports must handle the case where they are not available.
const dbAdmin = admin.apps.length ? admin.firestore() : null;
const adminAuth = admin.apps.length ? admin.auth() : null;

export { admin, dbAdmin, adminAuth };
