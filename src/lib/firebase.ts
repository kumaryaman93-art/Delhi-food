import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

// Lazy initialization — same pattern as firebase-admin.ts.
// Firebase client must NOT be initialized at module-import time because:
//   1. Next.js evaluates modules during static page generation (build time)
//   2. NEXT_PUBLIC_* vars are embedded at build time, so if a build runs without
//      them (e.g. first deploy before env vars are set) it will crash.
// With Proxies, initializeApp() is only called when a property is first accessed
// in the browser, never during SSR/static rendering.

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function getFirebaseApp(): FirebaseApp {
  if (getApps().length) return getApp();
  return initializeApp(firebaseConfig);
}

export const auth = new Proxy({} as Auth, {
  get(_, prop) {
    return (getAuth(getFirebaseApp()) as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export const db = new Proxy({} as Firestore, {
  get(_, prop) {
    return (getFirestore(getFirebaseApp()) as unknown as Record<string | symbol, unknown>)[prop];
  },
});
