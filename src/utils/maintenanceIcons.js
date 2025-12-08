// Iconos estandarizados para tipos de mantenimiento
// Los iconos se obtienen dinámicamente de la base de datos (tabla maintenance_types)
// Este archivo proporciona iconos de respaldo si no se encuentra en la BD

import { getMaintenanceTypes } from "../services/maintenanceService";

// Cache para los iconos
let iconCache = null;

// Cargar iconos desde la base de datos
const loadIconsFromDatabase = () => {
  if (iconCache) return iconCache;

  try {
    const types = getMaintenanceTypes();
    const icons = {};

    types.forEach((type) => {
      if (type.name && type.icon) {
        icons[type.name] = type.icon;
      }
    });

    iconCache = icons;
    return icons;
  } catch (error) {
    console.error("Error cargando iconos desde BD:", error);
    return getFallbackIcons();
  }
};

// Iconos de respaldo si falla la carga desde BD
const getFallbackIcons = () => ({
  // Motor
  "Cambio de aceite": "water-outline",
  "Filtro de aceite": "funnel-outline",
  "Filtro de aire": "construct-outline",
  Bujías: "flash-outline",
  Refrigerante: "water-outline",
  Transmisión: "cog-outline",
  "Correa de distribución": "git-branch-outline",

  // Frenos
  "Pastillas de freno": "hardware-chip-outline",
  "Líquido de frenos": "water-outline",
  Frenos: "hardware-chip-outline",

  // Neumáticos
  Neumáticos: "ellipse-outline",
  "Rotación de neumáticos": "refresh-outline",
  Alineación: "options-outline",
  Balanceo: "options-outline",
  "Alineación y balanceo": "options-outline",
  Llantas: "ellipse-outline",

  // Eléctrico
  Batería: "battery-charging-outline",
  "Sistema eléctrico": "flash-outline",

  // Otros
  Suspensión: "git-compare-outline",
  "Sistema de refrigeración": "thermometer-outline",
  "Inspección general": "search-outline",
  Filtros: "funnel-outline",
});

// Obtener icono para un tipo de mantenimiento
export const getMaintenanceIcon = (type) => {
  const icons = loadIconsFromDatabase();
  return icons[type] || "construct-outline";
};

// Forzar recarga de iconos (útil después de crear tipos personalizados)
export const reloadMaintenanceIcons = () => {
  iconCache = null;
  loadIconsFromDatabase();
};

// Iconos para categorías
export const getCategoryIcon = (category) => {
  const icons = {
    Motor: "cog-outline",
    Frenos: "hardware-chip-outline",
    Neumáticos: "ellipse-outline",
    Suspensión: "git-compare-outline",
    Transmisión: "cog-outline",
    Eléctrico: "flash-outline",
    "Sistema eléctrico": "flash-outline",
    "Sistema de refrigeración": "thermometer-outline",
    Filtros: "funnel-outline",
    General: "search-outline",
  };

  return icons[category] || "construct-outline";
};
