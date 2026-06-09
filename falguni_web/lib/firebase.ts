import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyB_HaVk-0R-2iFcc5O9wFSJvlwXajESIMk',
  authDomain: 'falguni-admin.firebaseapp.com',
  projectId: 'falguni-admin',
  storageBucket: 'falguni-admin.appspot.com',
  messagingSenderId: '7031551502',
  appId: '1:7031551502:web:e7d1b7330c564fd83c6e5f',
  measurementId: 'G-DDSSY84LHT',
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
