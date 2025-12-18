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
    // Try to add column if not exists (for migration)
    try {
      await db.runAsync(
        "ALTER TABLE notifications ADD COLUMN isDefault INTEGER DEFAULT 0;"
      );
    } catch (error) {
      // Column already exists, ignore
    }
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
    const defaults = [
      // Lunes 9:00 AM - 2 mensajes alternativos
      {
        title: "🛡️ Prevención es seguridad",
        body: "Un mantenimiento a tiempo evita averías costosas. Recuerda tu cita de servicio esta semana.",
        days: "1", // Lunes
        time: "09:00",
      },
      {
        title: "🚗 ¿Listo para la semana?",
        body: "Tu auto también necesita un chequeo. Programa su mantenimiento para circular sin preocupaciones.",
        days: "1", // Lunes
        time: "09:00",
      },
      // Miércoles 10:00 AM - 2 mensajes alternativos
      {
        title: "✅ Chequeo rápido de medio semana",
        body: "Tómate 5 minutos para revisar: líquidos, presión de neumáticos y luces. ¡Tu auto lo agradecerá!",
        days: "3", // Miércoles
        time: "10:00",
      },
      {
        title: "📞 Hora de agendar",
        body: "Miércoles: el día perfecto para llamar al taller y programar el mantenimiento de tu vehículo.",
        days: "3", // Miércoles
        time: "10:00",
      },
      // Viernes 11:00 AM - 2 mensajes alternativos
      {
        title: "🛞 ¡Neumáticos listos para rodar!",
        body: "Antes del fin de semana, revisa la presión y el dibujo de tus ruedas. Seguridad en cada viaje.",
        days: "5", // Viernes
        time: "11:00",
      },
      {
        title: "🚦 Viaja seguro este fin de semana",
        body: "Revisión express: neumáticos, frenos y luces. 5 minutos que marcan la diferencia en la carretera.",
        days: "5", // Viernes
        time: "11:00",
      },
      // Sábado 9:00 AM - 1 mensaje
      {
        title: "🧰 Día de autocuidado (para tu auto)",
        body: "Hoy es un buen día para revisar niveles, limpiar el vehículo o programar la próxima visita al taller.",
        days: "6", // Sábado
        time: "09:00",
      },
      // Domingo 9:00 AM - 1 mensaje
      {
        title: "🗓️ Planifica tu semana sobre ruedas",
        body: '¿Tu auto necesita atención? Agrega "mantenimiento del vehículo" a tu agenda de esta semana.',
        days: "0", // Domingo
        time: "09:00",
      },
    ];

    for (const def of defaults) {
      // Check if this specific default notification already exists
      const existing = await db.getAllAsync(
        "SELECT id FROM notifications WHERE title = ? AND isDefault = 1",
        [def.title]
      );
      if (existing.length === 0) {
        await insertNotification(def.title, def.body, def.days, def.time, 1);
      }
    }
  } catch (error) {
    console.log("Error inserting defaults:", error);
  }
};
