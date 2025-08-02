
import * as admin from 'firebase-admin';

const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!serviceAccountString) {
  throw new Error('The FIREBASE_SERVICE_ACCOUNT environment variable is not set. Please set it to your Firebase service account JSON.');
}

let serviceAccount;
try {
    serviceAccount = JSON.parse(serviceAccountString);
} catch (error) {
    throw new Error('Failed to parse FIREBASE_SERVICE_ACCOUNT. Make sure it is a valid JSON string.');
}


if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // databaseURL: `https://<YOUR_PROJECT_ID>.firebaseio.com` // Optional: if you use Realtime Database
  });
}

const dbAdmin = admin.firestore();

export { admin, dbAdmin };
