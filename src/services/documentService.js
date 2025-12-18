import db from "./database";

// ==================== GESTIÓN DE TIPOS DE DOCUMENTOS ====================

// ==================== GESTIÓN DE TIPOS DE DOCUMENTOS ====================

// Obtener todos los tipos de documentos
export const getDocumentTypes = () => {
  try {
    if (!db) {
      console.warn("Base de datos no inicializada");
      return [];
    }
    const types = db.getAllSync(
      `SELECT * FROM document_types
       ORDER BY code ASC`
    );
    return types;
  } catch (error) {
    console.error("Error obteniendo tipos de documentos:", error);
    return [];
  }
};

// Obtener un tipo de documento por código
export const getDocumentTypeByCode = (code) => {
  try {
    const type = db.getFirstSync(
      "SELECT * FROM document_types WHERE code = ?",
      [code]
    );
    return type;
  } catch (error) {
    console.error("Error obteniendo tipo de documento:", error);
    return null;
  }
};

// Crear nuevo tipo de documento
export const createDocumentType = (typeData) => {
  try {
    // Obtener el código más alto actual y asignar el siguiente
    const maxCodeResult = db.getFirstSync(
      "SELECT MAX(code) as maxCode FROM document_types"
    );
    const nextCode = (maxCodeResult?.maxCode || 0) + 1;

    const result = db.runSync(
      `INSERT INTO document_types (code, type_document, description)
       VALUES (?, ?, ?)`,
      [nextCode, typeData.type_document, typeData.description || null]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error("Error creando tipo de documento:", error);
    throw error;
  }
};

// Actualizar tipo de documento
export const updateDocumentType = (id, typeData) => {
  try {
    db.runSync(
      `UPDATE document_types
       SET type_document = ?, description = ?
       WHERE id = ?`,
      [typeData.type_document, typeData.description || null, id]
    );
    return true;
  } catch (error) {
    console.error("Error actualizando tipo de documento:", error);
    throw error;
  }
};

// Verificar si un tipo de documento está en uso
export const isDocumentTypeInUse = (typeId) => {
  try {
    // Por ahora, asumimos que no están en uso ya que no hay tabla de documentos
    // En el futuro, si se crea una tabla de documentos, verificar aquí
    return false;
  } catch (error) {
    console.error("Error verificando uso del tipo de documento:", error);
    return true; // Por seguridad, asumimos que está en uso si hay error
  }
};

// Eliminar tipo de documento personalizado
export const deleteDocumentType = (id) => {
  try {
    // Verificar si está en uso
    if (isDocumentTypeInUse(id)) {
      throw new Error(
        "No se puede eliminar un tipo de documento que está en uso"
      );
    }

    db.runSync("DELETE FROM document_types WHERE id = ?", [id]);
    return true;
  } catch (error) {
    console.error("Error eliminando tipo de documento:", error);
    throw error;
  }
};
