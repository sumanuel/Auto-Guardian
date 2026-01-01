import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";
import { AppProvider } from "./src/context/AppContext";
import { ThemeProvider } from "./src/context/ThemeContext";
import {
  getAllNotifications,
  initDatabase as initNotificationsDatabase,
  insertDefaultNotifications,
} from "./src/database/notifications";
import AppNavigator from "./src/navigation/AppNavigator";
import OnboardingScreen from "./src/screens/OnboardingScreen";
import { initDatabase as initMainDatabase } from "./src/services/database";
import { scheduleAllNotifications } from "./src/services/notificationService";

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  /**
   * Inicializa la aplicación y verifica el estado del onboarding
   */
  const initializeApp = async () => {
    try {
      // Verificar si el usuario ya completó el onboarding
      const onboardingCompleted = await AsyncStorage.getItem("onboardingCompleted");
      setShowOnboarding(!onboardingCompleted);

      // Inicializar base de datos y notificaciones
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        console.log("Permiso de notificaciones denegado");
      }
      await initMainDatabase();
      await initNotificationsDatabase();
      await insertDefaultNotifications();

      // Programar todas las notificaciones
      await scheduleAllNotifications(getAllNotifications);

      setIsReady(true);
    } catch (error) {
      console.error("Error initializing app:", error);
      setIsReady(true); // Continuar aunque haya error
    }
  };

  if (!isReady) {
    return null; // O un loading screen
  }

  // Mostrar onboarding si no se ha completado
  if (showOnboarding) {
    return (
      <ThemeProvider>
        <OnboardingScreen onComplete={() => setShowOnboarding(false)} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <AppProvider>
        <AppNavigator />
      </AppProvider>
    </ThemeProvider>
  );
}
