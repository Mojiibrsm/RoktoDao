
import { getApps, initializeApp, getApp, App, credential } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import serviceAccountJson from './firebase-service-account.json';

// Since the service account is a JSON object, we need to cast it to the correct type.
const serviceAccount = serviceAccountJson as {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
  universe_domain: string;
};


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
