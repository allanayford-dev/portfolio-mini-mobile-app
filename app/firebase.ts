import { getApp, getApps, initializeApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const requiredConfigKeys = [
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_APP_ID',
] as const;

export const missingFirebaseConfigKeys = requiredConfigKeys.filter(
  (key) => !process.env[key],
);

export const isFirebaseConfigured = missingFirebaseConfigKeys.length === 0;

const firebaseApp = isFirebaseConfigured
  ? getApps().length > 0
    ? getApp()
    : initializeApp(firebaseConfig)
  : null;

function createAuth(): Auth | null {
  if (!isFirebaseConfigured) {
    return null;
  }

  return getAuth(firebaseApp!);
}

function createDb(): Firestore | null {
  if (!isFirebaseConfigured) {
    return null;
  }

  return getFirestore(firebaseApp!);
}

export const auth = createAuth();
export const db = createDb();
