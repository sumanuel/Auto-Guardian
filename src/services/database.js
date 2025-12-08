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
  } catch (error) {
    console.error("❌ Error inicializando base de datos:", error);
  }
};

export default db;
