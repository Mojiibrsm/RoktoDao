import * as admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';

// This prevents re-initialization in hot-reloading environments
let adminInstance: admin.app.App | null = null;

function initializeAdminApp(): admin.app.App {
    if (admin.apps.length > 0) {
        return admin.app();
    }
    
    const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!serviceAccountString) {
      throw new Error(
        'FIREBASE_SERVICE_ACCOUNT environment variable is not set. Admin features will be disabled.'
      );
    }
    
    try {
        const serviceAccount = JSON.parse(serviceAccountString) as ServiceAccount;
        return admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    } catch (error: any) {
        console.error('Firebase Admin SDK initialization failed:', error.message);
        throw new Error(`Firebase Admin SDK initialization failed: ${error.message}`);
    }
}


function getFirebaseAdmin() {
  if (!adminInstance) {
    adminInstance = initializeAdminApp();
  }
  return {
    app: adminInstance,
    db: admin.firestore(adminInstance),
    auth: admin.auth(adminInstance),
  };
}

export const { db: adminDb, auth: adminAuth } = getFirebaseAdmin();
