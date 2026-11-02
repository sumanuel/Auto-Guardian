import { logger } from "../../utils/logger";
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

// Conserva los id originales para no romper las relaciones (vehicleId, etc.)
const importTable = (tableName, rows) => {
  if (!rows || rows.length === 0) return;

  const columnNames = db
    .getAllSync(`PRAGMA table_info("${tableName}")`)
    .map((col) => col.name);

  const escapedColumnNames = columnNames.map((name) => `"${name}"`);
  const placeholders = columnNames.map(() => "?").join(", ");
  const insertSQL = `INSERT OR REPLACE INTO "${tableName}" (${escapedColumnNames.join(
    ", "
  )}) VALUES (${placeholders})`;

  for (const row of rows) {
    db.runSync(
      insertSQL,
      columnNames.map((col) => (row[col] === undefined ? null : row[col]))
    );
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

    if (!backupData.tables || typeof backupData.tables !== "object") {
      throw new Error("El respaldo no contiene datos de tablas");
    }

    // Solo se importan tablas que existen en la base actual (valida nombres
    // antes de tocar nada)
    const existingTables = await getUserTables();
    const tablesToImport = toInsertOrder(Object.keys(backupData.tables)).filter(
      (t) => existingTables.includes(t) && backupData.tables[t]
    );
    for (const tableName of tablesToImport) {
      if (!Array.isArray(backupData.tables[tableName].rows)) {
        throw new Error(`Datos inválidos en la tabla ${tableName}`);
      }
    }

    // Las llaves foráneas no se pueden cambiar dentro de una transacción
    const fkState = db.getFirstSync("PRAGMA foreign_keys");
    db.execSync("PRAGMA foreign_keys = OFF");
    try {
      // Transacción: si algo falla, la base original queda intacta
      db.withTransactionSync(() => {
        for (const tableName of existingTables) {
          db.runSync(`DELETE FROM "${tableName}"`);
          db.runSync("DELETE FROM sqlite_sequence WHERE name = ?", [tableName]);
        }
        for (const tableName of tablesToImport) {
          importTable(tableName, backupData.tables[tableName].rows);
        }
      });
    } finally {
      db.execSync(`PRAGMA foreign_keys = ${fkState?.foreign_keys ? "ON" : "OFF"}`);
    }

    logger.log("Backup imported successfully");
  } catch (error) {
    console.error("Error importing backup:", error);
    throw new Error(`Error al importar el respaldo: ${error.message}`);
  }
};
