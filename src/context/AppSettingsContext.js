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

let Updates;
try {
  // expo-updates es opcional; si no está instalado, este import fallará.
  // eslint-disable-next-line global-require
  Updates = require("expo-updates");
} catch (_error) {
  Updates = null;
}

const STORAGE_KEYS = {
  currencySymbol: "@currency_symbol",
};

const DEFAULT_STORE_CHECK_TIMEOUT_MS = 7000;

const normalizeVersionString = (value) => {
  if (value === null || value === undefined) return "";
  return String(value).trim();
};

const parseVersionParts = (versionString) => {
  // Soporta: 1.2.3 | 0.1.1.260131 | 1.2.3-beta (ignora sufijos)
  const v = normalizeVersionString(versionString);
  if (!v) return [];

  const main = v.split("-")[0];
  return main.split(".").map((part) => {
    const numeric = String(part).replace(/[^0-9]/g, "");
    if (!numeric) return 0;
    const n = Number.parseInt(numeric, 10);
    return Number.isFinite(n) ? n : 0;
  });
};

const compareVersions = (a, b) => {
  const pa = parseVersionParts(a);
  const pb = parseVersionParts(b);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i += 1) {
    const va = pa[i] ?? 0;
    const vb = pb[i] ?? 0;
    if (va > vb) return 1;
    if (va < vb) return -1;
  }
  return 0;
};

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

  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);

  const [storeUpdateAvailable, setStoreUpdateAvailable] = useState(false);
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
      console.log("Update check skipped:", error?.message || error);
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

      const latest = normalizeVersionString(data?.latestVersion);
      const url = normalizeVersionString(data?.url);

      if (!latest) {
        setStoreUpdateAvailable(false);
        setStoreLatestVersion(null);
        setStoreUpdateUrl(null);
        return;
      }

      setStoreLatestVersion(latest);
      setStoreUpdateUrl(url || null);

      const isNewer = compareVersions(latest, currentVersion) > 0;
      setStoreUpdateAvailable(Boolean(isNewer));
    } catch (error) {
      // No debe romper la app.
      console.log("Store update check skipped:", error?.message || error);
    } finally {
      setIsCheckingStoreUpdate(false);
    }
  }, []);

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
        console.log("No se pudo abrir Play Store:", error?.message || error);
      }
    }
  }, [storeUpdateUrl]);

  const applyUpdate = useCallback(async () => {
    if (!Updates?.fetchUpdateAsync || !Updates?.reloadAsync) return;

    try {
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
    } catch (error) {
      console.log(
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
      updateAvailable,
      isCheckingUpdate,
      checkForUpdate,
      applyUpdate,
      storeUpdateAvailable,
      storeLatestVersion,
      isCheckingStoreUpdate,
      checkForStoreUpdate,
      openStoreUpdate,
    }),
    [
      isLoaded,
      currencySymbol,
      setCurrencySymbol,
      updateAvailable,
      isCheckingUpdate,
      checkForUpdate,
      applyUpdate,
      storeUpdateAvailable,
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
