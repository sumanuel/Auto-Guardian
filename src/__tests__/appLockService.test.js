jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);
const mockAuth = {
  hasHardwareAsync: jest.fn(),
  isEnrolledAsync: jest.fn(),
  getEnrolledLevelAsync: jest.fn(),
  authenticateAsync: jest.fn(),
  SecurityLevel: { NONE: 0, SECRET: 1, BIOMETRIC_WEAK: 2 },
};
jest.mock("expo-local-authentication", () => ({
  hasHardwareAsync: (...a) => mockAuth.hasHardwareAsync(...a),
  isEnrolledAsync: (...a) => mockAuth.isEnrolledAsync(...a),
  getEnrolledLevelAsync: (...a) => mockAuth.getEnrolledLevelAsync(...a),
  authenticateAsync: (...a) => mockAuth.authenticateAsync(...a),
  SecurityLevel: { NONE: 0, SECRET: 1, BIOMETRIC_WEAK: 2 },
}));

import {
  authenticate,
  canUseLock,
  isLockEnabled,
  setLockEnabled,
} from "../services/appLockService";

beforeEach(() => jest.clearAllMocks());

describe("appLockService", () => {
  test("el bloqueo está desactivado por defecto y se puede activar", async () => {
    expect(await isLockEnabled()).toBe(false);
    await setLockEnabled(true);
    expect(await isLockEnabled()).toBe(true);
    await setLockEnabled(false);
    expect(await isLockEnabled()).toBe(false);
  });

  test("canUseLock acepta biometría o credencial del dispositivo", async () => {
    mockAuth.hasHardwareAsync.mockResolvedValue(true);
    mockAuth.isEnrolledAsync.mockResolvedValue(true);
    expect(await canUseLock()).toBe(true);

    mockAuth.isEnrolledAsync.mockResolvedValue(false);
    mockAuth.getEnrolledLevelAsync.mockResolvedValue(1);
    expect(await canUseLock()).toBe(true);

    mockAuth.getEnrolledLevelAsync.mockResolvedValue(0);
    expect(await canUseLock()).toBe(false);
  });

  test("authenticate devuelve false ante cancelación o error", async () => {
    mockAuth.authenticateAsync.mockResolvedValueOnce({ success: true });
    expect(await authenticate()).toBe(true);
    mockAuth.authenticateAsync.mockResolvedValueOnce({ success: false });
    expect(await authenticate()).toBe(false);
    mockAuth.authenticateAsync.mockRejectedValueOnce(new Error("x"));
    expect(await authenticate()).toBe(false);
  });
});
