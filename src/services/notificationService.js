import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Configurar comportamiento de notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
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

// Programar notificación diaria
export const scheduleDailyNotification = async () => {
  try {
    // Cancelar notificaciones programadas anteriores
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Programar notificación diaria a las 9:00 AM
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🚗 Auto Guardian",
        body: "Revisa el estado de tus vehículos",
        data: { type: "daily-reminder" },
        sound: true,
      },
      trigger: {
        hour: 9,
        minute: 0,
        repeats: true,
      },
    });

    console.log("✅ Notificación diaria programada");
  } catch (error) {
    console.error("Error programando notificación diaria:", error);
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

// Obtener notificaciones programadas
export const getScheduledNotifications = async () => {
  try {
    const notifications =
      await Notifications.getAllScheduledNotificationsAsync();
    return notifications;
  } catch (error) {
    console.error("Error obteniendo notificaciones programadas:", error);
    return [];
  }
};
