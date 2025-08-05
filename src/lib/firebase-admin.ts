
import { getApps, initializeApp, getApp, App, credential } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { serviceAccount } from './firebase-service-account';

let adminApp: App;

if (!getApps().length) {
  adminApp = initializeApp({
    credential: credential.cert(serviceAccount),
  });
} else {
  adminApp = getApp();
}

const adminAuth = getAuth(adminApp);
const adminDb = getFirestore(adminApp);

export { adminApp, adminAuth, adminDb };
