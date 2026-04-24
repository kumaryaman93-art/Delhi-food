import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Direct initialization — safe now that:
// 1. NEXT_PUBLIC_* env vars are set on Vercel (embedded at build time)
// 2. All pages that use Firebase are marked force-dynamic (no static prerendering)
// Proxy pattern was removed because Firebase SDK does instanceof checks internally
// which fail on Proxy objects, breaking signInWithEmailAndPassword / onSnapshot etc.

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db   = getFirestore(app);
export default app;
