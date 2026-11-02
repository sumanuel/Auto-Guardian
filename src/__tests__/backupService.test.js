const mockRun = jest.fn();
const mockDb = {
  getAllSync: jest.fn(),
  getFirstSync: jest.fn(() => ({ foreign_keys: 1 })),
  execSync: jest.fn(),
  runSync: mockRun,
  withTransactionSync: jest.fn((fn) => fn()),
};

jest.mock("../services/database", () => ({
  __esModule: true,
  get default() {
    return mockDb;
  },
}));
jest.mock("expo-document-picker", () => ({}));
jest.mock("expo-sharing", () => ({}));
jest.mock("expo-file-system/legacy", () => ({
  documentDirectory: "file:///docs/",
  EncodingType: { Base64: "base64" },
  readAsStringAsync: jest.fn(),
  writeAsStringAsync: jest.fn(),
  makeDirectoryAsync: jest.fn(),
}));

import * as FileSystem from "expo-file-system/legacy";
import { importDatabaseBackupFromUri } from "../services/backup/backupService";

const backup = (extra = {}) =>
  JSON.stringify({
    app: "Auto Guardian",
    tables: {
      vehicles: { rows: [{ id: 7, name: "Auto", photo: null }] },
      maintenances: { rows: [{ id: 3, vehicleId: 7, type: "Aceite" }] },
    },
    ...extra,
  });

const mockSchema = () => {
  mockDb.getAllSync.mockImplementation((sql) => {
    if (sql.includes("sqlite_master")) {
      return [{ name: "maintenances" }, { name: "vehicles" }];
    }
    if (sql.includes("table_info(\"vehicles\")")) {
      return [{ name: "id" }, { name: "name" }, { name: "photo" }];
    }
    if (sql.includes("table_info(\"maintenances\")")) {
      return [{ name: "id" }, { name: "vehicleId" }, { name: "type" }];
    }
    return [];
  });
};

beforeEach(() => {
  jest.clearAllMocks();
  mockSchema();
});

describe("importDatabaseBackupFromUri", () => {
  test("conserva los id originales y usa transacción", async () => {
    FileSystem.readAsStringAsync.mockResolvedValue(backup());
    await importDatabaseBackupFromUri("file:///b.json");

    expect(mockDb.withTransactionSync).toHaveBeenCalledTimes(1);
    const inserts = mockRun.mock.calls.filter(([sql]) =>
      sql.startsWith("INSERT"),
    );
    expect(inserts[0][0]).toContain('"id"');
    expect(inserts.map(([, v]) => v[0])).toEqual([7, 3]); // vehicles antes que maintenances
  });

  test("rechaza archivos que no son de Auto Guardian sin tocar la base", async () => {
    FileSystem.readAsStringAsync.mockResolvedValue(
      JSON.stringify({ app: "Otra", tables: {} }),
    );
    await expect(importDatabaseBackupFromUri("x")).rejects.toThrow(
      /respaldo válido/,
    );
    expect(mockDb.withTransactionSync).not.toHaveBeenCalled();
  });

  test("valida la estructura antes de borrar", async () => {
    FileSystem.readAsStringAsync.mockResolvedValue(
      JSON.stringify({
        app: "Auto Guardian",
        tables: { vehicles: { rows: "mal" } },
      }),
    );
    await expect(importDatabaseBackupFromUri("x")).rejects.toThrow(
      /inválidos/,
    );
    expect(mockRun).not.toHaveBeenCalled();
  });
});
