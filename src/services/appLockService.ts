import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from "expo-local-authentication";

const LOCK_ENABLED_KEY = "appLockEnabled";

// Tiempo en segundo plano tras el cual se vuelve a pedir autenticación
export const RELOCK_AFTER_MS = 60 * 1000;

export const isLockEnabled = async (): Promise<boolean> => {
  try {
    return (await AsyncStorage.getItem(LOCK_ENABLED_KEY)) === "true";
  } catch {
    return false;
  }
};

export const setLockEnabled = async (enabled: boolean): Promise<void> => {
  await AsyncStorage.setItem(LOCK_ENABLED_KEY, enabled ? "true" : "false");
};

// Hay biometría o credencial del dispositivo (PIN, patrón) configurada
export const canUseLock = async (): Promise<boolean> => {
  try {
    const [hasHardware, isEnrolled] = await Promise.all([
      LocalAuthentication.hasHardwareAsync(),
      LocalAuthentication.isEnrolledAsync(),
    ]);
    if (hasHardware && isEnrolled) return true;
    // Sin biometría, el PIN/patrón del dispositivo sirve como alternativa
    const level = await LocalAuthentication.getEnrolledLevelAsync();
    return level !== LocalAuthentication.SecurityLevel.NONE;
  } catch {
    return false;
  }
};

export const authenticate = async (
  promptMessage = "Desbloquear Auto Guardian",
): Promise<boolean> => {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      cancelLabel: "Cancelar",
      // Permite el PIN/patrón del dispositivo si falla la biometría
      disableDeviceFallback: false,
    });
    return result.success;
  } catch {
    return false;
  }
};
