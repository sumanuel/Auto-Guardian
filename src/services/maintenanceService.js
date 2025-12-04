import db from "./database";

// Obtener todos los mantenimientos de un vehículo
export const getMaintenancesByVehicle = (vehicleId) => {
  try {
    const maintenances = db.getAllSync(
      "SELECT * FROM maintenances WHERE vehicleId = ? ORDER BY date DESC",
      [vehicleId]
    );
    return maintenances;
  } catch (error) {
    console.error("Error obteniendo mantenimientos:", error);
    return [];
  }
};

// Obtener mantenimientos recientes (últimos N)
export const getRecentMaintenances = (vehicleId, limit = 5) => {
  try {
    const maintenances = db.getAllSync(
      "SELECT * FROM maintenances WHERE vehicleId = ? ORDER BY date DESC LIMIT ?",
      [vehicleId, limit]
    );
    return maintenances;
  } catch (error) {
    console.error("Error obteniendo mantenimientos recientes:", error);
    return [];
  }
};

// Crear nuevo mantenimiento
export const createMaintenance = (maintenanceData) => {
  try {
    const result = db.runSync(
      `INSERT INTO maintenances (vehicleId, type, category, date, km, cost, provider, notes, photo, nextServiceKm, nextServiceDate) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        maintenanceData.vehicleId,
        maintenanceData.type,
        maintenanceData.category || null,
        maintenanceData.date,
        maintenanceData.km || null,
        maintenanceData.cost || null,
        maintenanceData.provider || null,
        maintenanceData.notes || null,
        maintenanceData.photo || null,
        maintenanceData.nextServiceKm || null,
        maintenanceData.nextServiceDate || null,
      ]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error("Error creando mantenimiento:", error);
    throw error;
  }
};

// Actualizar mantenimiento
export const updateMaintenance = (id, maintenanceData) => {
  try {
    db.runSync(
      `UPDATE maintenances 
       SET type = ?, category = ?, date = ?, km = ?, cost = ?, provider = ?, notes = ?, photo = ?, nextServiceKm = ?, nextServiceDate = ?
       WHERE id = ?`,
      [
        maintenanceData.type,
        maintenanceData.category || null,
        maintenanceData.date,
        maintenanceData.km || null,
        maintenanceData.cost || null,
        maintenanceData.provider || null,
        maintenanceData.notes || null,
        maintenanceData.photo || null,
        maintenanceData.nextServiceKm || null,
        maintenanceData.nextServiceDate || null,
        id,
      ]
    );
    return true;
  } catch (error) {
    console.error("Error actualizando mantenimiento:", error);
    throw error;
  }
};

// Eliminar mantenimiento
export const deleteMaintenance = (id) => {
  try {
    db.runSync("DELETE FROM maintenances WHERE id = ?", [id]);
    return true;
  } catch (error) {
    console.error("Error eliminando mantenimiento:", error);
    throw error;
  }
};

// Obtener tipos de mantenimiento
export const getMaintenanceTypes = () => {
  try {
    const types = db.getAllSync(
      "SELECT * FROM maintenance_types ORDER BY category, name"
    );
    return types;
  } catch (error) {
    console.error("Error obteniendo tipos de mantenimiento:", error);
    return [];
  }
};

// Obtener próximos mantenimientos (vencidos y próximos)
export const getUpcomingMaintenances = (vehicleId, currentKm) => {
  try {
    const maintenances = db.getAllSync(
      `SELECT * FROM maintenances 
       WHERE vehicleId = ? 
       AND (nextServiceKm IS NOT NULL OR nextServiceDate IS NOT NULL)
       ORDER BY date DESC`,
      [vehicleId]
    );

    // Ordenar en JavaScript para considerar ambos criterios (km y fecha)
    const now = new Date();
    const sorted = maintenances.sort((a, b) => {
      // Calcular urgencia por kilometraje
      const aKmDiff = a.nextServiceKm ? a.nextServiceKm - currentKm : Infinity;
      const bKmDiff = b.nextServiceKm ? b.nextServiceKm - currentKm : Infinity;

      // Calcular urgencia por fecha (días restantes)
      const aDaysDiff = a.nextServiceDate
        ? Math.floor(
            (new Date(a.nextServiceDate) - now) / (1000 * 60 * 60 * 24)
          )
        : Infinity;
      const bDaysDiff = b.nextServiceDate
        ? Math.floor(
            (new Date(b.nextServiceDate) - now) / (1000 * 60 * 60 * 24)
          )
        : Infinity;

      // Tomar el criterio más urgente de cada mantenimiento
      const aUrgency = Math.min(
        aKmDiff >= 0 ? aKmDiff / 100 : -1000, // Normalizar km (vencidos tienen prioridad)
        aDaysDiff >= 0 ? aDaysDiff : -1000 // Días (vencidos tienen prioridad)
      );
      const bUrgency = Math.min(
        bKmDiff >= 0 ? bKmDiff / 100 : -1000,
        bDaysDiff >= 0 ? bDaysDiff : -1000
      );

      // Ordenar por urgencia (menor = más urgente)
      return aUrgency - bUrgency;
    });

    return sorted;
  } catch (error) {
    console.error("Error obteniendo próximos mantenimientos:", error);
    return [];
  }
};

// Estadísticas de mantenimiento
export const getMaintenanceStats = (vehicleId) => {
  try {
    const stats = db.getFirstSync(
      `SELECT 
        COUNT(*) as totalServices,
        SUM(cost) as totalCost,
        AVG(cost) as avgCost
       FROM maintenances 
       WHERE vehicleId = ? AND cost IS NOT NULL`,
      [vehicleId]
    );
    return stats;
  } catch (error) {
    console.error("Error obteniendo estadísticas:", error);
    return { totalServices: 0, totalCost: 0, avgCost: 0 };
  }
};
