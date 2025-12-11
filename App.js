import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import { AppProvider } from "./src/context/AppContext";
import { ThemeProvider } from "./src/context/ThemeContext";
import {
  getAllNotifications,
  initDatabase,
  insertDefaultNotifications,
} from "./src/database/notifications";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  useEffect(() => {
    const setup = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        console.log("Permiso de notificaciones denegado");
      }
      await initDatabase();
      await insertDefaultNotifications();
      // Schedule all notifications
      const allNotifications = await getAllNotifications();
      const now = new Date();
      const currentDay = now.getDay();
      for (const notif of allNotifications) {
        const [hours, minutes] = notif.time.split(":").map(Number);
        const selectedDays = notif.days.split(",");
        for (let week = 0; week < 4; week++) {
          selectedDays.forEach(async (day) => {
            const dayNum = parseInt(day);
            let targetDate = new Date(now);
            const daysDiff = (dayNum - currentDay + 7) % 7;
            targetDate.setDate(now.getDate() + daysDiff + week * 7);
            targetDate.setHours(hours, minutes, 0, 0);
            if (targetDate > now) {
              await Notifications.scheduleNotificationAsync({
                content: {
                  title: notif.title,
                  body: notif.body,
                },
                trigger: {
                  type: "date",
                  date: targetDate,
                },
              });
            }
          });
        }
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
