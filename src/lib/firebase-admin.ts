
import { getApps, initializeApp, getApp, App, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { serviceAccount } from './firebase-service-account';

const appName = 'firebase-admin-app';
let adminApp: App;

if (!getApps().some(app => app.name === appName)) {
  adminApp = initializeApp({
    credential: cert(serviceAccount),
  }, appName);
} else {
  adminApp = getApp(appName);
}

const adminAuth = getAuth(adminApp);
const adminDb = getFirestore(adminApp);

export { adminApp, adminAuth, adminDb };
