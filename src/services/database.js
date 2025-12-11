import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("autoguardian.db");

// Insertar tipos de mantenimiento predeterminados
const seedMaintenanceTypes = () => {
  const types = [
    {
      name: "Cambio de aceite",
      category: "Motor",
      defaultIntervalKm: 5000,
      defaultIntervalMonths: 6,
      icon: "water-outline",
    },
    {
      name: "Filtro de aceite",
      category: "Motor",
      defaultIntervalKm: 5000,
      defaultIntervalMonths: 6,
      icon: "funnel-outline",
    },
    {
      name: "Filtro de aire",
      category: "Motor",
      defaultIntervalKm: 15000,
      defaultIntervalMonths: 12,
      icon: "construct-outline",
    },
    {
      name: "Bujías",
      category: "Motor",
      defaultIntervalKm: 30000,
      defaultIntervalMonths: 24,
      icon: "flash-outline",
    },
    {
      name: "Pastillas de freno",
      category: "Frenos",
      defaultIntervalKm: 40000,
      defaultIntervalMonths: 24,
      icon: "hardware-chip-outline",
    },
    {
      name: "Líquido de frenos",
      category: "Frenos",
      defaultIntervalKm: 40000,
      defaultIntervalMonths: 24,
      icon: "water-outline",
    },
    {
      name: "Neumáticos",
      category: "Neumáticos",
      defaultIntervalKm: 50000,
      defaultIntervalMonths: 36,
      icon: "ellipse-outline",
    },
    {
      name: "Rotación de neumáticos",
      category: "Neumáticos",
      defaultIntervalKm: 10000,
      defaultIntervalMonths: 6,
      icon: "refresh-outline",
    },
    {
      name: "Alineación",
      category: "Neumáticos",
      defaultIntervalKm: 15000,
      defaultIntervalMonths: 12,
      icon: "options-outline",
    },
    {
      name: "Balanceo",
      category: "Neumáticos",
      defaultIntervalKm: 15000,
      defaultIntervalMonths: 12,
      icon: "options-outline",
    },
    {
      name: "Batería",
      category: "Eléctrico",
      defaultIntervalKm: null,
      defaultIntervalMonths: 36,
      icon: "battery-charging-outline",
    },
    {
      name: "Refrigerante",
      category: "Motor",
      defaultIntervalKm: 40000,
      defaultIntervalMonths: 24,
      icon: "water-outline",
    },
    {
      name: "Transmisión",
      category: "Motor",
      defaultIntervalKm: 60000,
      defaultIntervalMonths: 36,
      icon: "cog-outline",
    },
    {
      name: "Correa de distribución",
      category: "Motor",
      defaultIntervalKm: 100000,
      defaultIntervalMonths: 60,
      icon: "git-branch-outline",
    },
    {
      name: "Inspección general",
      category: "General",
      defaultIntervalKm: 10000,
      defaultIntervalMonths: 12,
      icon: "search-outline",
    },
  ];

  types.forEach((type) => {
    try {
      db.runSync(
        "INSERT OR IGNORE INTO maintenance_types (name, category, defaultIntervalKm, defaultIntervalMonths, icon) VALUES (?, ?, ?, ?, ?)",
        [
          type.name,
          type.category,
          type.defaultIntervalKm,
          type.defaultIntervalMonths,
          type.icon,
        ]
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
        defaultIntervalMonths INTEGER,
        icon TEXT
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

    console.log("✅ Base de datos inicializada correctamente");
    seedMaintenanceTypes();
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
        "🔄 Migrando tabla maintenance_types: agregando campo 'order'"
      );

      // Agregar columna order
      db.execSync(
        "ALTER TABLE maintenance_types ADD COLUMN `order` INTEGER DEFAULT 0"
      );

      // Asignar orden inicial basado en el orden actual
      const types = db.getAllSync(
        "SELECT id FROM maintenance_types ORDER BY id"
      );
      types.forEach((type, index) => {
        db.runSync("UPDATE maintenance_types SET `order` = ? WHERE id = ?", [
          index + 1,
          type.id,
        ]);
      });

      console.log(
        "✅ Migración completada: campo 'order' agregado a maintenance_types"
      );
    }
  } catch (error) {
    console.error("❌ Error en migración:", error);
  }
};

// Limpiar registros huérfanos (registros que apuntan a vehículos eliminados)
export const cleanOrphanedRecords = () => {
  try {
    console.log("🧹 Limpiando registros huérfanos...");

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

    if (totalDeleted > 0) {
      console.log(
        `✅ Limpieza completada: ${totalDeleted} registros huérfanos eliminados`
      );
      console.log(`   - Mantenimientos: ${deletedMaintenances.changes}`);
      console.log(`   - Gastos: ${deletedExpenses.changes}`);
      console.log(`   - Reparaciones: ${deletedRepairs.changes}`);
    } else {
      console.log("✅ No se encontraron registros huérfanos");
    }

    return totalDeleted;
  } catch (error) {
    console.error("❌ Error limpiando registros huérfanos:", error);
    return 0;
  }
};

export default db;
