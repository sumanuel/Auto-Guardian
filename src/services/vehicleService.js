import db from "./database";

// Obtener todos los vehículos
export const getAllVehicles = () => {
  try {
    const vehicles = db.getAllSync(
      "SELECT * FROM vehicles ORDER BY createdAt DESC"
    );
    return vehicles;
  } catch (error) {
    console.error("Error obteniendo vehículos:", error);
    return [];
  }
};

// Obtener un vehículo por ID
export const getVehicleById = (id) => {
  try {
    const vehicle = db.getFirstSync("SELECT * FROM vehicles WHERE id = ?", [
      id,
    ]);
    return vehicle;
  } catch (error) {
    console.error("Error obteniendo vehículo:", error);
    return null;
  }
};

// Crear nuevo vehículo
export const createVehicle = (vehicleData) => {
  try {
    const result = db.runSync(
      `INSERT INTO vehicles (name, brand, model, year, color, plate, vin, currentKm, photo) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        vehicleData.name,
        vehicleData.brand || null,
        vehicleData.model || null,
        vehicleData.year || null,
        vehicleData.color || null,
        vehicleData.plate || null,
        vehicleData.vin || null,
        vehicleData.currentKm || 0,
        vehicleData.photo || null,
      ]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error("Error creando vehículo:", error);
    throw error;
  }
};

// Actualizar vehículo
export const updateVehicle = (id, vehicleData) => {
  try {
    db.runSync(
      `UPDATE vehicles 
       SET name = ?, brand = ?, model = ?, year = ?, color = ?, plate = ?, vin = ?, currentKm = ?, photo = ?
       WHERE id = ?`,
      [
        vehicleData.name,
        vehicleData.brand || null,
        vehicleData.model || null,
        vehicleData.year || null,
        vehicleData.color || null,
        vehicleData.plate || null,
        vehicleData.vin || null,
        vehicleData.currentKm || 0,
        vehicleData.photo || null,
        id,
      ]
    );
    return true;
  } catch (error) {
    console.error("Error actualizando vehículo:", error);
    throw error;
  }
};

// Eliminar vehículo
export const deleteVehicle = (id) => {
  try {
    // Aunque ON DELETE CASCADE debería manejar esto automáticamente,
    // nos aseguramos explícitamente de eliminar todos los registros relacionados
    db.runSync("DELETE FROM maintenances WHERE vehicleId = ?", [id]);
    db.runSync("DELETE FROM expenses WHERE vehicleId = ?", [id]);
    db.runSync("DELETE FROM repairs WHERE vehicleId = ?", [id]);
    db.runSync("DELETE FROM vehicles WHERE id = ?", [id]);
    return true;
  } catch (error) {
    console.error("Error eliminando vehículo:", error);
    throw error;
  }
};

// Actualizar solo el kilometraje
export const updateVehicleKm = (id, km) => {
  try {
    db.runSync("UPDATE vehicles SET currentKm = ? WHERE id = ?", [km, id]);
    return true;
  } catch (error) {
    console.error("Error actualizando kilometraje:", error);
    throw error;
  }
};
