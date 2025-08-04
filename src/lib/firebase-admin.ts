
import * as admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';
import { serviceAccount as serviceAccountCredentials } from './firebase-service-account';

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
  
  const serviceAccount = serviceAccountCredentials as ServiceAccount;
  
  try {
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error: any) {
    console.error('Firebase Admin SDK initialization failed:', error.message);
    throw new Error(`Firebase Admin SDK initialization failed: ${error.message}.`);
  }

  return {
    db: admin.firestore(),
    auth: admin.auth(),
    app: app,
  };
}
