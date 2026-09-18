import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyAKm3lkXENu0lVNWw5VPAVHAZotDmjEjKU',
  authDomain: 'falgunigruhudhyog-cd439.firebaseapp.com',
  projectId: 'falgunigruhudhyog-cd439',
  storageBucket: 'falgunigruhudhyog-cd439.firebasestorage.app',
  messagingSenderId: '84686827194',
  appId: '1:84686827194:web:68d0693c15f65526e05c83',
};

// Prevent re-initializing on hot reload
const isNewApp = getApps().length === 0;
const app = isNewApp ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = isNewApp 
  ? initializeFirestore(app, { experimentalForceLongPolling: true }) 
  : getFirestore(app);
export const storage = getStorage(app);
export default app;
