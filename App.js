import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import { AppProvider } from "./src/context/AppContext";
import { ThemeProvider } from "./src/context/ThemeContext";
import { initDatabase } from "./src/database/notifications";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  useEffect(() => {
    const setup = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        console.log("Permiso de notificaciones denegado");
      }
      await initDatabase();
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
