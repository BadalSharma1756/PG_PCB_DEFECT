import { initializeApp, type FirebaseApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? "AIzaSyDg2fQW1FSd8qz-zRwHmVydsz6rQXQj2yg",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? "pgelectroplastpcb.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "pgelectroplastpcb",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? "pgelectroplastpcb.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "179303519022",
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? "1:179303519022:web:0265e37dac2db357e3e0bf",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ?? "G-9PCDJJW3HE",
};

let app: FirebaseApp | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  if (!firebaseConfig.projectId) return null;
  if (!app) app = initializeApp(firebaseConfig);
  return app;
}

export function getDb() {
  const a = getFirebaseApp();
  if (!a) return null;
  const db = getFirestore(a);
  try {
    enableIndexedDbPersistence(db).catch(() => {});
  } catch (_) {}
  return db;
}

// Collection names – Firestore auto-creates on first write
export const COLLECTIONS = {
  DEFECTS: "defects",
  EMPLOYEE_USERS: "employeeUsers",
  SESSION_REQUESTS: "sessionRequests",
  EMPLOYEES: "employees",
  CONFIG: "config",
} as const;

export const CONFIG_DOC_ID = "appConfig";
