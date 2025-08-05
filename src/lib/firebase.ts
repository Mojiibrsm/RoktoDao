
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, RecaptchaVerifier } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCEUQbfu7bP20JS9SHGIo88QjoYTASSQlE",
  authDomain: "mailjet-express.firebaseapp.com",
  projectId: "mailjet-express",
  storageBucket: "mailjet-express.appspot.com",
  messagingSenderId: "1041255436136",
  appId: "1:1041255436136:web:9a2e9eb00211619d64d0dd"
};


// Initialize Firebase for client and server side
const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);


export { app, auth, db, RecaptchaVerifier };
