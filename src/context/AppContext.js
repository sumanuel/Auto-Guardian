import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";
import * as contactService from "../services/contactService";
import { initDatabase } from "../services/database";
import * as maintenanceService from "../services/maintenanceService";
import * as notificationService from "../services/notificationService";
import * as vehicleService from "../services/vehicleService";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [vehicles, setVehicles] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      initDatabase();
      await loadVehicles();
      await loadContacts();

      // Inicializar notificaciones (solo funciona en build, no en Expo Go)
      try {
        const permissionsGranted =
          await notificationService.requestNotificationPermissions();
        setNotificationsEnabled(permissionsGranted);

        if (permissionsGranted) {
          // Programar notificación diaria
          await notificationService.scheduleDailyNotification();

          // Verificar mantenimientos pendientes al abrir la app
          setTimeout(async () => {
            const allVehicles = vehicleService.getAllVehicles();
            await notificationService.checkAndNotifyPendingMaintenances(
              allVehicles,
              getUpcomingMaintenances
            );
          }, 2000); // Esperar 2 segundos para no interferir con la carga inicial
        }
      } catch (notifError) {
        console.log(
          "⚠️ Notificaciones no disponibles en Expo Go. Funcionarán en build de producción."
        );
        setNotificationsEnabled(false);
      }
    } catch (error) {
      console.error("Error inicializando app:", error);
    } finally {
      setLoading(false);
    }
  };

  // Funciones de vehículos
  const loadVehicles = async () => {
    try {
      const allVehicles = vehicleService.getAllVehicles();
      setVehicles(allVehicles);
      // Actualizar badge después de cargar vehículos
      await updateAppBadge(allVehicles);
    } catch (error) {
      console.error("Error cargando vehículos:", error);
    }
  };

  const addVehicle = async (vehicleData) => {
    try {
      const id = vehicleService.createVehicle(vehicleData);
      await loadVehicles();
      return id;
    } catch (error) {
      console.error("Error agregando vehículo:", error);
      throw error;
    }
  };

  const updateVehicle = async (id, vehicleData) => {
    try {
      await vehicleService.updateVehicle(id, vehicleData);
      await loadVehicles();
      if (selectedVehicle?.id === id) {
        setSelectedVehicle(vehicleService.getVehicleById(id));
      }
    } catch (error) {
      console.error("Error actualizando vehículo:", error);
      throw error;
    }
  };

  const removeVehicle = async (id) => {
    try {
      await vehicleService.deleteVehicle(id);
      await loadVehicles();
      if (selectedVehicle?.id === id) {
        setSelectedVehicle(null);
      }
    } catch (error) {
      console.error("Error eliminando vehículo:", error);
      throw error;
    }
  };

  const updateVehicleKilometers = async (id, km) => {
    try {
      await vehicleService.updateVehicleKm(id, km);
      await loadVehicles(); // Esto actualizará el badge
      if (selectedVehicle?.id === id) {
        setSelectedVehicle(vehicleService.getVehicleById(id));
      }
    } catch (error) {
      console.error("Error actualizando kilometraje:", error);
      throw error;
    }
  };

  // Funciones de contactos
  const loadContacts = async () => {
    try {
      // Migrar contactos desde AsyncStorage a SQLite si existen
      const storedContacts = await AsyncStorage.getItem("contacts");
      if (storedContacts) {
        const contactsData = JSON.parse(storedContacts);
        if (contactsData.length > 0) {
          console.log("Migrando contactos desde AsyncStorage a SQLite...");
          contactsData.forEach((contact) => {
            try {
              contactService.createContact({
                name: contact.name,
                phone: contact.phone,
                email: contact.email,
                notes: contact.notes,
              });
            } catch (error) {
              console.error("Error migrando contacto:", contact.name, error);
            }
          });
          // Limpiar AsyncStorage después de la migración
          await AsyncStorage.removeItem("contacts");
          console.log("Migración de contactos completada");
        }
      }

      // Cargar contactos desde SQLite
      const contactsFromDB = contactService.getAllContacts();
      setContacts(contactsFromDB);
    } catch (error) {
      console.error("Error cargando contactos:", error);
    }
  };

  const addContact = async (contactData) => {
    try {
      const newContactId = contactService.createContact(contactData);
      const newContact = {
        id: newContactId,
        ...contactData,
      };
      const updatedContacts = [...contacts, newContact];
      setContacts(updatedContacts);
      return newContact.id;
    } catch (error) {
      console.error("Error agregando contacto:", error);
      throw error;
    }
  };

  const updateContact = async (id, contactData) => {
    try {
      contactService.updateContact(id, contactData);
      const updatedContacts = contacts.map((contact) =>
        contact.id === id ? { ...contact, ...contactData } : contact
      );
      setContacts(updatedContacts);
    } catch (error) {
      console.error("Error actualizando contacto:", error);
      throw error;
    }
  };

  const removeContact = async (id) => {
    try {
      contactService.deleteContact(id);
      const updatedContacts = contacts.filter((contact) => contact.id !== id);
      setContacts(updatedContacts);
    } catch (error) {
      console.error("Error eliminando contacto:", error);
      throw error;
    }
  };

  // Funciones de mantenimiento
  const getVehicleMaintenances = (vehicleId) => {
    return maintenanceService.getMaintenancesByVehicle(vehicleId);
  };

  const getAllMaintenances = () => {
    // Obtener todos los mantenimientos de todos los vehículos
    const allMaintenances = [];
    vehicles.forEach((vehicle) => {
      const maintenances = maintenanceService.getMaintenancesByVehicle(
        vehicle.id
      );
      maintenances.forEach((maintenance) => {
        allMaintenances.push({
          ...maintenance,
          vehicleName: vehicle.name,
        });
      });
    });
    // Ordenar por fecha descendente (más reciente primero)
    return allMaintenances.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const getRecentMaintenances = (vehicleId, limit) => {
    return maintenanceService.getRecentMaintenances(vehicleId, limit);
  };

  const addMaintenance = async (maintenanceData) => {
    try {
      const id = maintenanceService.createMaintenance(maintenanceData);
      await loadVehicles(); // Esto actualizará el badge
      return id;
    } catch (error) {
      console.error("Error agregando mantenimiento:", error);
      throw error;
    }
  };
  const updateMaintenance = async (id, maintenanceData) => {
    try {
      await maintenanceService.updateMaintenance(id, maintenanceData);
      await loadVehicles(); // Esto actualizará el badge
    } catch (error) {
      console.error("Error actualizando mantenimiento:", error);
      throw error;
    }
  };

  const removeMaintenance = async (id) => {
    try {
      await maintenanceService.deleteMaintenance(id);
      await loadVehicles(); // Esto actualizará el badge
    } catch (error) {
      console.error("Error eliminando mantenimiento:", error);
      throw error;
    }
  };

  const getMaintenanceTypes = () => {
    return maintenanceService.getMaintenanceTypes();
  };

  const getUpcomingMaintenances = (vehicleId, currentKm) => {
    return maintenanceService.getUpcomingMaintenances(vehicleId, currentKm);
  };

  const getMaintenanceStats = (vehicleId) => {
    return maintenanceService.getMaintenanceStats(vehicleId);
  };

  // Función para actualizar el badge del icono de la app
  const updateAppBadge = async (vehiclesList = vehicles) => {
    try {
      let totalAlerts = 0;

      for (const vehicle of vehiclesList) {
        const upcomingMaintenances = getUpcomingMaintenances(
          vehicle.id,
          vehicle.currentKm
        );

        for (const maintenance of upcomingMaintenances) {
          const now = new Date();
          let isAlert = false;

          // Verificar por kilometraje
          if (maintenance.nextServiceKm && vehicle.currentKm) {
            const kmRemaining = maintenance.nextServiceKm - vehicle.currentKm;
            if (kmRemaining <= 500) {
              isAlert = true;
            }
          }

          // Verificar por fecha
          if (maintenance.nextServiceDate && !isAlert) {
            const nextDate = new Date(
              maintenance.nextServiceDate.split("T")[0]
            );
            const today = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate()
            );
            const daysRemaining = Math.floor(
              (nextDate - today) / (1000 * 60 * 60 * 24)
            );

            if (daysRemaining <= 3) {
              isAlert = true;
            }
          }

          if (isAlert) {
            totalAlerts++;
          }
        }
      }

      // Actualizar badge con el número de alertas
      await notificationService.updateBadgeCount(totalAlerts);
    } catch (error) {
      console.error("Error actualizando badge:", error);
    }
  };

  // Funciones de notificaciones
  const checkPendingMaintenances = async () => {
    // Analizar alertas sin enviar notificaciones (funciona en Expo Go)
    try {
      let totalOverdue = 0;
      let totalUrgent = 0;
      const alerts = [];
      const processedMaintenances = new Set();

      for (const vehicle of vehicles) {
        const upcomingMaintenances = getUpcomingMaintenances(
          vehicle.id,
          vehicle.currentKm
        );

        for (const maintenance of upcomingMaintenances) {
          const maintenanceKey = `${vehicle.id}-${maintenance.id}`;

          // Evitar procesar el mismo mantenimiento dos veces
          if (processedMaintenances.has(maintenanceKey)) {
            continue;
          }
          processedMaintenances.add(maintenanceKey);

          const now = new Date();
          let isOverdue = false;
          let isUrgent = false;
          let reason = "";

          // Verificar por kilometraje
          if (maintenance.nextServiceKm && vehicle.currentKm) {
            const kmRemaining = maintenance.nextServiceKm - vehicle.currentKm;

            if (kmRemaining <= 0) {
              isOverdue = true;
              reason = `Vencido por ${Math.abs(kmRemaining)} km`;
            } else if (kmRemaining <= 500) {
              isUrgent = true;
              reason = `Solo ${kmRemaining} km restantes`;
            }
          }

          // Verificar por fecha (prioridad si es más urgente)
          if (maintenance.nextServiceDate) {
            // Parsear la fecha correctamente (solo la parte de la fecha, sin hora)
            const nextDate = new Date(
              maintenance.nextServiceDate.split("T")[0]
            );
            const today = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate()
            );
            const daysRemaining = Math.floor(
              (nextDate - today) / (1000 * 60 * 60 * 24)
            );

            if (daysRemaining < 0) {
              isOverdue = true;
              reason = `Vencido hace ${Math.abs(daysRemaining)} días`;
            } else if (daysRemaining === 0) {
              isUrgent = true;
              reason = "¡Hoy es el día!";
            } else if (daysRemaining <= 3 && !isOverdue && !isUrgent) {
              isUrgent = true;
              reason = `Solo ${daysRemaining} día${
                daysRemaining !== 1 ? "s" : ""
              }`;
            }
          }

          // Agregar alerta si corresponde
          if (isOverdue) {
            totalOverdue++;
            alerts.push({
              type: "overdue",
              vehicle: vehicle.name,
              maintenance: maintenance.type,
              reason,
            });
          } else if (isUrgent) {
            totalUrgent++;
            alerts.push({
              type: "urgent",
              vehicle: vehicle.name,
              maintenance: maintenance.type,
              reason,
            });
          }
        }
      }

      // Solo enviar notificaciones si están habilitadas
      if (notificationsEnabled && (totalOverdue > 0 || totalUrgent > 0)) {
        await notificationService.checkAndNotifyPendingMaintenances(
          vehicles,
          getUpcomingMaintenances
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

  const value = {
    vehicles,
    contacts,
    selectedVehicle,
    setSelectedVehicle,
    loading,
    notificationsEnabled,
    // Vehicle functions
    loadVehicles,
    addVehicle,
    updateVehicle,
    removeVehicle,
    updateVehicleKilometers,
    // Contact functions
    loadContacts,
    addContact,
    updateContact,
    removeContact,
    // Maintenance functions
    getVehicleMaintenances,
    getAllMaintenances,
    getRecentMaintenances,
    addMaintenance,
    updateMaintenance,
    removeMaintenance,
    getMaintenanceTypes,
    getUpcomingMaintenances,
    getMaintenanceStats,
    // Notification functions
    checkPendingMaintenances,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp debe ser usado dentro de AppProvider");
  }
  return context;
};
