import db from "./database";

// Obtener todos los documentos de un vehículo
export const getVehicleDocuments = (vehicleId) => {
  try {
    if (!db) {
      console.warn("Base de datos no inicializada");
      return [];
    }
    const documents = db.getAllSync(
      `SELECT vd.*, dt.type_document, dt.description as document_description
       FROM vehicle_documents vd
       JOIN document_types dt ON vd.document_type_id = dt.id
       WHERE vd.vehicle_id = ?
       ORDER BY vd.expiry_date ASC`,
      [vehicleId]
    );
    return documents;
  } catch (error) {
    console.error("Error obteniendo documentos del vehículo:", error);
    return [];
  }
};

// Agregar documento a un vehículo
export const addVehicleDocument = (
  vehicleId,
  documentTypeId,
  issueDate,
  expiryDate
) => {
  try {
    if (!db) {
      console.warn("Base de datos no inicializada");
      return null;
    }
    const result = db.runSync(
      `INSERT INTO vehicle_documents (vehicle_id, document_type_id, issue_date, expiry_date)
       VALUES (?, ?, ?, ?)`,
      [vehicleId, documentTypeId, issueDate, expiryDate]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error("Error agregando documento al vehículo:", error);
    return null;
  }
};

// Actualizar documento de vehículo
export const updateVehicleDocument = (
  id,
  documentTypeId,
  issueDate,
  expiryDate
) => {
  try {
    if (!db) {
      console.warn("Base de datos no inicializada");
      return false;
    }
    const result = db.runSync(
      `UPDATE vehicle_documents
       SET document_type_id = ?, issue_date = ?, expiry_date = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [documentTypeId, issueDate, expiryDate, id]
    );
    return result.changes > 0;
  } catch (error) {
    console.error("Error actualizando documento del vehículo:", error);
    return false;
  }
};

// Eliminar documento de vehículo
export const deleteVehicleDocument = (id) => {
  try {
    if (!db) {
      console.warn("Base de datos no inicializada");
      return false;
    }
    const result = db.runSync("DELETE FROM vehicle_documents WHERE id = ?", [
      id,
    ]);
    return result.changes > 0;
  } catch (error) {
    console.error("Error eliminando documento del vehículo:", error);
    return false;
  }
};

// Obtener todos los documentos de vehículos
export const getAllVehicleDocuments = () => {
  try {
    if (!db) {
      console.warn("Base de datos no inicializada");
      return [];
    }
    const documents = db.getAllSync(
      `SELECT vd.*, dt.type_document as document_type_name, dt.description as document_description,
              v.name as vehicle_name, v.plate as vehicle_plate
       FROM vehicle_documents vd
       JOIN document_types dt ON vd.document_type_id = dt.id
       JOIN vehicles v ON vd.vehicle_id = v.id
       ORDER BY vd.expiry_date ASC`
    );
    return documents;
  } catch (error) {
    console.error("Error obteniendo todos los documentos de vehículos:", error);
    return [];
  }
};

// Obtener documentos próximos a vencer (dentro de 30 días)
export const getExpiringDocuments = (days = 30) => {
  try {
    if (!db) {
      console.warn("Base de datos no inicializada");
      return [];
    }
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    const futureDateStr = futureDate.toISOString().split("T")[0];

    const documents = db.getAllSync(
      `SELECT vd.*, dt.type_document as document_type_name, dt.description as document_description,
              v.name as vehicle_name, v.plate as vehicle_plate
       FROM vehicle_documents vd
       JOIN document_types dt ON vd.document_type_id = dt.id
       JOIN vehicles v ON vd.vehicle_id = v.id
       WHERE vd.expiry_date IS NOT NULL AND vd.expiry_date >= ? AND vd.expiry_date <= ?
       ORDER BY vd.expiry_date ASC`,
      [todayStr, futureDateStr]
    );
    return documents;
  } catch (error) {
    console.error("Error obteniendo documentos próximos a vencer:", error);
    return [];
  }
};
