
import * as admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';

// This is a singleton pattern to ensure Firebase Admin is initialized only once.
let app: admin.app.App | undefined;

export function getFirebaseAdmin() {
  if (!admin.apps.length) {
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
      console.error('Firebase Admin SDK initialization failed:', error);
      throw new Error(`Firebase Admin SDK initialization failed: ${error.message}. Please check if the FIREBASE_SERVICE_ACCOUNT environment variable is a valid JSON.`);
    }
  } else {
    app = admin.apps[0]!;
  }

  return {
    db: admin.firestore(),
    auth: admin.auth(),
    app: app, // Return the app instance as well
  };
}
