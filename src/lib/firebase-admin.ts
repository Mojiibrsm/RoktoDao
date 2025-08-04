
import * as admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';

// This is a singleton pattern to ensure Firebase Admin is initialized only once.
let app: admin.app.App | undefined;

function getFirebaseAdmin() {
  if (!app) {
    const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!serviceAccountString) {
      throw new Error(
        'FIREBASE_SERVICE_ACCOUNT environment variable is not set. Admin features will be disabled.'
      );
    }

    try {
      const serviceAccount = JSON.parse(serviceAccountString) as ServiceAccount;
      app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } catch (error: any) {
      // Provide a more descriptive error to help debug the JSON parsing issue.
      console.error('Firebase Admin SDK initialization failed:', error);
      throw new Error(`Firebase Admin SDK initialization failed: ${error.message}. Please check if the FIREBASE_SERVICE_ACCOUNT environment variable is a valid JSON.`);
    }
  }

  return {
    db: admin.firestore(app),
    auth: admin.auth(app),
  };
}

export const { db: adminDb, auth: adminAuth } = getFirebaseAdmin();
