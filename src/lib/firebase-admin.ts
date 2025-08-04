import * as admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';

interface FirebaseAdmin {
  app: admin.app.App;
  db: admin.firestore.Firestore;
  auth: admin.auth.Auth;
}

// This prevents re-initialization in hot-reloading environments
let adminInstance: FirebaseAdmin | null = null;

function getFirebaseAdmin(): FirebaseAdmin {
  if (adminInstance) {
    return adminInstance;
  }

  if (admin.apps.length === 0) {
    const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!serviceAccountString) {
      throw new Error(
        'FIREBASE_SERVICE_ACCOUNT environment variable is not set. Admin features will be disabled.'
      );
    }
    try {
      const serviceAccount = JSON.parse(serviceAccountString) as ServiceAccount;
      const app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      adminInstance = {
        app,
        db: admin.firestore(),
        auth: admin.auth(),
      };
      console.log('Firebase Admin SDK initialized successfully.');
    } catch (error: any) {
      console.error('Firebase Admin SDK initialization failed:', error.message);
      throw new Error(`Firebase Admin SDK initialization failed: ${error.message}`);
    }
  } else {
    const app = admin.app();
    adminInstance = {
      app,
      db: admin.firestore(app),
      auth: admin.auth(app),
    };
  }

  return adminInstance;
}

// Export a function that ensures the admin app is initialized
export const { db: adminDb, auth: adminAuth } = getFirebaseAdmin();

    