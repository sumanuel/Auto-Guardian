export const normalizeVersionString = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  return String(value).trim();
};

// Soporta: 1.2.3 | 0.1.1.260131 | 1.2.3-beta (ignora sufijos)
export const parseVersionParts = (versionString: unknown): number[] => {
  const v = normalizeVersionString(versionString);
  if (!v) return [];

  const main = v.split("-")[0];
  return main.split(".").map((part) => {
    const numeric = String(part).replace(/[^0-9]/g, "");
    if (!numeric) return 0;
    const n = Number.parseInt(numeric, 10);
    return Number.isFinite(n) ? n : 0;
  });
};

export const compareVersions = (a: unknown, b: unknown): number => {
  const pa = parseVersionParts(a);
  const pb = parseVersionParts(b);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i += 1) {
    const va = pa[i] ?? 0;
    const vb = pb[i] ?? 0;
    if (va > vb) return 1;
    if (va < vb) return -1;
  }
  return 0;
};

export interface StoreUpdateInfo {
  latestVersion: string | null;
  url: string | null;
  updateAvailable: boolean;
  // true cuando la versión instalada es menor que `minimumVersion`
  forceUpdate: boolean;
}

// Interpreta el version.json publicado: { latestVersion, minimumVersion?, url? }
export const evaluateStoreUpdate = (
  data:
    | { latestVersion?: unknown; minimumVersion?: unknown; url?: unknown }
    | null
    | undefined,
  currentVersion: string,
): StoreUpdateInfo => {
  const latest = normalizeVersionString(data?.latestVersion);
  const minimum = normalizeVersionString(data?.minimumVersion);
  const url = normalizeVersionString(data?.url);

  return {
    latestVersion: latest || null,
    url: url || null,
    updateAvailable: !!latest && compareVersions(latest, currentVersion) > 0,
    forceUpdate: !!minimum && compareVersions(minimum, currentVersion) > 0,
  };
};

export interface UpdatePromptRecord {
  version: string;
  day: string;
}

export const dayKey = (date: Date): string => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

// El aviso opcional se muestra una vez al día por cada versión nueva
export const shouldShowUpdatePrompt = (
  last: UpdatePromptRecord | null | undefined,
  latestVersion: string,
  now: Date = new Date(),
): boolean => {
  if (!last || last.version !== latestVersion) return true;
  return last.day !== dayKey(now);
};
