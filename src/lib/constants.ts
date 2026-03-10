// Dynamic config stored in localStorage for CRUD operations
const getStoredArray = (key: string, defaults: string[]): string[] => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaults;
};

const setStoredArray = (key: string, values: string[]) => {
  localStorage.setItem(key, JSON.stringify(values));
};

// Default values
const DEFAULT_PLANTS = ["NGM", "PGTL"];
const DEFAULT_LOCATIONS = ["Pune", "Noida", "Bhiwadi"];
const DEFAULT_LINES = ["Line 1", "Line 2"];
const DEFAULT_SHIFTS = ["Morning", "Evening"];

// Getter functions for dynamic data
export const getPlants = () => getStoredArray("pg_plants", DEFAULT_PLANTS);
export const getLocations = () => getStoredArray("pg_locations", DEFAULT_LOCATIONS);
export const getLines = () => getStoredArray("pg_lines", DEFAULT_LINES);
export const getShifts = () => DEFAULT_SHIFTS;

// Setter functions for CRUD
export const setPlants = (v: string[]) => setStoredArray("pg_plants", v);
export const setLocations = (v: string[]) => setStoredArray("pg_locations", v);
export const setLines = (v: string[]) => setStoredArray("pg_lines", v);

// Static constants
export const PLANTS = DEFAULT_PLANTS;
export const LOCATIONS = DEFAULT_LOCATIONS;
export const LINES = DEFAULT_LINES;
export const SHIFTS = DEFAULT_SHIFTS;
export const UNIT_TYPES = ["IDU", "ODU"] as const;
export const SEVERITIES = ["Major", "Minor"] as const;
export const ACTIONS = ["Scrap", "Repair"] as const;

export const DEFAULT_IDU_DEFECTS = [
  "E5 Error",
  "REMOTE NOT SENSE",
  "E1 Error",
  "NO BEEP SOUND",
];

export const DEFAULT_ODU_DEFECTS = [
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
];

const IDU_KEY = "pg_idu_defects";
const ODU_KEY = "pg_odu_defects";

export const getIduDefects = () => getStoredArray(IDU_KEY, DEFAULT_IDU_DEFECTS);
export const getOduDefects = () => getStoredArray(ODU_KEY, DEFAULT_ODU_DEFECTS);
export const setIduDefects = (v: string[]) => setStoredArray(IDU_KEY, v);
export const setOduDefects = (v: string[]) => setStoredArray(ODU_KEY, v);

export const IDU_DEFECTS = DEFAULT_IDU_DEFECTS;
export const ODU_DEFECTS = DEFAULT_ODU_DEFECTS;

export const SESSION_DURATION_MS = 12 * 60 * 60 * 1000; // 12 hours

// Admin credentials - fixed per location
export const ADMIN_CREDENTIALS: Record<string, { email: string; password: string }> = {
  Pune: { email: "admin.pune@pgelectroplast.com", password: "pune@admin123" },
  Noida: { email: "admin.noida@pgelectroplast.com", password: "noida@admin123" },
  Bhiwadi: { email: "admin.bhiwadi@pgelectroplast.com", password: "bhiwadi@admin123" },
};

// Location-specific passwords (for cross-location data access)
export const LOCATION_PASSWORDS: Record<string, string> = {
  Pune: "pune123",
  Noida: "noida123",
  Bhiwadi: "bhiwadi123",
};

// Admin portal password
export const ADMIN_PORTAL_PASSWORD = "portal@admin123";

// Excel download – password required to download any report
export const EXCEL_DOWNLOAD_PASSWORD = "excel@download123";
