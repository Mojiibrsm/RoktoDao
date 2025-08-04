
import * as admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';

// This is a singleton pattern to ensure Firebase Admin is initialized only once.
let app: admin.app.App | undefined;

export function getFirebaseAdmin() {
  if (admin.apps.length > 0 && app) {
    return {
      db: admin.firestore(),
      auth: admin.auth(),
      app: app,
    };
  }

  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccountString) {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT environment variable is not set. Admin features will be disabled.'
    );
  }

  try {
    // The service account string from the environment variable might have escaped newlines.
    // We need to parse it correctly by first replacing literal '\n' with actual newlines.
    const serviceAccountJson = serviceAccountString.replace(/\\n/g, '\n');
    const serviceAccount = JSON.parse(serviceAccountJson) as ServiceAccount;
    
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error: any) {
    console.error('Firebase Admin SDK initialization failed:', error.message);
    // Throw a more informative error to help debugging.
    throw new Error(`Firebase Admin SDK initialization failed: ${error.message}. Please check if the FIREBASE_SERVICE_ACCOUNT environment variable is a valid JSON.`);
  }

  return {
    db: admin.firestore(),
    auth: admin.auth(),
    app: app, // Return the app instance as well
  };
}
