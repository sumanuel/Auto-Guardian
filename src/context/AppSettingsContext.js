import { logger } from "../utils/logger";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Linking, Platform } from "react-native";
import { sendImmediateNotification } from "../services/notificationService";
import {
  DEFAULT_DECIMALS,
  normalizeDecimals,
  setCurrencyDecimalsConfig,
} from "../utils/currencyConfig";
import { evaluateStoreUpdate, normalizeVersionString } from "../utils/versionUtils";

let Updates;
try {
  // expo-updates es opcional; si no está instalado, este import fallará.
  Updates = require("expo-updates");
} catch (_error) {
  Updates = null;
}

const STORAGE_KEYS = {
  currencySymbol: "@currency_symbol",
  currencyDecimals: "@currency_decimals",
  storeUpdateNotifiedVersion: "@store_update_notified_version",
};

const DEFAULT_STORE_CHECK_TIMEOUT_MS = 7000;

const getStoreUpdateConfig = () => {
  // En Expo SDK recientes, expoConfig existe en runtime.
  const extra = Constants?.expoConfig?.extra || {};
  return extra.storeUpdate || {};
};

const getCurrentAppVersion = () => {
  // Preferimos la versión del binario (app.json -> expo.version)
  return normalizeVersionString(Constants?.expoConfig?.version);
};

const withTimeout = async (promise, timeoutMs) => {
  const ms = Number.isFinite(timeoutMs)
    ? timeoutMs
    : DEFAULT_STORE_CHECK_TIMEOUT_MS;
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error("timeout")), ms);
    }),
  ]);
};

const AppSettingsContext = createContext(null);

export const AppSettingsProvider = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currencySymbol, setCurrencySymbolState] = useState(null);
  const [currencyDecimals, setCurrencyDecimalsState] =
    useState(DEFAULT_DECIMALS);
  // Permite volver a ver el onboarding desde Más aunque ya se haya completado
  const [onboardingReplay, setOnboardingReplay] = useState(false);

  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);

  const [storeUpdateAvailable, setStoreUpdateAvailable] = useState(false);
  const [storeForceUpdate, setStoreForceUpdate] = useState(false);
  const [storeLatestVersion, setStoreLatestVersion] = useState(null);
  const [storeUpdateUrl, setStoreUpdateUrl] = useState(null);
  const [isCheckingStoreUpdate, setIsCheckingStoreUpdate] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEYS.currencySymbol);
        if (saved === "$" || saved === "€") {
          setCurrencySymbolState(saved);
        }

        const savedDecimals = normalizeDecimals(
          await AsyncStorage.getItem(STORAGE_KEYS.currencyDecimals),
        );
        if (savedDecimals !== null) {
          setCurrencyDecimalsConfig(savedDecimals);
          setCurrencyDecimalsState(savedDecimals);
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      } finally {
        setIsLoaded(true);
      }
    };

    load();
  }, []);

  const setCurrencySymbol = useCallback(async (symbol) => {
    if (symbol !== "$" && symbol !== "€") return;

    try {
      setCurrencySymbolState(symbol);
      await AsyncStorage.setItem(STORAGE_KEYS.currencySymbol, symbol);
    } catch (error) {
      console.error("Error saving currency symbol:", error);
    }
  }, []);

  const setCurrencyDecimals = useCallback(async (decimals) => {
    const normalized = normalizeDecimals(decimals);
    if (normalized === null) return;

    try {
      // La configuración global debe cambiar antes del re-render
      setCurrencyDecimalsConfig(normalized);
      setCurrencyDecimalsState(normalized);
      await AsyncStorage.setItem(
        STORAGE_KEYS.currencyDecimals,
        String(normalized),
      );
    } catch (error) {
      console.error("Error saving currency decimals:", error);
    }
  }, []);

  const notifyStoreUpdateIfNeeded = useCallback(async (latestVersion, url) => {
    const normalizedVersion = normalizeVersionString(latestVersion);
    if (!normalizedVersion) return;

    try {
      const lastNotifiedVersion = await AsyncStorage.getItem(
        STORAGE_KEYS.storeUpdateNotifiedVersion,
      );
      if (lastNotifiedVersion === normalizedVersion) {
        return;
      }

      await sendImmediateNotification(
        "Nueva versión disponible",
        `Auto-Guardian ${normalizedVersion} ya está disponible para actualizar.`,
        {
          type: "store-update",
          version: normalizedVersion,
          url: normalizeVersionString(url) || null,
        },
      );

      await AsyncStorage.setItem(
        STORAGE_KEYS.storeUpdateNotifiedVersion,
        normalizedVersion,
      );
    } catch (error) {
      logger.log(
        "No se pudo registrar la notificación de update:",
        error?.message || error,
      );
    }
  }, []);

  const checkForUpdate = useCallback(async () => {
    // Solo detecta actualizaciones OTA (expo-updates), no updates de Play Store/App Store.
    if (__DEV__) return;
    if (!Updates?.checkForUpdateAsync) return;

    try {
      setIsCheckingUpdate(true);
      const result = await Updates.checkForUpdateAsync();
      setUpdateAvailable(Boolean(result?.isAvailable));
    } catch (error) {
      // En algunos entornos puede fallar; no debe romper la app.
      logger.log("Update check skipped:", error?.message || error);
    } finally {
      setIsCheckingUpdate(false);
    }
  }, []);

  const checkForStoreUpdate = useCallback(async () => {
    // Para Play Store necesitamos una fuente remota (endpoint JSON) controlada por nosotros.
    // Evitamos scraping del HTML de Play Store por ser frágil.
    const config = getStoreUpdateConfig();
    const versionCheckUrl = normalizeVersionString(config.versionCheckUrl);
    const allowDevChecks = Boolean(config.allowDevChecks);

    if (__DEV__ && !allowDevChecks) return;
    if (!versionCheckUrl) return;

    const currentVersion = getCurrentAppVersion();
    if (!currentVersion) return;

    try {
      setIsCheckingStoreUpdate(true);
      const joiner = versionCheckUrl.includes("?") ? "&" : "?";
      const cacheBustedUrl = `${versionCheckUrl}${joiner}t=${Date.now()}`;
      const response = await withTimeout(
        fetch(cacheBustedUrl, {
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        }),
        config.timeoutMs,
      );
      if (!response?.ok) {
        throw new Error(`http_${response?.status || "error"}`);
      }
      const data = await response.json();

      const info = evaluateStoreUpdate(data, currentVersion);

      setStoreLatestVersion(info.latestVersion);
      setStoreUpdateUrl(info.url);
      setStoreUpdateAvailable(info.updateAvailable);
      setStoreForceUpdate(info.forceUpdate);

      if (info.updateAvailable && info.latestVersion) {
        await notifyStoreUpdateIfNeeded(info.latestVersion, info.url);
      }
    } catch (error) {
      // No debe romper la app.
      logger.log("Store update check skipped:", error?.message || error);
    } finally {
      setIsCheckingStoreUpdate(false);
    }
  }, [notifyStoreUpdateIfNeeded]);

  const openStoreUpdate = useCallback(async () => {
    const config = getStoreUpdateConfig();

    const pkgFromConfig = normalizeVersionString(config.androidPackage);
    const pkgFromAppJson = normalizeVersionString(
      Constants?.expoConfig?.android?.package,
    );
    const androidPackage = pkgFromConfig || pkgFromAppJson;

    const preferredUrl = normalizeVersionString(storeUpdateUrl);
    const marketUrl = androidPackage
      ? `market://details?id=${androidPackage}`
      : null;
    const httpsUrl = androidPackage
      ? `https://play.google.com/store/apps/details?id=${androidPackage}`
      : null;

    const urlToTry =
      preferredUrl ||
      (Platform.OS === "android" ? marketUrl : httpsUrl) ||
      httpsUrl;
    if (!urlToTry) return;

    try {
      const can = await Linking.canOpenURL(urlToTry);
      if (can) {
        await Linking.openURL(urlToTry);
        return;
      }
    } catch (_error) {
      // fallback abajo
    }

    // Fallback a https si el esquema market:// no está disponible
    if (httpsUrl) {
      try {
        await Linking.openURL(httpsUrl);
      } catch (error) {
        logger.log("No se pudo abrir Play Store:", error?.message || error);
      }
    }
  }, [storeUpdateUrl]);

  const applyUpdate = useCallback(async () => {
    if (!Updates?.fetchUpdateAsync || !Updates?.reloadAsync) return;

    try {
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
    } catch (error) {
      logger.log(
        "No se pudo aplicar la actualización:",
        error?.message || error,
      );
    }
  }, []);

  const value = useMemo(
    () => ({
      isLoaded,
      currencySymbol,
      setCurrencySymbol,
      currencyDecimals,
      setCurrencyDecimals,
      onboardingReplay,
      setOnboardingReplay,
      updateAvailable,
      isCheckingUpdate,
      checkForUpdate,
      applyUpdate,
      storeUpdateAvailable,
      storeForceUpdate,
      storeLatestVersion,
      isCheckingStoreUpdate,
      checkForStoreUpdate,
      openStoreUpdate,
    }),
    [
      isLoaded,
      currencySymbol,
      setCurrencySymbol,
      currencyDecimals,
      setCurrencyDecimals,
      onboardingReplay,
      setOnboardingReplay,
      updateAvailable,
      isCheckingUpdate,
      checkForUpdate,
      applyUpdate,
      storeUpdateAvailable,
      storeForceUpdate,
      storeLatestVersion,
      isCheckingStoreUpdate,
      checkForStoreUpdate,
      openStoreUpdate,
    ],
  );

  return (
    <AppSettingsContext.Provider value={value}>
      {children}
    </AppSettingsContext.Provider>
  );
};

export const useAppSettings = () => {
  const ctx = useContext(AppSettingsContext);
  if (!ctx) {
    throw new Error(
      "useAppSettings debe ser usado dentro de AppSettingsProvider",
    );
  }
  return ctx;
};
