import admin from 'firebase-admin';

const hasAdminConfig = Boolean(
  process.env.FIREBASE_ADMIN_PROJECT_ID &&
    process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
    process.env.FIREBASE_ADMIN_PRIVATE_KEY,
);

if (!admin.apps.length && hasAdminConfig) {
  admin.initializeApp({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: (process.env.FIREBASE_ADMIN_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    }),
  });
}

export const adminDb = hasAdminConfig ? admin.firestore() : null;
export const adminAuth = hasAdminConfig ? admin.auth() : null;
