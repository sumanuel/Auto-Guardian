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
      // Schedule all notifications with random selection for same day/time
      const allNotifications = await getAllNotifications();

      // Group notifications by day and time
      const groupedNotifications = {};
      for (const notif of allNotifications) {
        const key = `${notif.days}_${notif.time}`;
        if (!groupedNotifications[key]) {
          groupedNotifications[key] = [];
        }
        groupedNotifications[key].push(notif);
      }

      // Schedule one random notification per group, weekly recurring
      for (const [key, notifications] of Object.entries(groupedNotifications)) {
        const randomNotification =
          notifications[Math.floor(Math.random() * notifications.length)];
        const [hours, minutes] = randomNotification.time.split(":").map(Number);
        const selectedDays = randomNotification.days.split(",");

        selectedDays.forEach(async (day) => {
          const dayNum = parseInt(day);
          // Convert day number to Expo weekday (1 = Sunday, 2 = Monday, etc.)
          const expoWeekday = dayNum === 0 ? 1 : dayNum + 1;

          await Notifications.scheduleNotificationAsync({
            content: {
              title: randomNotification.title,
              body: randomNotification.body,
            },
            trigger: {
              type: "weekly",
              weekday: expoWeekday,
              hour: hours,
              minute: minutes,
              repeats: true,
            },
          });
        });
      }
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
