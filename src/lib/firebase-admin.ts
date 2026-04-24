import admin from "firebase-admin";

// Lazy initialization — only runs on first actual request, not at build time.
// This prevents Next.js from crashing during static page collection when
// FIREBASE_* env vars are absent in the build environment.
function getApp() {
  if (admin.apps.length) return admin.apps[0]!;

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export const adminAuth = new Proxy({} as admin.auth.Auth, {
  get(_, prop) {
    return (getApp().auth() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export const adminDb = new Proxy({} as admin.firestore.Firestore, {
  get(_, prop) {
    return (getApp().firestore() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export default admin;
