import AsyncStorage from "@react-native-async-storage/async-storage";

export type GuideStepKey =
  "vehicle" | "schedule" | "complete" | "spending" | "documents" | "stats";

export interface GuideStep {
  key: GuideStepKey;
  done: boolean;
}

export interface GuideData {
  vehicles: unknown[];
  maintenances: {
    completedAt?: string | null;
    nextServiceKm?: number | null;
    nextServiceDate?: string | null;
  }[];
  expenses: unknown[];
  repairs: unknown[];
  documents: unknown[];
}

export interface GuidePrefs {
  dismissed: boolean;
  seen: boolean;
  statsVisited: boolean;
}

const PREFS_KEY = "@guide_prefs";

export const DEFAULT_GUIDE_PREFS: GuidePrefs = {
  dismissed: false,
  seen: false,
  statsVisited: false,
};

// Los pasos se marcan solos según lo que ya existe en la app; el último
// (revisar la inversión) se marca al abrir esa pantalla.
export const computeGuideSteps = (
  data: GuideData,
  prefs: GuidePrefs,
): GuideStep[] => [
  { key: "vehicle", done: data.vehicles.length > 0 },
  { key: "schedule", done: data.maintenances.length > 0 },
  {
    key: "complete",
    done: data.maintenances.some(
      (m) => !!m.completedAt || (!m.nextServiceKm && !m.nextServiceDate),
    ),
  },
  {
    key: "spending",
    done: data.expenses.length + data.repairs.length > 0,
  },
  { key: "documents", done: data.documents.length > 0 },
  { key: "stats", done: prefs.statsVisited },
];

export const loadGuidePrefs = async (): Promise<GuidePrefs> => {
  try {
    const raw = await AsyncStorage.getItem(PREFS_KEY);
    return raw
      ? { ...DEFAULT_GUIDE_PREFS, ...JSON.parse(raw) }
      : DEFAULT_GUIDE_PREFS;
  } catch {
    return DEFAULT_GUIDE_PREFS;
  }
};

export const updateGuidePrefs = async (
  patch: Partial<GuidePrefs>,
): Promise<GuidePrefs> => {
  const next = { ...(await loadGuidePrefs()), ...patch };
  try {
    await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(next));
  } catch {
    // Sin almacenamiento la guía sigue funcionando, solo no recuerda el estado
  }
  return next;
};
