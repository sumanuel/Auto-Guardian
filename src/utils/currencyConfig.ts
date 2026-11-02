// Decimales con los que se muestran y calculan los montos (algunos países,
// como Portugal, usan 3). Lo define el usuario y lo guarda AppSettingsContext.

export const MIN_DECIMALS = 0;
export const MAX_DECIMALS = 3;
export const DEFAULT_DECIMALS = 2;

let currencyDecimals = DEFAULT_DECIMALS;

// Devuelve un entero entre MIN y MAX, o null si el valor no es válido
export const normalizeDecimals = (value: unknown): number | null => {
  // AsyncStorage devuelve null si nunca se guardó; Number(null) sería 0
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "string" ? Number.parseInt(value, 10) : Number(value);
  if (!Number.isInteger(n) || n < MIN_DECIMALS || n > MAX_DECIMALS) return null;
  return n;
};

export const getCurrencyDecimals = () => currencyDecimals;

export const setCurrencyDecimalsConfig = (value: unknown) => {
  const normalized = normalizeDecimals(value);
  if (normalized !== null) currencyDecimals = normalized;
};

// Redondea a los decimales configurados (evita errores de punto flotante)
export const roundMoney = (n: number, decimals = currencyDecimals) => {
  const factor = 10 ** decimals;
  return Math.round((n + Number.EPSILON) * factor) / factor;
};

// Texto de ayuda para los campos de monto: "0.00", "0.000" o "0"
export const moneyPlaceholder = (decimals = currencyDecimals) =>
  decimals > 0 ? `0.${"0".repeat(decimals)}` : "0";
