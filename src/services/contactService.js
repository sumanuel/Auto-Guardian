import db from "./database";

// Obtener todos los contactos
export const getAllContacts = () => {
  try {
    const contacts = db.getAllSync(
      "SELECT * FROM contacts ORDER BY createdAt DESC"
    );
    return contacts;
  } catch (error) {
    console.error("Error obteniendo contactos:", error);
    return [];
  }
};

// Obtener un contacto por ID
export const getContactById = (id) => {
  try {
    const contact = db.getFirstSync("SELECT * FROM contacts WHERE id = ?", [
      id,
    ]);
    return contact;
  } catch (error) {
    console.error("Error obteniendo contacto:", error);
    return null;
  }
};

// Crear nuevo contacto
export const createContact = (contactData) => {
  try {
    const result = db.runSync(
      `INSERT INTO contacts (name, phone, email, notes)
       VALUES (?, ?, ?, ?)`,
      [
        contactData.name,
        contactData.phone || null,
        contactData.email || null,
        contactData.notes || null,
      ]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error("Error creando contacto:", error);
    throw error;
  }
};

// Actualizar contacto
export const updateContact = (id, contactData) => {
  try {
    db.runSync(
      `UPDATE contacts
       SET name = ?, phone = ?, email = ?, notes = ?
       WHERE id = ?`,
      [
        contactData.name,
        contactData.phone || null,
        contactData.email || null,
        contactData.notes || null,
        id,
      ]
    );
    return true;
  } catch (error) {
    console.error("Error actualizando contacto:", error);
    throw error;
  }
};

// Eliminar contacto
export const deleteContact = (id) => {
  try {
    db.runSync("DELETE FROM contacts WHERE id = ?", [id]);
    return true;
  } catch (error) {
    console.error("Error eliminando contacto:", error);
    throw error;
  }
};
