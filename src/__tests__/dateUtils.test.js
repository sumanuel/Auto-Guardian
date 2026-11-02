import {
  calculateNextServiceDate,
  daysUntilService,
  formatDate,
  formatRelativeDate,
} from "../utils/dateUtils";

const daysFromToday = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
};

describe("dateUtils", () => {
  test("formatDate usa dd/MM/yyyy por defecto", () => {
    expect(formatDate("2026-03-05")).toBe("05/03/2026");
  });

  test("calculateNextServiceDate suma meses", () => {
    const next = calculateNextServiceDate("2026-01-31", 1);
    expect(next.getFullYear()).toBe(2026);
    expect(next.getMonth()).toBe(1); // febrero
  });

  test("daysUntilService cuenta días desde hoy", () => {
    expect(daysUntilService(daysFromToday(10))).toBe(10);
    expect(daysUntilService(daysFromToday(-3))).toBe(-3);
    expect(daysUntilService(daysFromToday(0))).toBe(0);
  });

  test("formatRelativeDate describe pasado y futuro", () => {
    expect(formatRelativeDate(daysFromToday(0))).toBe("Hoy");
    expect(formatRelativeDate(daysFromToday(1))).toBe("Mañana");
    expect(formatRelativeDate(daysFromToday(-1))).toBe("Ayer");
    expect(formatRelativeDate(daysFromToday(5))).toBe("En 5 días");
  });
});
