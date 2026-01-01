import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import db from "../database";

const BACKUP_DIR = `${FileSystem.documentDirectory}backups/`;

const nowStamp = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(
    d.getHours()
  )}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
};

const ensureBackupDir = async () => {
  const info = await FileSystem.getInfoAsync(BACKUP_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(BACKUP_DIR, { intermediates: true });
  }
};

const getUserTables = async () => {
  const rows = await db.getAllSync(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;"
  );
  return rows.map((r) => r.name);
};

const toInsertOrder = (tables) => {
  // Orden recomendado para respetar llaves foráneas
  const preferred = [
    "contacts",
    "vehicles",
    "maintenances",
    "expenses",
    "repairs",
    "maintenance_types",
    "document_types",
    "vehicle_documents",
  ];

  const set = new Set(tables);
  const ordered = preferred.filter((t) => set.has(t));
  const rest = tables.filter((t) => !ordered.includes(t));
  return [...ordered, ...rest];
};

const exportTable = async (tableName) => {
  const rows = await db.getAllSync(`SELECT * FROM ${tableName}`);
  return { tableName, rows };
};

const importTable = async (tableData) => {
  const { tableName, rows } = tableData;

  if (rows.length === 0) return;

  // Obtener columnas de la tabla
  const columns = await db.getAllSync(`PRAGMA table_info(${tableName})`);
  const columnNames = columns
    .map((col) => col.name)
    .filter((col) => col !== "id");

  // Función para escapar nombres de columnas
  const escapeColumnName = (name) => `"${name}"`;

  // Crear placeholders para los valores
  const escapedColumnNames = columnNames.map(escapeColumnName);
  const placeholders = columnNames.map(() => "?").join(", ");
  const insertSQL = `INSERT OR REPLACE INTO ${tableName} (${escapedColumnNames.join(
    ", "
  )}) VALUES (${placeholders})`;

  // Insertar filas
  for (const row of rows) {
    const values = columnNames.map((col) => row[col]);
    await db.runSync(insertSQL, values);
  }
};

export const exportDatabaseBackup = async () => {
  try {
    await ensureBackupDir();

    const tables = await getUserTables();
    const orderedTables = toInsertOrder(tables);

    const backupData = {
      timestamp: new Date().toISOString(),
      version: "1.0",
      app: "Auto Guardian",
      tables: {},
    };

    for (const tableName of orderedTables) {
      backupData.tables[tableName] = await exportTable(tableName);
    }

    const backupFileName = `autoguardian-backup-${nowStamp()}.json`;
    const backupPath = `${BACKUP_DIR}${backupFileName}`;

    await FileSystem.writeAsStringAsync(
      backupPath,
      JSON.stringify(backupData, null, 2)
    );

    return { uri: backupPath, fileName: backupFileName };
  } catch (error) {
    console.error("Error creating backup:", error);
    throw new Error("No se pudo crear el respaldo");
  }
};

export const shareBackupFile = async (uri) => {
  try {
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      throw new Error("Compartir no está disponible en este dispositivo");
    }

    await Sharing.shareAsync(uri, {
      mimeType: "application/json",
      dialogTitle: "Compartir respaldo de Auto Guardian",
    });
  } catch (error) {
    console.error("Error sharing backup:", error);
    throw new Error("No se pudo compartir el respaldo");
  }
};

export const pickBackupFile = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/json",
      copyToCacheDirectory: true,
    });

    if (result.canceled) {
      return null;
    }

    return result.assets[0];
  } catch (error) {
    console.error("Error picking backup file:", error);
    throw new Error("No se pudo seleccionar el archivo de respaldo");
  }
};

export const importDatabaseBackupFromUri = async (uri) => {
  try {
    const backupContent = await FileSystem.readAsStringAsync(uri);
    const backupData = JSON.parse(backupContent);

    // Validar que sea un respaldo de Auto Guardian
    if (backupData.app !== "Auto Guardian") {
      throw new Error(
        "El archivo seleccionado no es un respaldo válido de Auto Guardian"
      );
    }

    // Limpiar tablas existentes (excepto las del sistema)
    const tables = await getUserTables();
    for (const tableName of tables) {
      await db.runSync(`DELETE FROM ${tableName}`);
      // Resetear autoincrement si es necesario
      await db.runSync(`DELETE FROM sqlite_sequence WHERE name='${tableName}'`);
    }

    // Importar datos en orden correcto
    const orderedTables = toInsertOrder(Object.keys(backupData.tables));
    for (const tableName of orderedTables) {
      if (backupData.tables[tableName]) {
        await importTable(backupData.tables[tableName]);
      }
    }

    console.log("Backup imported successfully");
  } catch (error) {
    console.error("Error importing backup:", error);
    throw new Error(`Error al importar el respaldo: ${error.message}`);
  }
};
