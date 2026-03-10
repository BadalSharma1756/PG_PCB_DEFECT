import { SESSION_DURATION_MS } from "./constants";

const SESSION_KEY = "pg_session";

interface SessionData {
  employeeId: string;
  employeeName: string;
  location: string;
  startTime: number;
}

export function createSession(data: Omit<SessionData, "startTime">) {
  const session: SessionData = { ...data, startTime: Date.now() };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function getSession(): SessionData | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isSessionValid(): boolean {
  const session = getSession();
  if (!session) return false;
  return Date.now() - session.startTime < SESSION_DURATION_MS;
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function getSessionTimeRemaining(): number {
  const session = getSession();
  if (!session) return 0;
  const remaining = SESSION_DURATION_MS - (Date.now() - session.startTime);
  return Math.max(0, remaining);
}
