
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCEUQbfu7bP20JS9SHGIo88QjoYTASSQlE",
  authDomain: "mailjet-express.firebaseapp.com",
  projectId: "mailjet-express",
  storageBucket: "mailjet-express.appspot.com",
  messagingSenderId: "1041255436136",
  appId: "1:1041255436136:web:9a2e9eb00211619d64d0dd"
};


// Initialize Firebase for client-side
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (typeof window !== 'undefined') {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  auth = getAuth(app);
  db = getFirestore(app);
}


export { app, auth, db };
