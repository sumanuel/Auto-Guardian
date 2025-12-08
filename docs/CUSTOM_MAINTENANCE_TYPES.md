# Tipos de Mantenimiento Personalizados

## Descripción General

Auto-Guardian ahora permite crear, modificar y eliminar tipos de mantenimiento personalizados. Los iconos se almacenan en la base de datos SQLite en la tabla `maintenance_types` y se cargan dinámicamente.

## Tabla de Base de Datos

```sql
CREATE TABLE IF NOT EXISTS maintenance_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  category TEXT,
  defaultIntervalKm INTEGER,
  defaultIntervalMonths INTEGER,
  icon TEXT NOT NULL DEFAULT 'construct-outline'
)
```

## Funciones Disponibles

### `getMaintenanceTypes()`

Obtiene todos los tipos de mantenimiento disponibles.

```javascript
import { getMaintenanceTypes } from "../services/maintenanceService";

const types = getMaintenanceTypes();
// Retorna: [
//   { id: 1, name: "Cambio de aceite", category: "Motor", defaultIntervalKm: 5000, defaultIntervalMonths: 6, icon: "water-outline" },
//   ...
// ]
```

### `getMaintenanceTypeByName(name)`

Obtiene un tipo específico por su nombre.

```javascript
import { getMaintenanceTypeByName } from "../services/maintenanceService";

const type = getMaintenanceTypeByName("Cambio de aceite");
// Retorna: { id: 1, name: "Cambio de aceite", category: "Motor", ... }
```

### `createMaintenanceType(typeData)`

Crea un nuevo tipo de mantenimiento personalizado.

```javascript
import { createMaintenanceType } from "../services/maintenanceService";
import { reloadMaintenanceIcons } from "../utils/maintenanceIcons";

const newTypeId = createMaintenanceType({
  name: "Lavado de inyectores",
  category: "Motor",
  defaultIntervalKm: 30000,
  defaultIntervalMonths: 12,
  icon: "water-outline",
});

// IMPORTANTE: Recargar cache de iconos después de crear
reloadMaintenanceIcons();
```

### `updateMaintenanceType(id, typeData)`

Actualiza un tipo de mantenimiento existente.

```javascript
import { updateMaintenanceType } from "../services/maintenanceService";
import { reloadMaintenanceIcons } from "../utils/maintenanceIcons";

updateMaintenanceType(15, {
  name: "Lavado de inyectores",
  category: "Motor",
  defaultIntervalKm: 40000,
  defaultIntervalMonths: 18,
  icon: "flask-outline",
});

// IMPORTANTE: Recargar cache de iconos después de actualizar
reloadMaintenanceIcons();
```

### `deleteMaintenanceType(id)`

Elimina un tipo de mantenimiento personalizado.

```javascript
import {
  deleteMaintenanceType,
  isMaintenanceTypeInUse,
} from "../services/maintenanceService";
import { reloadMaintenanceIcons } from "../utils/maintenanceIcons";

// Verificar si está en uso antes de eliminar
if (!isMaintenanceTypeInUse("Lavado de inyectores")) {
  deleteMaintenanceType(15);

  // IMPORTANTE: Recargar cache de iconos después de eliminar
  reloadMaintenanceIcons();
} else {
  alert(
    "No se puede eliminar: el tipo está siendo usado en mantenimientos existentes"
  );
}
```

### `isMaintenanceTypeInUse(typeName)`

Verifica si un tipo de mantenimiento está siendo usado en algún registro.

```javascript
import { isMaintenanceTypeInUse } from "../services/maintenanceService";

const inUse = isMaintenanceTypeInUse("Cambio de aceite");
// Retorna: true/false
```

## Sistema de Iconos

### Carga Dinámica

Los iconos se cargan automáticamente desde la base de datos al llamar `getMaintenanceIcon()`:

```javascript
import { getMaintenanceIcon } from "../utils/maintenanceIcons";

const icon = getMaintenanceIcon("Cambio de aceite");
// Retorna: "water-outline"
```

### Cache de Iconos

Los iconos se cachean en memoria para mejorar el rendimiento. El cache se limpia automáticamente al llamar `reloadMaintenanceIcons()`.

### Iconos de Respaldo

Si falla la carga desde la base de datos, se utilizan iconos de respaldo predefinidos para los tipos estándar.

## Iconos Disponibles (Ionicons)

Lista de iconos comúnmente usados:

- **Motor**: `cog-outline`, `water-outline`, `flash-outline`, `funnel-outline`
- **Frenos**: `hardware-chip-outline`, `disc-outline`
- **Neumáticos**: `ellipse-outline`, `footsteps-outline`
- **Suspensión**: `git-compare-outline`, `git-network-outline`
- **Eléctrico**: `flash-outline`, `battery-charging-outline`, `bulb-outline`
- **Líquidos**: `water-outline`, `droplet-outline`
- **General**: `construct-outline`, `build-outline`, `search-outline`, `settings-outline`

Ver más en: https://ionic.io/ionicons

## Ejemplo Completo: Pantalla de Gestión

```javascript
import React, { useState, useEffect } from "react";
import { View, Text, FlatList, Button, TextInput, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  getMaintenanceTypes,
  createMaintenanceType,
  updateMaintenanceType,
  deleteMaintenanceType,
  isMaintenanceTypeInUse,
} from "../services/maintenanceService";
import { reloadMaintenanceIcons } from "../utils/maintenanceIcons";

export default function ManageMaintenanceTypesScreen() {
  const [types, setTypes] = useState([]);
  const [newType, setNewType] = useState({
    name: "",
    category: "",
    defaultIntervalKm: "",
    defaultIntervalMonths: "",
    icon: "construct-outline",
  });

  useEffect(() => {
    loadTypes();
  }, []);

  const loadTypes = () => {
    const allTypes = getMaintenanceTypes();
    setTypes(allTypes);
  };

  const handleCreate = () => {
    try {
      createMaintenanceType({
        name: newType.name,
        category: newType.category || null,
        defaultIntervalKm: newType.defaultIntervalKm
          ? parseInt(newType.defaultIntervalKm)
          : null,
        defaultIntervalMonths: newType.defaultIntervalMonths
          ? parseInt(newType.defaultIntervalMonths)
          : null,
        icon: newType.icon,
      });

      reloadMaintenanceIcons(); // IMPORTANTE
      loadTypes();

      // Limpiar formulario
      setNewType({
        name: "",
        category: "",
        defaultIntervalKm: "",
        defaultIntervalMonths: "",
        icon: "construct-outline",
      });

      Alert.alert("Éxito", "Tipo de mantenimiento creado");
    } catch (error) {
      Alert.alert("Error", "No se pudo crear el tipo de mantenimiento");
    }
  };

  const handleDelete = (id, name) => {
    if (isMaintenanceTypeInUse(name)) {
      Alert.alert(
        "No se puede eliminar",
        "Este tipo está siendo usado en mantenimientos existentes"
      );
      return;
    }

    Alert.alert("Confirmar", `¿Eliminar "${name}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => {
          deleteMaintenanceType(id);
          reloadMaintenanceIcons(); // IMPORTANTE
          loadTypes();
        },
      },
    ]);
  };

  return (
    <View>
      <Text>Crear Nuevo Tipo</Text>
      <TextInput
        placeholder="Nombre"
        value={newType.name}
        onChangeText={(text) => setNewType({ ...newType, name: text })}
      />
      <TextInput
        placeholder="Categoría"
        value={newType.category}
        onChangeText={(text) => setNewType({ ...newType, category: text })}
      />
      <TextInput
        placeholder="Intervalo KM"
        keyboardType="numeric"
        value={newType.defaultIntervalKm}
        onChangeText={(text) =>
          setNewType({ ...newType, defaultIntervalKm: text })
        }
      />
      <TextInput
        placeholder="Intervalo Meses"
        keyboardType="numeric"
        value={newType.defaultIntervalMonths}
        onChangeText={(text) =>
          setNewType({ ...newType, defaultIntervalMonths: text })
        }
      />
      <TextInput
        placeholder="Icono (ej: water-outline)"
        value={newType.icon}
        onChangeText={(text) => setNewType({ ...newType, icon: text })}
      />
      <Button title="Crear" onPress={handleCreate} />

      <FlatList
        data={types}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View>
            <Ionicons name={item.icon} size={24} />
            <Text>{item.name}</Text>
            <Text>Categoría: {item.category || "N/A"}</Text>
            <Button
              title="Eliminar"
              onPress={() => handleDelete(item.id, item.name)}
            />
          </View>
        )}
      />
    </View>
  );
}
```

## Flujo Recomendado

1. **Crear tipo personalizado** → Llamar `createMaintenanceType()` → Llamar `reloadMaintenanceIcons()`
2. **Actualizar tipo** → Llamar `updateMaintenanceType()` → Llamar `reloadMaintenanceIcons()`
3. **Eliminar tipo** → Verificar con `isMaintenanceTypeInUse()` → Llamar `deleteMaintenanceType()` → Llamar `reloadMaintenanceIcons()`

## Notas Importantes

⚠️ **SIEMPRE** llamar `reloadMaintenanceIcons()` después de crear, actualizar o eliminar tipos de mantenimiento para refrescar el cache de iconos.

⚠️ **NO** eliminar tipos que están siendo usados. Usar `isMaintenanceTypeInUse()` primero.

⚠️ Los nombres de tipos deben ser **únicos** (constraint en base de datos).

⚠️ Usar nombres de iconos válidos de Ionicons (visitar https://ionic.io/ionicons).
