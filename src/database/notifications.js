import { openDatabaseSync } from "expo-sqlite";

const db = openDatabaseSync("notifications.db");

export const initDatabase = async () => {
  try {
    await db.runAsync(
      `CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        days TEXT NOT NULL,
        time TEXT NOT NULL,
        isDefault INTEGER DEFAULT 0
      );`
    );
    console.log("Table created successfully");
  } catch (error) {
    console.log("Error creating table:", error);
  }
};

export const insertNotification = async (
  title,
  body,
  days,
  time,
  isDefault = 0
) => {
  try {
    const result = await db.runAsync(
      "INSERT INTO notifications (title, body, days, time, isDefault) VALUES (?, ?, ?, ?, ?)",
      [title, body, days, time, isDefault]
    );
    return result.lastInsertRowId;
  } catch (error) {
    throw error;
  }
};

export const getNotifications = async () => {
  try {
    const result = await db.getAllAsync(
      "SELECT * FROM notifications WHERE isDefault = 0"
    );
    return result;
  } catch (error) {
    throw error;
  }
};

export const deleteNotification = async (id) => {
  try {
    await db.runAsync("DELETE FROM notifications WHERE id = ?", [id]);
  } catch (error) {
    throw error;
  }
};

export const getAllNotifications = async () => {
  try {
    const result = await db.getAllAsync("SELECT * FROM notifications");
    return result;
  } catch (error) {
    throw error;
  }
};

export const insertDefaultNotifications = async () => {
  try {
    // Check if defaults already exist
    const existing = await db.getAllAsync(
      "SELECT id FROM notifications WHERE isDefault = 1"
    );
    if (existing.length === 0) {
      // Insert default notifications
      const defaults = [
        {
          title: "🔧 Recordatorio de Mantenimiento",
          body: "Es hora de revisar el mantenimiento de tu vehículo. 🛠️",
          days: "1", // Lunes
          time: "09:00",
        },
        {
          title: "📅 Chequeo Semanal",
          body: "No olvides verificar el estado de tu auto. 🚗",
          days: "3", // Miércoles
          time: "10:00",
        },
        {
          title: "🛞 Revisión de Neumáticos",
          body: "Es viernes, revisa el estado de tus neumáticos. 🔍",
          days: "5", // Viernes
          time: "11:00",
        },
      ];
      for (const def of defaults) {
        await insertNotification(def.title, def.body, def.days, def.time, 1);
      }
    }
  } catch (error) {
    console.log("Error inserting defaults:", error);
  }
};
