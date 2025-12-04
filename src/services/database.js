import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("autoguardian.db");

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

    console.log("✅ Base de datos inicializada correctamente");
    seedMaintenanceTypes();
  } catch (error) {
    console.error("❌ Error inicializando base de datos:", error);
  }
};

// Insertar tipos de mantenimiento predeterminados
const seedMaintenanceTypes = () => {
  const types = [
    {
      name: "Cambio de aceite",
      category: "Motor",
      defaultIntervalKm: 5000,
      defaultIntervalMonths: 6,
      icon: "oil-can",
    },
    {
      name: "Filtro de aceite",
      category: "Motor",
      defaultIntervalKm: 5000,
      defaultIntervalMonths: 6,
      icon: "filter",
    },
    {
      name: "Filtro de aire",
      category: "Motor",
      defaultIntervalKm: 15000,
      defaultIntervalMonths: 12,
      icon: "air-filter",
    },
    {
      name: "Bujías",
      category: "Motor",
      defaultIntervalKm: 30000,
      defaultIntervalMonths: 24,
      icon: "lightbulb",
    },
    {
      name: "Pastillas de freno",
      category: "Frenos",
      defaultIntervalKm: 40000,
      defaultIntervalMonths: 24,
      icon: "disc",
    },
    {
      name: "Líquido de frenos",
      category: "Frenos",
      defaultIntervalKm: 40000,
      defaultIntervalMonths: 24,
      icon: "droplet",
    },
    {
      name: "Neumáticos",
      category: "Neumáticos",
      defaultIntervalKm: 50000,
      defaultIntervalMonths: 36,
      icon: "circle",
    },
    {
      name: "Rotación de neumáticos",
      category: "Neumáticos",
      defaultIntervalKm: 10000,
      defaultIntervalMonths: 6,
      icon: "rotate-cw",
    },
    {
      name: "Alineación",
      category: "Neumáticos",
      defaultIntervalKm: 15000,
      defaultIntervalMonths: 12,
      icon: "align-center",
    },
    {
      name: "Balanceo",
      category: "Neumáticos",
      defaultIntervalKm: 15000,
      defaultIntervalMonths: 12,
      icon: "trending-up",
    },
    {
      name: "Batería",
      category: "Eléctrico",
      defaultIntervalKm: null,
      defaultIntervalMonths: 36,
      icon: "battery",
    },
    {
      name: "Refrigerante",
      category: "Motor",
      defaultIntervalKm: 40000,
      defaultIntervalMonths: 24,
      icon: "thermometer",
    },
    {
      name: "Transmisión",
      category: "Motor",
      defaultIntervalKm: 60000,
      defaultIntervalMonths: 36,
      icon: "settings",
    },
    {
      name: "Correa de distribución",
      category: "Motor",
      defaultIntervalKm: 100000,
      defaultIntervalMonths: 60,
      icon: "link",
    },
    {
      name: "Inspección general",
      category: "General",
      defaultIntervalKm: 10000,
      defaultIntervalMonths: 12,
      icon: "clipboard",
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
};

export default db;
