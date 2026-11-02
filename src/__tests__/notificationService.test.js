const mockSchedule = jest.fn();
const mockCancel = jest.fn();
let mockExisting = [];

jest.mock("expo-notifications", () => ({
  setNotificationHandler: jest.fn(),
  getAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve(mockExisting)),
  scheduleNotificationAsync: (...a) => mockSchedule(...a),
  cancelScheduledNotificationAsync: (...a) => mockCancel(...a),
  SchedulableTriggerInputTypes: { DATE: "date" },
  AndroidNotificationPriority: { HIGH: "high" },
  AndroidImportance: { HIGH: 4 },
}));
jest.mock("../services/database", () => ({ __esModule: true, default: {} }));

import { scheduleMaintenanceDueNotifications } from "../services/notificationService";

const now = new Date(2026, 5, 1, 12, 0, 0);
const vehicles = [{ id: 1, name: "Auto", currentKm: 1000 }];
const upcoming = (items) => () => items;

beforeEach(() => {
  jest.clearAllMocks();
  mockExisting = [];
});

describe("scheduleMaintenanceDueNotifications", () => {
  test("programa aviso 3 días antes y el día del vencimiento a las 9:00", async () => {
    const count = await scheduleMaintenanceDueNotifications(
      vehicles,
      upcoming([{ type: "Aceite", date: "2026-06-20T00:00:00" }]),
      now,
    );
    expect(count).toBe(2);
    const dates = mockSchedule.mock.calls.map(([c]) => c.trigger.date);
    expect(dates[0].getDate()).toBe(17);
    expect(dates[1].getDate()).toBe(20);
    expect(dates.every((d) => d.getHours() === 9)).toBe(true);
  });

  test("omite fechas pasadas, completados y los de kilometraje", async () => {
    const count = await scheduleMaintenanceDueNotifications(
      vehicles,
      upcoming([
        { type: "A", date: "2026-05-01" },
        { type: "B", date: "2026-07-01", completedAt: "2026-06-01" },
        { type: "C", date: "2026-07-01", nextServiceKm: 5000 },
      ]),
      now,
    );
    expect(count).toBe(0);
    expect(mockSchedule).not.toHaveBeenCalled();
  });

  test("reemplaza los avisos de vencimiento anteriores sin tocar otros", async () => {
    mockExisting = [
      { identifier: "old", content: { data: { type: "maintenance-due" } } },
      { identifier: "other", content: { data: { type: "alert-summary" } } },
    ];
    await scheduleMaintenanceDueNotifications(vehicles, upcoming([]), now);
    expect(mockCancel).toHaveBeenCalledTimes(1);
    expect(mockCancel).toHaveBeenCalledWith("old");
  });
});
