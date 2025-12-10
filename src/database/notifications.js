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
        time TEXT NOT NULL
      );`
    );
    console.log("Table created successfully");
  } catch (error) {
    console.log("Error creating table:", error);
  }
};

export const insertNotification = async (title, body, days, time) => {
  try {
    const result = await db.runAsync(
      "INSERT INTO notifications (title, body, days, time) VALUES (?, ?, ?, ?)",
      [title, body, days, time]
    );
    return result.lastInsertRowId;
  } catch (error) {
    throw error;
  }
};

export const getNotifications = async () => {
  try {
    const result = await db.getAllAsync("SELECT * FROM notifications");
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

export default db;
