
import { getApps, initializeApp, getApp, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { ServiceAccount, cert } from 'firebase-admin/app';
import { serviceAccount } from './firebase-service-account';

const serviceAccountCredentials = serviceAccount as ServiceAccount;

function initializeAdminApp(): App {
  if (getApps().length > 0) {
    return getApp();
  }

  try {
    return initializeApp({
      credential: cert(serviceAccountCredentials),
    });
  } catch (error: any) {
    console.error('Firebase Admin SDK initialization failed:', error.message);
    throw new Error(`Firebase Admin SDK initialization failed: ${error.message}.`);
  }
}

const adminApp = initializeAdminApp();
const adminAuth = getAuth(adminApp);
const adminDb = getFirestore(adminApp);

export { adminApp, adminAuth, adminDb };
