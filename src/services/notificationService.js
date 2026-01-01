import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Configurar comportamiento de notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Solicitar permisos de notificaciones
export const requestNotificationPermissions = async () => {
  try {
    // Verificar si estamos en Expo Go (desarrollo)
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("ℹ️ Permisos de notificación denegados");
      return false;
    }

    // Configurar canal de notificación en Android (solo en builds)
    if (Platform.OS === "android") {
      try {
        await Notifications.setNotificationChannelAsync("maintenance-alerts", {
          name: "Alertas de Mantenimiento",
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF6B00",
        });
      } catch (channelError) {
        // No hay problema si falla en Expo Go
      }
    }

    return true;
  } catch (error) {
    console.error("Error solicitando permisos:", error);
    return false;
  }
};

// Enviar notificación inmediata
export const sendImmediateNotification = async (title, body, data = {}) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // Inmediato
    });
  } catch (error) {
    console.error("Error enviando notificación:", error);
  }
};

// Programar notificaciones semanales de alertas (lunes y miércoles 9 AM)
export const scheduleAlertNotifications = async (getAlertSummary) => {
  try {
    // No cancelar todas las notificaciones, solo reprogramar las de alertas
    // Primero obtener las notificaciones programadas existentes
    const existingNotifications =
      await Notifications.getAllScheduledNotificationsAsync();

    // Cancelar solo las notificaciones de alertas existentes
    const alertNotifications = existingNotifications.filter(
      (notif) => notif.content.data?.type === "alert-summary"
    );

    for (const notif of alertNotifications) {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }

    // Obtener resumen de alertas actual
    const alertSummary = await getAlertSummary();

    // Solo programar si hay alertas
    if (
      alertSummary &&
      (alertSummary.totalOverdue > 0 ||
        alertSummary.totalUrgent > 0 ||
        (alertSummary.totalDocuments || 0) > 0)
    ) {
      const now = new Date();
      const currentDay = now.getDay(); // 0 = Domingo, 1 = Lunes, etc.

      // Días a programar: 1 (Lunes) y 3 (Miércoles)
      const alertDays = [1, 3];

      for (const dayNum of alertDays) {
        // Calcular la próxima fecha para este día
        let targetDate = new Date(now);
        const daysDiff = (dayNum - currentDay + 7) % 7;

        if (daysDiff === 0 && now.getHours() >= 9) {
          // Si es hoy y ya pasaron las 9 AM, programar para la próxima semana
          targetDate.setDate(now.getDate() + 7);
        } else {
          targetDate.setDate(now.getDate() + daysDiff);
        }

        targetDate.setHours(9, 0, 0, 0);

        // Crear mensaje de notificación basado en las alertas
        let title = "🚨 Alertas de Auto Guardian";
        let body = "Tienes mantenimientos y documentos que requieren atención.";

        const totalAlerts =
          (alertSummary.totalOverdue || 0) +
          (alertSummary.totalUrgent || 0) +
          (alertSummary.totalDocuments || 0);
        if (totalAlerts > 0) {
          body = `Tienes ${totalAlerts} alerta${
            totalAlerts > 1 ? "s" : ""
          } pendiente${totalAlerts > 1 ? "s" : ""} en Auto Guardian.`;
        }

        await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            data: {
              type: "alert-summary",
              alertSummary: alertSummary,
            },
            sound: true,
            priority: Notifications.AndroidNotificationPriority.HIGH,
          },
          trigger: {
            type: "weekly",
            weekday: dayNum === 0 ? 1 : dayNum + 1, // Convertir a formato Expo (1=Domingo, 2=Lunes, etc.)
            hour: 9,
            minute: 0,
            repeats: true,
          },
        });
      }

      console.log(
        "✅ Notificaciones de alertas programadas para lunes y miércoles"
      );
    } else {
      console.log(
        "ℹ️ No hay alertas pendientes, no se programan notificaciones"
      );
    }
  } catch (error) {
    console.error("Error programando notificaciones de alertas:", error);
  }
};

// Verificar mantenimientos pendientes y enviar alertas
export const checkAndNotifyPendingMaintenances = async (
  vehicles,
  getUpcomingMaintenances
) => {
  try {
    let totalOverdue = 0;
    let totalUrgent = 0;
    const alerts = [];

    for (const vehicle of vehicles) {
      const upcomingMaintenances = getUpcomingMaintenances(
        vehicle.id,
        vehicle.currentKm
      );

      for (const maintenance of upcomingMaintenances) {
        const now = new Date();

        // Verificar por kilometraje
        if (maintenance.nextServiceKm && vehicle.currentKm) {
          const kmRemaining = maintenance.nextServiceKm - vehicle.currentKm;

          if (kmRemaining <= 0) {
            totalOverdue++;
            alerts.push({
              type: "overdue",
              vehicle: vehicle.name,
              maintenance: maintenance.type,
              reason: `Vencido por ${Math.abs(kmRemaining)} km`,
            });
          } else if (kmRemaining <= 500) {
            totalUrgent++;
            alerts.push({
              type: "urgent",
              vehicle: vehicle.name,
              maintenance: maintenance.type,
              reason: `Solo ${kmRemaining} km restantes`,
            });
          }
        }

        // Verificar por fecha
        if (maintenance.nextServiceDate) {
          const daysRemaining = Math.floor(
            (new Date(maintenance.nextServiceDate) - now) /
              (1000 * 60 * 60 * 24)
          );

          if (daysRemaining < 0) {
            totalOverdue++;
            alerts.push({
              type: "overdue",
              vehicle: vehicle.name,
              maintenance: maintenance.type,
              reason: `Vencido hace ${Math.abs(daysRemaining)} días`,
            });
          } else if (daysRemaining === 0) {
            totalUrgent++;
            alerts.push({
              type: "urgent",
              vehicle: vehicle.name,
              maintenance: maintenance.type,
              reason: "¡Hoy es el día!",
            });
          } else if (daysRemaining <= 3) {
            totalUrgent++;
            alerts.push({
              type: "urgent",
              vehicle: vehicle.name,
              maintenance: maintenance.type,
              reason: `Solo ${daysRemaining} días`,
            });
          }
        }
      }
    }

    // Enviar notificaciones si hay alertas
    if (totalOverdue > 0) {
      await sendImmediateNotification(
        "🚨 Mantenimientos Vencidos",
        `Tienes ${totalOverdue} mantenimiento${
          totalOverdue > 1 ? "s" : ""
        } vencido${totalOverdue > 1 ? "s" : ""}. ¡Atención urgente requerida!`,
        { type: "overdue", count: totalOverdue }
      );
    } else if (totalUrgent > 0) {
      await sendImmediateNotification(
        "⚠️ Mantenimientos Urgentes",
        `Tienes ${totalUrgent} mantenimiento${
          totalUrgent > 1 ? "s" : ""
        } próximo${totalUrgent > 1 ? "s" : ""}. Programa tu cita pronto.`,
        { type: "urgent", count: totalUrgent }
      );
    }

    return {
      totalOverdue,
      totalUrgent,
      alerts,
    };
  } catch (error) {
    console.error("Error verificando mantenimientos:", error);
    return { totalOverdue: 0, totalUrgent: 0, alerts: [] };
  }
};

// Actualizar badge del icono de la app
export const updateBadgeCount = async (count) => {
  try {
    // Verificar si las notificaciones están disponibles
    const permissions = await Notifications.getPermissionsAsync();

    if (permissions.granted) {
      await Notifications.setBadgeCountAsync(count);

      // Verificar que se aplicó correctamente
      const currentBadge = await Notifications.getBadgeCountAsync();

      if (currentBadge !== count) {
        // Esto es normal en Expo Go
      }
    } else {
      console.warn("Permisos de notificación no otorgados");
    }
  } catch (error) {
    console.error("Error actualizando badge:", error);
  }
};

// Limpiar badge del icono
export const clearBadge = async () => {
  try {
    await Notifications.setBadgeCountAsync(0);
    console.log("✅ Badge limpiado");
  } catch (error) {
    console.error("Error limpiando badge:", error);
  }
};

// Cancelar todas las notificaciones
export const cancelAllNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log("✅ Todas las notificaciones canceladas");
  } catch (error) {
    console.error("Error cancelando notificaciones:", error);
  }
};

// Programar todas las notificaciones activas
export const scheduleAllNotifications = async (getAllNotifications) => {
  try {
    // Cancelar todas las notificaciones programadas anteriores
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Obtener todas las notificaciones
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

    console.log("✅ Todas las notificaciones reprogramadas");
  } catch (error) {
    console.error("Error programando notificaciones:", error);
  }
};
