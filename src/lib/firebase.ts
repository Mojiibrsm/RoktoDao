
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCEUQbfu7bP20JS9SHGIo88QjoYTASSQlE",
  authDomain: "mailjet-express.firebaseapp.com",
  projectId: "mailjet-express",
  storageBucket: "mailjet-express.appspot.com",
  messagingSenderId: "1041255436136",
  appId: "1:1041255436136:web:9a2e9eb00211619d64d0dd"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
