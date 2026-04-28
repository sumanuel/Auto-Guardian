import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("autoguardian.db");

// Insertar tipos de mantenimiento predeterminados
const seedMaintenanceTypes = () => {
  const types = [
    {
      name: "Cambio de aceite",
      category: "Motor",
      defaultIntervalKm: 5000,
      defaultIntervalTime: 6,
      defaultIntervalUnit: "months",
      icon: "water-outline",
    },
    {
      name: "Filtro de aceite",
      category: "Motor",
      defaultIntervalKm: 5000,
      defaultIntervalTime: 6,
      defaultIntervalUnit: "months",
      icon: "funnel-outline",
    },
    {
      name: "Filtro de aire",
      category: "Motor",
      defaultIntervalKm: 15000,
      defaultIntervalTime: 12,
      defaultIntervalUnit: "months",
      icon: "construct-outline",
    },
    {
      name: "Bujías",
      category: "Motor",
      defaultIntervalKm: 30000,
      defaultIntervalTime: 24,
      defaultIntervalUnit: "months",
      icon: "flash-outline",
    },
    {
      name: "Pastillas de freno",
      category: "Frenos",
      defaultIntervalKm: 40000,
      defaultIntervalTime: 24,
      defaultIntervalUnit: "months",
      icon: "hardware-chip-outline",
    },
    {
      name: "Líquido de frenos",
      category: "Frenos",
      defaultIntervalKm: 40000,
      defaultIntervalTime: 24,
      defaultIntervalUnit: "months",
      icon: "water-outline",
    },
    {
      name: "Neumáticos",
      category: "Neumáticos",
      defaultIntervalKm: 50000,
      defaultIntervalTime: 36,
      defaultIntervalUnit: "months",
      icon: "ellipse-outline",
    },
    {
      name: "Rotación de neumáticos",
      category: "Neumáticos",
      defaultIntervalKm: 10000,
      defaultIntervalTime: 6,
      defaultIntervalUnit: "months",
      icon: "refresh-outline",
    },
    {
      name: "Alineación",
      category: "Neumáticos",
      defaultIntervalKm: 15000,
      defaultIntervalTime: 12,
      defaultIntervalUnit: "months",
      icon: "options-outline",
    },
    {
      name: "Balanceo",
      category: "Neumáticos",
      defaultIntervalKm: 15000,
      defaultIntervalTime: 12,
      defaultIntervalUnit: "months",
      icon: "options-outline",
    },
    {
      name: "Batería",
      category: "Eléctrico",
      defaultIntervalKm: null,
      defaultIntervalTime: 36,
      defaultIntervalUnit: "months",
      icon: "battery-charging-outline",
    },
    {
      name: "Refrigerante",
      category: "Motor",
      defaultIntervalKm: 40000,
      defaultIntervalTime: 24,
      defaultIntervalUnit: "months",
      icon: "water-outline",
    },
    {
      name: "Transmisión",
      category: "Motor",
      defaultIntervalKm: 60000,
      defaultIntervalTime: 36,
      defaultIntervalUnit: "months",
      icon: "cog-outline",
    },
    {
      name: "Correa de distribución",
      category: "Motor",
      defaultIntervalKm: 100000,
      defaultIntervalTime: 60,
      defaultIntervalUnit: "months",
      icon: "git-branch-outline",
    },
    {
      name: "Inspección general",
      category: "General",
      defaultIntervalKm: 10000,
      defaultIntervalTime: 12,
      defaultIntervalUnit: "months",
      icon: "search-outline",
    },
  ];

  types.forEach((type) => {
    try {
      db.runSync(
        "INSERT OR IGNORE INTO maintenance_types (name, category, defaultIntervalKm, defaultIntervalTime, defaultIntervalUnit, icon) VALUES (?, ?, ?, ?, ?, ?)",
        [
          type.name,
          type.category,
          type.defaultIntervalKm,
          type.defaultIntervalTime,
          type.defaultIntervalUnit,
          type.icon,
        ],
      );
    } catch (error) {
      // Ignorar si ya existe
    }
  });

  // Migrar iconos existentes
  migrateMaintenanceTypeIcons();
};

// Migrar iconos de tipos de mantenimiento existentes
const migrateMaintenanceTypeIcons = () => {
  const iconMigrations = {
    "Cambio de aceite": "water-outline",
    Refrigerante: "water-outline",
    Bujías: "flash-outline",
    "Filtro de aire": "construct-outline",
    Transmisión: "cog-outline",
    "Correa de distribución": "git-branch-outline",
    Alineación: "options-outline",
    Balanceo: "options-outline",
    "Inspección general": "search-outline",
    "Pastillas de freno": "hardware-chip-outline",
    "Filtro de aceite": "funnel-outline",
    "Rotación de neumáticos": "refresh-outline",
    Neumáticos: "ellipse-outline",
    Batería: "battery-charging-outline",
    "Líquido de frenos": "water-outline",
  };

  try {
    Object.entries(iconMigrations).forEach(([name, newIcon]) => {
      db.runSync("UPDATE maintenance_types SET icon = ? WHERE name = ?", [
        newIcon,
        name,
      ]);
    });
  } catch (error) {
    console.log("Error migrando iconos:", error);
  }
};

// Insertar tipos de documentos predeterminados
const seedDocumentTypes = () => {
  const documentTypes = [
    {
      code: 1,
      type_document: "Licencia de Conducir",
      description: "",
    },
    {
      code: 2,
      type_document: "Certificado Médico",
      description: "",
    },
    {
      code: 3,
      type_document: "Tarjeta de Circulación",
      description: "",
    },
    {
      code: 4,
      type_document: "Seguro Obligatorio",
      description: "Seguro Obligatorio de Accidentes de Tránsito",
    },
    {
      code: 5,
      type_document: "Certificado de Inspección Técnica Vehicular",
      description: "Revisión Técnica",
    },
    {
      code: 6,
      type_document: "Carnet de Transporte",
      description: "Para vehículos de transporte público o de carga",
    },
    {
      code: 7,
      type_document: "Documento de Identidad",
      description: "Cédula de Identidad",
    },
  ];

  try {
    documentTypes.forEach((docType) => {
      db.runSync(
        "INSERT OR IGNORE INTO document_types (code, type_document, description) VALUES (?, ?, ?)",
        [docType.code, docType.type_document, docType.description],
      );
    });
  } catch (error) {
    console.error("Error insertando tipos de documentos:", error);
  }

  migrateDocumentTypeNames();
};

const migrateDocumentTypeNames = () => {
  try {
    db.runSync(
      "UPDATE document_types SET type_document = ? WHERE code = ? AND type_document = ?",
      ["Seguro Obligatorio", 4, "SOAT"],
    );
  } catch (error) {
    console.error("Error migrando nombres de tipos de documentos:", error);
  }
};

// Inicializar la base de datos
export const initDatabase = () => {
  try {
    // Tabla de vehículos
    db.execSync(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        brand TEXT,
        model TEXT,
        year INTEGER,
        color TEXT,
        plate TEXT,
        vin TEXT,
        currentKm INTEGER DEFAULT 0,
        photo TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabla de mantenimientos
    db.execSync(`
      CREATE TABLE IF NOT EXISTS maintenances (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vehicleId INTEGER NOT NULL,
        type TEXT NOT NULL,
        category TEXT,
        date TEXT NOT NULL,
        km INTEGER,
        cost REAL,
        provider TEXT,
        notes TEXT,
        photo TEXT,
        nextServiceKm INTEGER,
        nextServiceDate TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (vehicleId) REFERENCES vehicles (id) ON DELETE CASCADE
      );
    `);

    // Agregar columna completedAt si no existe
    const columns = db.getAllSync("PRAGMA table_info(maintenances);");
    const hasCompletedAt = columns.some((col) => col.name === "completedAt");
    if (!hasCompletedAt) {
      db.execSync("ALTER TABLE maintenances ADD COLUMN completedAt TEXT;");
      console.log("Columna completedAt agregada a maintenances");
    }

    // Tabla de gastos particulares
    db.execSync(`
      CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vehicleId INTEGER NOT NULL,
        description TEXT NOT NULL,
        category TEXT,
        date TEXT NOT NULL,
        cost REAL NOT NULL,
        notes TEXT,
        photo TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (vehicleId) REFERENCES vehicles (id) ON DELETE CASCADE
      );
    `);

    // Tabla de reparaciones
    db.execSync(`
      CREATE TABLE IF NOT EXISTS repairs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vehicleId INTEGER NOT NULL,
        description TEXT NOT NULL,
        category TEXT,
        date TEXT NOT NULL,
        cost REAL NOT NULL,
        workshop TEXT,
        notes TEXT,
        photo TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (vehicleId) REFERENCES vehicles (id) ON DELETE CASCADE
      );
    `);

    // Tabla de tipos de mantenimiento (configuración)
    db.execSync(`
      CREATE TABLE IF NOT EXISTS maintenance_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        category TEXT,
        defaultIntervalKm INTEGER,
        defaultIntervalTime INTEGER,
        defaultIntervalUnit TEXT DEFAULT 'months',
        icon TEXT,
        \`order\` INTEGER DEFAULT 0
      );
    `);

    // Tabla de tipos de documentos (configuración)
    db.execSync(`
      CREATE TABLE IF NOT EXISTS document_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code INTEGER NOT NULL UNIQUE,
        type_document TEXT NOT NULL UNIQUE,
        description TEXT
      );
    `);

    // Tabla de documentos de vehículos
    db.execSync(`
      CREATE TABLE IF NOT EXISTS vehicle_documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vehicle_id INTEGER NOT NULL,
        document_type_id INTEGER NOT NULL,
        issue_date TEXT NOT NULL,
        expiry_date TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (vehicle_id) REFERENCES vehicles (id) ON DELETE CASCADE,
        FOREIGN KEY (document_type_id) REFERENCES document_types (id) ON DELETE CASCADE
      );
    `);

    // Tabla de contactos
    db.execSync(`
      CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        notes TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    seedMaintenanceTypes();
    seedDocumentTypes();
    migrateDatabase();
  } catch (error) {
    console.error("❌ Error inicializando base de datos:", error);
  }
};

// Migración para agregar campo order a maintenance_types
const migrateDatabase = () => {
  try {
    // Verificar si la columna order ya existe
    const tableInfo = db.getAllSync("PRAGMA table_info(maintenance_types)");
    const hasOrderColumn = tableInfo.some((column) => column.name === "order");

    if (!hasOrderColumn) {
      console.log(
        "🔄 Migrando tabla maintenance_types: agregando campo 'order'",
      );

      // Agregar columna order
      db.execSync(
        "ALTER TABLE maintenance_types ADD COLUMN `order` INTEGER DEFAULT 0",
      );

      // Asignar orden inicial basado en el orden actual
      const types = db.getAllSync(
        "SELECT id FROM maintenance_types ORDER BY id",
      );
      types.forEach((type, index) => {
        db.runSync("UPDATE maintenance_types SET `order` = ? WHERE id = ?", [
          index + 1,
          type.id,
        ]);
      });

      console.log(
        "✅ Migración completada: campo 'order' agregado a maintenance_types",
      );
    }

    // Migrar defaultIntervalMonths a defaultIntervalTime y agregar unit
    const hasMonthsColumn = tableInfo.some(
      (column) => column.name === "defaultIntervalMonths",
    );
    const hasTimeColumn = tableInfo.some(
      (column) => column.name === "defaultIntervalTime",
    );
    const hasUnitColumn = tableInfo.some(
      (column) => column.name === "defaultIntervalUnit",
    );

    if (hasMonthsColumn && !hasTimeColumn) {
      console.log(
        "🔄 Migrando tabla maintenance_types: renombrando defaultIntervalMonths a defaultIntervalTime y agregando defaultIntervalUnit",
      );

      // Renombrar columna
      db.execSync(
        "ALTER TABLE maintenance_types RENAME COLUMN defaultIntervalMonths TO defaultIntervalTime",
      );

      // Agregar columna unit
      db.execSync(
        "ALTER TABLE maintenance_types ADD COLUMN defaultIntervalUnit TEXT DEFAULT 'months'",
      );

      console.log(
        "✅ Migración completada: defaultIntervalMonths renombrado a defaultIntervalTime y defaultIntervalUnit agregado",
      );
    } else if (!hasUnitColumn) {
      console.log(
        "🔄 Migrando tabla maintenance_types: agregando campo 'defaultIntervalUnit'",
      );

      // Agregar columna unit
      db.execSync(
        "ALTER TABLE maintenance_types ADD COLUMN defaultIntervalUnit TEXT DEFAULT 'months'",
      );

      console.log(
        "✅ Migración completada: campo 'defaultIntervalUnit' agregado a maintenance_types",
      );
    }
  } catch (error) {
    console.error("❌ Error en migración:", error);
  }
};

// Limpiar registros huérfanos (registros que apuntan a vehículos eliminados)
export const cleanOrphanedRecords = () => {
  try {
    // Eliminar mantenimientos de vehículos que ya no existen
    const deletedMaintenances = db.runSync(`
      DELETE FROM maintenances 
      WHERE vehicleId NOT IN (SELECT id FROM vehicles)
    `);

    // Eliminar gastos de vehículos que ya no existen
    const deletedExpenses = db.runSync(`
      DELETE FROM expenses 
      WHERE vehicleId NOT IN (SELECT id FROM vehicles)
    `);

    // Eliminar reparaciones de vehículos que ya no existen
    const deletedRepairs = db.runSync(`
      DELETE FROM repairs 
      WHERE vehicleId NOT IN (SELECT id FROM vehicles)
    `);

    const totalDeleted =
      deletedMaintenances.changes +
      deletedExpenses.changes +
      deletedRepairs.changes;

    return totalDeleted;
  } catch (error) {
    console.error("Error limpiando registros huérfanos:", error);
    return 0;
  }
};

export default db;
