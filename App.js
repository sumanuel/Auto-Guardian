import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import { AppProvider } from "./src/context/AppContext";
import { ThemeProvider } from "./src/context/ThemeContext";
import {
  getAllNotifications,
  initDatabase as initNotificationsDatabase,
  insertDefaultNotifications,
} from "./src/database/notifications";
import AppNavigator from "./src/navigation/AppNavigator";
import { initDatabase as initMainDatabase } from "./src/services/database";
import { scheduleAllNotifications } from "./src/services/notificationService";

export default function App() {
  useEffect(() => {
    const setup = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        console.log("Permiso de notificaciones denegado");
      }
      await initMainDatabase();
      await initNotificationsDatabase();
      await insertDefaultNotifications();

      // Programar todas las notificaciones
      await scheduleAllNotifications(getAllNotifications);
    };
    setup();
  }, []);

  return (
    <ThemeProvider>
      <AppProvider>
        <AppNavigator />
      </AppProvider>
    </ThemeProvider>
  );
}
