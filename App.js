import { logger } from "./src/utils/logger";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppProvider } from "./src/context/AppContext";
import {
  AppSettingsProvider,
  useAppSettings,
} from "./src/context/AppSettingsContext";
import { ThemeProvider } from "./src/context/ThemeContext";
import {
  getAllNotifications,
  initDatabase as initNotificationsDatabase,
  insertDefaultNotifications,
} from "./src/database/notifications";
import AppNavigator from "./src/navigation/AppNavigator";
import CurrencySetupScreen from "./src/screens/CurrencySetupScreen";
import LockScreen from "./src/screens/LockScreen";
import OnboardingScreen from "./src/screens/OnboardingScreen";
import {
  isLockEnabled,
  RELOCK_AFTER_MS,
} from "./src/services/appLockService";
import { runAutoBackupIfDue } from "./src/services/backup/backupService";
import { initDatabase as initMainDatabase } from "./src/services/database";
import {
  scheduleAllNotifications,
  scheduleMaintenanceDueNotifications,
} from "./src/services/notificationService";
import { getUpcomingMaintenances } from "./src/services/maintenanceService";
import { getAllVehicles } from "./src/services/vehicleService";

function AppBootstrap() {
  const [isReady, setIsReady] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [locked, setLocked] = useState(false);
  const backgroundedAt = useRef(null);
  const {
    isLoaded: settingsLoaded,
    currencySymbol,
    checkForUpdate,
    checkForStoreUpdate,
  } = useAppSettings();

  // Vuelve a bloquear si la app estuvo en segundo plano más de un minuto
  useEffect(() => {
    const subscription = AppState.addEventListener("change", async (state) => {
      if (state === "background") {
        backgroundedAt.current = Date.now();
      } else if (state === "active" && backgroundedAt.current) {
        const elapsed = Date.now() - backgroundedAt.current;
        backgroundedAt.current = null;
        if (elapsed >= RELOCK_AFTER_MS && (await isLockEnabled())) {
          setLocked(true);
        }
      }
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    // Disparar chequeo de update una vez por arranque
    checkForUpdate();
    checkForStoreUpdate();
  }, [checkForUpdate, checkForStoreUpdate]);

  /**
   * Inicializa la aplicación y verifica el estado del onboarding
   */
  const initializeApp = async () => {
    try {
      // Verificar si el usuario ya completó el onboarding
      const onboardingCompleted = await AsyncStorage.getItem(
        "onboardingCompleted",
      );
      setShowOnboarding(!onboardingCompleted);
      if (await isLockEnabled()) setLocked(true);

      // Inicializar base de datos y notificaciones
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        logger.log("Permiso de notificaciones denegado");
      }
      await initMainDatabase();
      runAutoBackupIfDue(); // en segundo plano, no bloquea el arranque
      await initNotificationsDatabase();
      await insertDefaultNotifications();

      // Programar todas las notificaciones
      await scheduleAllNotifications(getAllNotifications);
      await scheduleMaintenanceDueNotifications(
        getAllVehicles(),
        getUpcomingMaintenances,
      );

      setIsReady(true);
    } catch (error) {
      console.error("Error initializing app:", error);
      setIsReady(true); // Continuar aunque haya error
    }
  };

  useEffect(() => {
    initializeApp();
  }, []);

  if (!isReady) {
    return null; // O un loading screen
  }

  if (!settingsLoaded) {
    return null;
  }

  if (locked) {
    return <LockScreen onUnlock={() => setLocked(false)} />;
  }

  // Selección inicial de moneda (solo primera vez)
  if (!currencySymbol) {
    return <CurrencySetupScreen />;
  }

  // Mostrar onboarding si no se ha completado
  if (showOnboarding) {
    return <OnboardingScreen onComplete={() => setShowOnboarding(false)} />;
  }

  return (
    <AppProvider>
      <AppNavigator />
    </AppProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppSettingsProvider>
          <AppBootstrap />
        </AppSettingsProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
