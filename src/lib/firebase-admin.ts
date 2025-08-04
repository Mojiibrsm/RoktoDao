import * as admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';

let app: admin.app.App;
let db: admin.firestore.Firestore;
let auth: admin.auth.Auth;

if (admin.apps.length === 0) {
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
        console.error('Firebase Admin SDK initialization failed:', error.message);
        throw new Error(`Firebase Admin SDK initialization failed: ${error.message}`);
    }
} else {
    app = admin.app();
}

db = admin.firestore(app);
auth = admin.auth(app);

export const adminDb = db;
export const adminAuth = auth;
