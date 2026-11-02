import { logger } from "../../utils/logger";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import db from "../database";

const BACKUP_DIR = `${FileSystem.documentDirectory}backups/`;
const VEHICLE_PHOTOS_DIR = `${FileSystem.documentDirectory}vehicle_photos/`;

// Las fotos propias de la app se guardan en el respaldo como base64 para que
// sobrevivan a un cambio de teléfono (el URI absoluto cambia entre equipos).
const exportVehiclePhotos = async (vehicleRows) => {
  const photos = {};
  for (const row of vehicleRows) {
    if (!row.photo || !row.photo.startsWith(VEHICLE_PHOTOS_DIR)) continue;
    const fileName = row.photo.slice(VEHICLE_PHOTOS_DIR.length);
    try {
      photos[fileName] = await FileSystem.readAsStringAsync(row.photo, {
        encoding: FileSystem.EncodingType.Base64,
      });
    } catch (error) {
      logger.log("Foto omitida en el respaldo:", fileName, error?.message);
    }
  }
  return photos;
};

const restoreVehiclePhotos = async (photos, vehicleRows) => {
  if (!photos || Object.keys(photos).length === 0) return;
  await FileSystem.makeDirectoryAsync(VEHICLE_PHOTOS_DIR, {
    intermediates: true,
  });
  for (const [fileName, data] of Object.entries(photos)) {
    // Evita rutas fuera de la carpeta de fotos
    if (fileName.includes("/") || fileName.includes("..")) continue;
    await FileSystem.writeAsStringAsync(`${VEHICLE_PHOTOS_DIR}${fileName}`, data, {
      encoding: FileSystem.EncodingType.Base64,
    });
  }
  // Reapuntar cada foto al directorio de este dispositivo
  for (const row of vehicleRows) {
    if (!row.photo) continue;
    const match = row.photo.match(/vehicle_photos\/([^/]+)$/);
    if (match && photos[match[1]] !== undefined) {
      row.photo = `${VEHICLE_PHOTOS_DIR}${match[1]}`;
    }
  }
};

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

export const exportDatabaseBackup = async (prefix = "autoguardian-backup") => {
  try {
    await ensureBackupDir();

    const tables = await getUserTables();
    const orderedTables = toInsertOrder(tables);

    const backupData = {
      timestamp: new Date().toISOString(),
      version: "1.0",
      app: "Auto Guardian",
      tables: {},
      vehiclePhotos: {},
    };

    for (const tableName of orderedTables) {
      backupData.tables[tableName] = await exportTable(tableName);
    }

    backupData.vehiclePhotos = await exportVehiclePhotos(
      backupData.tables.vehicles?.rows || []
    );

    const backupFileName = `${prefix}-${nowStamp()}.json`;
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

    await restoreVehiclePhotos(
      backupData.vehiclePhotos,
      backupData.tables.vehicles?.rows || []
    );

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

const AUTO_BACKUP_KEY = "lastAutoBackupAt";
const AUTO_BACKUP_PREFIX = "autoguardian-auto";
const AUTO_BACKUP_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000;
const AUTO_BACKUP_KEEP = 5;

const pruneAutoBackups = async () => {
  const files = await FileSystem.readDirectoryAsync(BACKUP_DIR);
  const autoFiles = files
    .filter((name) => name.startsWith(`${AUTO_BACKUP_PREFIX}-`))
    .sort(); // el sello de fecha ordena cronológicamente
  for (const name of autoFiles.slice(0, -AUTO_BACKUP_KEEP)) {
    await FileSystem.deleteAsync(`${BACKUP_DIR}${name}`, { idempotent: true });
  }
};

// Crea un respaldo local si pasó más de una semana desde el último.
// Nunca lanza: un fallo aquí no debe impedir abrir la app.
export const runAutoBackupIfDue = async (now = Date.now()) => {
  try {
    const last = Number(await AsyncStorage.getItem(AUTO_BACKUP_KEY)) || 0;
    if (now - last < AUTO_BACKUP_INTERVAL_MS) return false;

    await exportDatabaseBackup(AUTO_BACKUP_PREFIX);
    await AsyncStorage.setItem(AUTO_BACKUP_KEY, String(now));
    await pruneAutoBackups();
    return true;
  } catch (error) {
    logger.log("Respaldo automático omitido:", error?.message);
    return false;
  }
};
