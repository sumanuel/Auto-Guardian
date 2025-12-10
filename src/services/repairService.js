import db from "./database";

// Obtener todas las reparaciones de un vehículo
export const getRepairsByVehicle = (vehicleId) => {
  try {
    const repairs = db.getAllSync(
      "SELECT * FROM repairs WHERE vehicleId = ? ORDER BY date DESC",
      [vehicleId]
    );
    return repairs;
  } catch (error) {
    console.error("Error obteniendo reparaciones:", error);
    return [];
  }
};

// Obtener todas las reparaciones
export const getAllRepairs = () => {
  try {
    const repairs = db.getAllSync("SELECT * FROM repairs ORDER BY date DESC");
    return repairs;
  } catch (error) {
    console.error("Error obteniendo todas las reparaciones:", error);
    return [];
  }
};

// Crear nueva reparación
export const createRepair = (repairData) => {
  try {
    const result = db.runSync(
      `INSERT INTO repairs (vehicleId, description, category, date, cost, workshop, notes, photo) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        repairData.vehicleId,
        repairData.description,
        repairData.category || null,
        repairData.date,
        repairData.cost,
        repairData.workshop || null,
        repairData.notes || null,
        repairData.photo || null,
      ]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error("Error creando reparación:", error);
    throw error;
  }
};

// Actualizar reparación
export const updateRepair = (id, repairData) => {
  try {
    db.runSync(
      `UPDATE repairs 
       SET description = ?, category = ?, date = ?, cost = ?, workshop = ?, notes = ?, photo = ?
       WHERE id = ?`,
      [
        repairData.description,
        repairData.category || null,
        repairData.date,
        repairData.cost,
        repairData.workshop || null,
        repairData.notes || null,
        repairData.photo || null,
        id,
      ]
    );
    return true;
  } catch (error) {
    console.error("Error actualizando reparación:", error);
    throw error;
  }
};

// Eliminar reparación
export const deleteRepair = (id) => {
  try {
    db.runSync("DELETE FROM repairs WHERE id = ?", [id]);
    return true;
  } catch (error) {
    console.error("Error eliminando reparación:", error);
    throw error;
  }
};

// Estadísticas de reparaciones
export const getRepairStats = (vehicleId) => {
  try {
    const stats = db.getFirstSync(
      `SELECT 
        COUNT(*) as totalRepairs,
        SUM(cost) as totalCost,
        AVG(cost) as avgCost
       FROM repairs 
       WHERE vehicleId = ?`,
      [vehicleId]
    );
    return stats;
  } catch (error) {
    console.error("Error obteniendo estadísticas de reparaciones:", error);
    return { totalRepairs: 0, totalCost: 0, avgCost: 0 };
  }
};

// Obtener reparaciones por categoría
export const getRepairsByCategory = (vehicleId) => {
  try {
    const repairs = db.getAllSync(
      `SELECT 
        category,
        COUNT(*) as count,
        SUM(cost) as total
       FROM repairs 
       WHERE vehicleId = ? AND category IS NOT NULL
       GROUP BY category
       ORDER BY total DESC`,
      [vehicleId]
    );
    return repairs;
  } catch (error) {
    console.error("Error obteniendo reparaciones por categoría:", error);
    return [];
  }
};
