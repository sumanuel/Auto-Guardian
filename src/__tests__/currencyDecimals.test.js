import {
  DEFAULT_DECIMALS,
  moneyPlaceholder,
  normalizeDecimals,
  roundMoney,
  setCurrencyDecimalsConfig,
} from "../utils/currencyConfig";
import { formatCurrency } from "../utils/formatUtils";
import { itemsTotal, newDraftItem } from "../utils/itemsUtils";

afterEach(() => setCurrencyDecimalsConfig(DEFAULT_DECIMALS));

describe("decimales de moneda", () => {
  test("normalizeDecimals solo acepta enteros de 0 a 3", () => {
    expect(normalizeDecimals(3)).toBe(3);
    expect(normalizeDecimals("0")).toBe(0);
    expect(normalizeDecimals(4)).toBeNull();
    expect(normalizeDecimals(-1)).toBeNull();
    expect(normalizeDecimals(1.5)).toBeNull();
    expect(normalizeDecimals("abc")).toBeNull();
    // Sin valor guardado no debe interpretarse como 0 decimales
    expect(normalizeDecimals(null)).toBeNull();
    expect(normalizeDecimals(undefined)).toBeNull();
    expect(normalizeDecimals("")).toBeNull();
  });

  test("un valor inválido no cambia la configuración", () => {
    setCurrencyDecimalsConfig(3);
    setCurrencyDecimalsConfig(9);
    expect(formatCurrency(1, "€")).toBe("€1.000");
  });

  test("formatCurrency usa los decimales configurados", () => {
    expect(formatCurrency(1234.5678, "€")).toBe("€1,234.57");
    setCurrencyDecimalsConfig(3);
    expect(formatCurrency(1234.5678, "€")).toBe("€1,234.568");
    setCurrencyDecimalsConfig(0);
    expect(formatCurrency(1234.5678, "$")).toBe("$1,235");
  });

  test("el placeholder y el redondeo siguen los decimales", () => {
    expect(moneyPlaceholder()).toBe("0.00");
    setCurrencyDecimalsConfig(3);
    expect(moneyPlaceholder()).toBe("0.000");
    expect(roundMoney(1.23456)).toBe(1.235);
    setCurrencyDecimalsConfig(0);
    expect(moneyPlaceholder()).toBe("0");
  });

  test("el total del detalle conserva 3 decimales", () => {
    const item = { ...newDraftItem("Aceite"), quantity: "3", unitCost: "1.125" };
    expect(itemsTotal([item])).toBe(3.38); // con 2 decimales
    setCurrencyDecimalsConfig(3);
    expect(itemsTotal([item])).toBe(3.375);
  });
});
