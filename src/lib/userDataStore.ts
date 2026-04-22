// Stores user-specific data in localStorage keyed by email+role

const DATA_KEY_PREFIX = "medibot_userdata_";

function getKey(email: string, role: string) {
  return `${DATA_KEY_PREFIX}${role}_${email.toLowerCase()}`;
}

export type StoredPatientData = {
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  medicines: {
    id: string;
    name: string;
    medicine_type: string;
    doses_per_day: number;
    meal_slots: string[];
  }[];
};

export type StoredCaretakerData = {
  caretakerId: string;
  caretakerName: string;
  caretakerAge: number;
  caretakerGender: string;
  caretakerPhone: string | null;
  caretakerEmail: string | null;
  patients: StoredPatientData[];
};

export function savePatientData(email: string, data: StoredPatientData) {
  const key = getKey(email, "patient");
  localStorage.setItem(key, JSON.stringify(data));
}

export function loadPatientData(email: string): StoredPatientData | null {
  try {
    const key = getKey(email, "patient");
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveCaretakerData(email: string, data: StoredCaretakerData) {
  const key = getKey(email, "caretaker");
  localStorage.setItem(key, JSON.stringify(data));
}

export function loadCaretakerData(email: string): StoredCaretakerData | null {
  try {
    const key = getKey(email, "caretaker");
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Save medicine logs (taken status) per user
const LOGS_KEY_PREFIX = "medibot_logs_";

export type StoredLog = {
  id: string;
  patient_id: string;
  medicine_id: string;
  meal_slot: string;
  scheduled_date: string;
  taken_at: string | null;
};

function getLogsKey(email: string, role: string) {
  return `${LOGS_KEY_PREFIX}${role}_${email.toLowerCase()}`;
}

export function saveLogs(email: string, role: string, logs: StoredLog[]) {
  localStorage.setItem(getLogsKey(email, role), JSON.stringify(logs));
}

export function loadLogs(email: string, role: string): StoredLog[] {
  try {
    const raw = localStorage.getItem(getLogsKey(email, role));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
