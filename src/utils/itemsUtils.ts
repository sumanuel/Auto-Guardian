import { roundMoney } from "./currencyConfig";

// Detalle por ítems de mantenimientos, gastos y reparaciones.
// En pantalla se editan como texto (DraftItem); en la base se guardan como JSON
// con números (LineItem) en la columna `items`.

export interface LineItem {
  id: string;
  name: string;
  quantity: number;
  unitCost: number;
}

export interface DraftItem {
  id: string;
  name: string;
  quantity: string;
  unitCost: string;
}

// Acepta coma o punto como separador decimal
export const parseNumber = (value: string | number | null | undefined) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const parsed = parseFloat(String(value ?? "").trim().replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
};

export const itemSubtotal = (item: Pick<DraftItem, "quantity" | "unitCost">) =>
  roundMoney(parseNumber(item.quantity) * parseNumber(item.unitCost));

export const itemsTotal = (items: DraftItem[]) =>
  roundMoney(items.reduce((sum, item) => sum + itemSubtotal(item), 0));

let counter = 0;
export const newDraftItem = (name: string): DraftItem => ({
  id: `${Date.now()}-${counter++}`,
  name: name.trim(),
  quantity: "1",
  unitCost: "",
});

export const fromStoredItems = (
  raw: string | LineItem[] | null | undefined,
): DraftItem[] => {
  try {
    const list: LineItem[] = typeof raw === "string" ? JSON.parse(raw) : raw || [];
    if (!Array.isArray(list)) return [];
    return list.map((item, index) => ({
      id: item.id || `${Date.now()}-${index}`,
      name: String(item.name ?? ""),
      quantity: String(item.quantity ?? 1),
      unitCost: String(item.unitCost ?? 0),
    }));
  } catch {
    return [];
  }
};

// JSON para guardar en la base; null si no hay ítems
export const serializeItems = (items: DraftItem[] | null | undefined) => {
  if (!items || items.length === 0) return null;
  const stored: LineItem[] = items.map((item) => ({
    id: item.id,
    name: item.name,
    quantity: parseNumber(item.quantity),
    unitCost: parseNumber(item.unitCost),
  }));
  return JSON.stringify(stored);
};

// Valor para la columna `items`: acepta JSON ya serializado, un arreglo o nada
export const itemsToDb = (value: unknown): string | null => {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.length ? JSON.stringify(value) : null;
  return null;
};
