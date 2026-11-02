const mockRun = jest.fn(() => ({ lastInsertRowId: 1 }));
jest.mock("../services/database", () => ({
  __esModule: true,
  default: { runSync: (...a) => mockRun(...a) },
}));

import { createExpense, updateExpense } from "../services/expenseService";

const base = { vehicleId: 1, description: "Peaje", date: "2026-01-01", cost: 5 };

beforeEach(() => jest.clearAllMocks());

describe("expenseService (detalle por ítems)", () => {
  test("createExpense guarda los ítems como JSON", () => {
    createExpense({ ...base, items: '[{"id":"1"}]' });
    const params = mockRun.mock.calls[0][1];
    expect(params[params.length - 1]).toBe('[{"id":"1"}]');
  });

  test("updateExpense conserva los ítems si no se envían", () => {
    updateExpense(3, base);
    const params = mockRun.mock.calls[0][1];
    expect(params.slice(-3)).toEqual([0, null, 3]);
  });

  test("updateExpense reemplaza o borra los ítems si se envían", () => {
    updateExpense(3, { ...base, items: '[{"id":"2"}]' });
    expect(mockRun.mock.calls[0][1].slice(-3)).toEqual([1, '[{"id":"2"}]', 3]);
    updateExpense(3, { ...base, items: null });
    expect(mockRun.mock.calls[1][1].slice(-3)).toEqual([1, null, 3]);
  });
});
