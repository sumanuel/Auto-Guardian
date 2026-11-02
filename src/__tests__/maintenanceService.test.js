jest.mock("../services/database", () => ({ __esModule: true, default: {} }));

import { getMaintenanceDueDate } from "../services/maintenanceService";

describe("getMaintenanceDueDate", () => {
  test("sin mantenimiento devuelve null", () => {
    expect(getMaintenanceDueDate(null)).toBeNull();
  });

  test("si el próximo servicio es por km no hay fecha", () => {
    expect(
      getMaintenanceDueDate({ nextServiceKm: 5000, date: "2026-01-01" }),
    ).toBeNull();
  });

  test("usa date y si no nextServiceDate", () => {
    expect(getMaintenanceDueDate({ date: "2026-01-01" })).toBe("2026-01-01");
    expect(getMaintenanceDueDate({ nextServiceDate: "2026-02-01" })).toBe(
      "2026-02-01",
    );
  });
});
