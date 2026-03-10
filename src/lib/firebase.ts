import {
  getDoc,
  setDoc,
  doc,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  limit,
  type Unsubscribe,
} from "firebase/firestore";
import { getDb, COLLECTIONS, CONFIG_DOC_ID } from "./firebase";
import type { Defect, EmployeeUser, SessionRequest } from "./types";

export interface AppConfig {
  locations: string[];
  plants: string[];
  lines: string[];
  iduDefects: string[];
  oduDefects: string[];
}

const DEFAULT_CONFIG: AppConfig = {
  locations: ["Pune", "Noida", "Bhiwadi"],
  plants: ["NGM", "PGTL"],
  lines: ["Line 1", "Line 2"],
  iduDefects: [
    "E5 Error",
    "REMOTE NOT SENSE",
    "E1 Error",
    "NO BEEP SOUND",
  ],
  oduDefects: [
    "COMPRESSOR LOST STEP",
    "COMPRESSOR CURRENT PROT",
    "COMP. NOT START",
    "DC FAN FAULT",
    "IPM FAULT",
    "COMP. OVER CURRENT",
    "FAN CONNECTOR MISS",
    "CONNECTING FAIL",
    "PCB INTERNAL WIRING WRONG",
    "BLDC MOTOR ERROR",
    "DISCHARGE TEMP.SENSOR FAIL",
    "FAN MOTOR NOT START",
    "PCB Burn",
    "COMPRESSOR DRIE ERROR",
  ],
};

function getConfigRef() {
  const db = getDb();
  return db ? doc(db, COLLECTIONS.CONFIG, CONFIG_DOC_ID) : null;
}

/** Ensure config document exists with defaults (creates collections automatically) */
export async function initConfigIfNeeded(): Promise<void> {
  const ref = getConfigRef();
  if (!ref) return;
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, DEFAULT_CONFIG);
  }
}

export async function getConfig(): Promise<AppConfig> {
  const ref = getConfigRef();
  if (!ref) return DEFAULT_CONFIG;
  const snap = await getDoc(ref);
  if (!snap.exists()) return DEFAULT_CONFIG;
  const data = snap.data();
  return {
    locations: data.locations ?? DEFAULT_CONFIG.locations,
    plants: data.plants ?? DEFAULT_CONFIG.plants,
    lines: data.lines ?? DEFAULT_CONFIG.lines,
    iduDefects: data.iduDefects ?? DEFAULT_CONFIG.iduDefects,
    oduDefects: data.oduDefects ?? DEFAULT_CONFIG.oduDefects,
  };
}

export async function updateConfig(partial: Partial<AppConfig>): Promise<void> {
  const ref = getConfigRef();
  if (!ref) return;
  const current = await getConfig();
  await setDoc(ref, { ...current, ...partial });
}

export async function addDefect(data: Omit<Defect, "id">): Promise<string> {
  const db = getDb();
  if (!db) throw new Error("Firebase not configured");
  const ref = await addDoc(collection(db, COLLECTIONS.DEFECTS), {
    ...data,
    timestamp: data.timestamp || new Date().toISOString(),
  });
  return ref.id;
}

export async function getDefectsByLocation(location: string): Promise<Defect[]> {
  const db = getDb();
  if (!db) return [];
  try {
    const q = query(
      collection(db, COLLECTIONS.DEFECTS),
      where("location", "==", location),
      orderBy("timestamp", "desc"),
      limit(500)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Defect));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("getDefectsByLocation error:", err);
    return [];
  }
}

export function subscribeDefectsByLocation(
  location: string,
  cb: (defects: Defect[]) => void
): Unsubscribe | null {
  const db = getDb();
  if (!db) return null;
  const q = query(
    collection(db, COLLECTIONS.DEFECTS),
    where("location", "==", location),
    orderBy("timestamp", "desc"),
    limit(500)
  );
  // Attach an error callback to surface subscription failures in console
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Defect));
      cb(list);
    },
    (err) => {
      // eslint-disable-next-line no-console
      console.error("subscribeDefectsByLocation snapshot error:", err);
    }
  );
}

export async function getEmployeeUserByEmployeeId(
  employeeId: string
): Promise<(EmployeeUser & { id: string }) | null> {
  const db = getDb();
  if (!db) return null;
  const q = query(
    collection(db, COLLECTIONS.EMPLOYEE_USERS),
    where("employeeId", "==", employeeId),
    limit(1)
  );
  const snap = await getDocs(q);
  const doc = snap.docs[0];
  return doc ? { id: doc.id, ...doc.data() } as EmployeeUser & { id: string } : null;
}

export async function addEmployeeUser(
  data: Omit<EmployeeUser, "id" | "createdAt" | "hasLoggedInBefore">
): Promise<string> {
  const db = getDb();
  if (!db) throw new Error("Firebase not configured");
  const ref = await addDoc(collection(db, COLLECTIONS.EMPLOYEE_USERS), {
    ...data,
    createdAt: new Date().toISOString(),
    hasLoggedInBefore: false,
  });
  return ref.id;
}

export async function setEmployeeUserHasLoggedIn(id: string): Promise<void> {
  const db = getDb();
  if (!db) return;
  const ref = doc(db, COLLECTIONS.EMPLOYEE_USERS, id);
  await setDoc(ref, { hasLoggedInBefore: true }, { merge: true });
}

export async function getSessionRequestsByAdminEmail(
  adminEmail: string
): Promise<SessionRequest[]> {
  const db = getDb();
  if (!db) return [];
  const q = query(
    collection(db, COLLECTIONS.SESSION_REQUESTS),
    where("createdByAdminEmail", "==", adminEmail),
    orderBy("requestedAt", "desc"),
    limit(100)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as SessionRequest));
}

export function subscribeSessionRequestsByAdminEmail(
  adminEmail: string,
  cb: (list: SessionRequest[]) => void
): Unsubscribe | null {
  const db = getDb();
  if (!db) return null;
  const q = query(
    collection(db, COLLECTIONS.SESSION_REQUESTS),
    where("createdByAdminEmail", "==", adminEmail),
    orderBy("requestedAt", "desc"),
    limit(100)
  );
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as SessionRequest));
    cb(list);
  });
}

export async function addSessionRequest(
  data: Omit<SessionRequest, "id">
): Promise<string> {
  const db = getDb();
  if (!db) throw new Error("Firebase not configured");
  const ref = await addDoc(collection(db, COLLECTIONS.SESSION_REQUESTS), data);
  return ref.id;
}

export async function updateSessionRequest(
  id: string,
  data: Partial<SessionRequest>
): Promise<void> {
  const db = getDb();
  if (!db) return;
  const ref = doc(db, COLLECTIONS.SESSION_REQUESTS, id);
  await setDoc(ref, data, { merge: true });
}
