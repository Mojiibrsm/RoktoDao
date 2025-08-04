
import { getApps, initializeApp, getApp, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { serviceAccount } from './firebase-service-account';

const appName = 'firebase-admin-app';
let adminApp: App;

if (!getApps().length) {
  adminApp = initializeApp({
    credential: {
        projectId: serviceAccount.project_id,
        clientEmail: serviceAccount.client_email,
        privateKey: serviceAccount.private_key,
    },
  });
} else {
  adminApp = getApp();
}

const adminAuth = getAuth(adminApp);
const adminDb = getFirestore(adminApp);

export { adminApp, adminAuth, adminDb };
