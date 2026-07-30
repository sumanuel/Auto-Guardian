# Arquitectura del Proyecto Auto-Guardian

**Última actualización:** 2026-07-29

## Índice

1. [Visión General](#visión-general)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Arquitectura de Capas](#arquitectura-de-capas)
4. [Estructura de Directorios](#estructura-de-directorios)
5. [Flujo de Datos](#flujo-de-datos)
6. [Gestión de Estado](#gestión-de-estado)
7. [Persistencia de Datos](#persistencia-de-datos)
8. [Navegación](#navegación)
9. [Notificaciones](#notificaciones)
10. [Patrones de Diseño](#patrones-de-diseño)
11. [Seguridad y Privacidad](#seguridad-y-privacidad)

---

## Visión General

Auto-Guardian es una aplicación móvil nativa construida con React Native y Expo, diseñada para la gestión personal de vehículos. La arquitectura sigue un patrón **cliente único con persistencia local**, sin dependencia de servicios backend externos.

### Principios Arquitectónicos

- **Offline-first**: Toda la funcionalidad está disponible sin conexión
- **Datos locales**: SQLite como única fuente de verdad
- **Modularidad**: Separación clara de responsabilidades por capas
- **Escalabilidad**: Estructura preparada para crecimiento funcional
- **Mantenibilidad**: Código organizado por dominio funcional

---

## Stack Tecnológico

### Frontend

| Tecnología           | Versión | Propósito               |
| -------------------- | ------- | ----------------------- |
| **Expo**             | SDK 54  | Framework de desarrollo |
| **React**            | 19.1.0  | Librería UI             |
| **React Native**     | 0.81.5  | Runtime móvil           |
| **React Navigation** | 7.x     | Sistema de navegación   |

### Persistencia

| Tecnología           | Versión | Propósito                  |
| -------------------- | ------- | -------------------------- |
| **expo-sqlite**      | 16.0.10 | Base de datos local        |
| **AsyncStorage**     | 2.2.0   | Almacenamiento clave-valor |
| **expo-file-system** | 19.0.22 | Sistema de archivos        |

### Funcionalidades Nativas

| Tecnología               | Propósito                          |
| ------------------------ | ---------------------------------- |
| **expo-notifications**   | Notificaciones locales programadas |
| **expo-image-picker**    | Selección de imágenes              |
| **expo-document-picker** | Selección de archivos              |
| **expo-sharing**         | Compartir archivos                 |
| **expo-haptics**         | Feedback táctil                    |

### Utilidades

| Tecnología                       | Propósito              |
| -------------------------------- | ---------------------- |
| **date-fns**                     | Manipulación de fechas |
| **@expo/vector-icons**           | Iconografía            |
| **react-native-gesture-handler** | Gestos táctiles        |
| **react-native-reanimated**      | Animaciones            |

---

## Arquitectura de Capas

```
┌─────────────────────────────────────────────┐
│          PRESENTACIÓN (UI Layer)            │
│  Screens, Components, Navigation, Theme     │
└─────────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────────┐
│      LÓGICA DE NEGOCIO (Business Layer)     │
│     Context Providers, Hooks, Services      │
└─────────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────────┐
│     PERSISTENCIA (Data Access Layer)        │
│    SQLite, AsyncStorage, File System        │
└─────────────────────────────────────────────┘
```

### Capa de Presentación

**Responsabilidad**: Renderizado de UI, interacción con usuario, navegación

**Componentes principales**:

- `src/screens/`: 30+ pantallas funcionales
- `src/components/`: Componentes reutilizables
- `src/navigation/`: Configuración de navegación
- `src/context/ThemeContext.js`: Gestión de temas

### Capa de Lógica de Negocio

**Responsabilidad**: Reglas de negocio, transformación de datos, orquestación

**Componentes principales**:

- `src/services/`: Servicios por dominio (vehicleService, maintenanceService, etc.)
- `src/context/`: Proveedores de estado global (AppContext, AppSettingsContext)
- `src/hooks/`: Custom hooks reutilizables
- `src/utils/`: Utilidades y helpers

### Capa de Persistencia

**Responsabilidad**: Acceso a datos, persistencia, migraciones

**Componentes principales**:

- `src/services/database.js`: Inicialización y esquema SQLite
- `src/database/notifications.js`: Base de datos de notificaciones
- `src/services/backup/`: Sistema de respaldo/restauración
- `AsyncStorage`: Configuración y preferencias

---

## Estructura de Directorios

```
Auto-Guardian/
│
├── App.js                          # Punto de entrada, bootstrap
├── index.js                        # Registro de componente raíz
├── app.json                        # Configuración Expo
├── package.json                    # Dependencias
│
├── assets/                         # Recursos estáticos
│   ├── images/
│   └── fonts/
│
├── src/
│   ├── components/                 # Componentes reutilizables
│   │   ├── common/                # Componentes genéricos
│   │   ├── forms/                 # Componentes de formularios
│   │   └── cards/                 # Componentes de tarjetas
│   │
│   ├── constants/                  # Constantes de la aplicación
│   │   ├── colors.js
│   │   └── maintenanceTypes.js
│   │
│   ├── context/                    # Context Providers
│   │   ├── AppContext.js          # Estado global de app
│   │   ├── AppSettingsContext.js  # Configuración global
│   │   └── ThemeContext.js        # Tema (light/dark)
│   │
│   ├── data/                       # Datos semilla y fixtures
│   │
│   ├── database/                   # Esquemas de base de datos
│   │   └── notifications.js       # DB de notificaciones
│   │
│   ├── hooks/                      # Custom React Hooks
│   │
│   ├── navigation/                 # Configuración de navegación
│   │   └── AppNavigator.js        # Navegador principal
│   │
│   ├── screens/                    # Pantallas de la aplicación
│   │   ├── HomeScreen.js
│   │   ├── VehicleDetailScreen.js
│   │   ├── MaintenanceHistoryScreen.js
│   │   ├── DataManagementScreen.js
│   │   └── ... (30+ pantallas)
│   │
│   ├── services/                   # Servicios de negocio
│   │   ├── database.js            # DB principal
│   │   ├── vehicleService.js      # CRUD vehículos
│   │   ├── maintenanceService.js  # CRUD mantenimientos
│   │   ├── expenseService.js      # CRUD gastos
│   │   ├── documentService.js     # CRUD documentos
│   │   ├── notificationService.js # Gestión notificaciones
│   │   └── backup/                # Sistema de respaldo
│   │       └── backupService.js
│   │
│   └── utils/                      # Utilidades y helpers
│       ├── dateUtils.js
│       ├── formatters.js
│       └── validators.js
│
├── docs/                           # Documentación
│   └── CUSTOM_MAINTENANCE_TYPES.md
│
└── scripts/                        # Scripts de utilidad
    └── reset-project.js
```

---

## Flujo de Datos

### Flujo Unidireccional

```
Usuario → UI Component → Service → Database → Service → Context → UI Component
```

### Ejemplo: Agregar un Vehículo

```javascript
// 1. Usuario completa formulario en AddVehicleScreen
// 2. Component llama al service
import { addVehicle } from '../services/vehicleService';

const handleSubmit = async () => {
  const vehicleData = { brand, model, year, ... };

  // 3. Service persiste en SQLite
  const vehicleId = await addVehicle(vehicleData);

  // 4. Service retorna ID del nuevo registro
  // 5. Component actualiza UI o navega
  navigation.goBack();
};

// 6. HomeScreen (con useEffect) recarga datos
// 7. Context actualiza estado global si es necesario
```

### Sincronización de Estado

Auto-Guardian usa **pull-based updates** en lugar de subscripciones reactivas:

```javascript
useEffect(() => {
  const fetchData = async () => {
    const vehicles = await getVehicles();
    setVehicles(vehicles);
  };

  // Se ejecuta al montar y cuando se enfoca la pantalla
  fetchData();

  const unsubscribe = navigation.addListener("focus", fetchData);
  return unsubscribe;
}, [navigation]);
```

---

## Gestión de Estado

### Estado Local (Component State)

```javascript
const [vehicles, setVehicles] = useState([]);
const [loading, setLoading] = useState(false);
```

**Uso**: Estado específico de UI, formularios, loading states

### Estado Global (Context API)

#### AppContext

```javascript
const AppContext = createContext();

// Estado global de aplicación
- vehicles: Lista de vehículos
- selectedVehicle: Vehículo activo
- refreshVehicles: Función para recargar
```

#### AppSettingsContext

```javascript
// Configuración y preferencias
- currencySymbol: Moneda configurada
- currencyName: Nombre de moneda
- isLoaded: Estado de carga
- checkForUpdate: Verificar actualizaciones
```

#### ThemeContext

```javascript
// Tema visual
- isDarkMode: Boolean tema oscuro
- colors: Paleta de colores actual
- toggleTheme: Cambiar tema
```

### AsyncStorage (Persistent State)

```javascript
// Configuración persistente
- onboardingCompleted: Boolean
- currencySymbol: String
- currencyName: String
- theme: 'light' | 'dark'
```

---

## Persistencia de Datos

### Esquema SQLite

#### Tabla: vehicles

```sql
CREATE TABLE IF NOT EXISTS vehicles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  licensePlate TEXT,
  vin TEXT,
  currentKm INTEGER DEFAULT 0,
  photoUri TEXT,
  color TEXT,
  fuelType TEXT,
  transmissionType TEXT,
  notes TEXT,
  purchaseDate TEXT,
  purchasePrice REAL,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
)
```

#### Tabla: maintenances

```sql
CREATE TABLE IF NOT EXISTS maintenances (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vehicleId INTEGER NOT NULL,
  type TEXT NOT NULL,
  date TEXT NOT NULL,
  km INTEGER,
  cost REAL,
  notes TEXT,
  nextDueKm INTEGER,
  nextDueDate TEXT,
  completed INTEGER DEFAULT 1,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicleId) REFERENCES vehicles(id) ON DELETE CASCADE
)
```

#### Tabla: expenses

```sql
CREATE TABLE IF NOT EXISTS expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vehicleId INTEGER NOT NULL,
  type TEXT NOT NULL,
  amount REAL NOT NULL,
  date TEXT NOT NULL,
  description TEXT,
  category TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicleId) REFERENCES vehicles(id) ON DELETE CASCADE
)
```

#### Tabla: vehicle_documents

```sql
CREATE TABLE IF NOT EXISTS vehicle_documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vehicleId INTEGER NOT NULL,
  documentType TEXT NOT NULL,
  expirationDate TEXT,
  fileUri TEXT,
  notes TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicleId) REFERENCES vehicles(id) ON DELETE CASCADE
)
```

#### Tabla: contacts

```sql
CREATE TABLE IF NOT EXISTS contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'mechanic', 'insurance', 'other'
  phone TEXT,
  email TEXT,
  address TEXT,
  notes TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
)
```

#### Tabla: notifications

```sql
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  vehicleId INTEGER,
  maintenanceId INTEGER,
  documentId INTEGER,
  triggerHour INTEGER DEFAULT 9,
  triggerMinute INTEGER DEFAULT 0,
  daysBeforeExpiration INTEGER DEFAULT 7,
  isActive INTEGER DEFAULT 1,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicleId) REFERENCES vehicles(id) ON DELETE CASCADE
)
```

### Patrón Service/Repository

Todos los servicios siguen el mismo patrón:

```javascript
// Ejemplo: vehicleService.js

// CREATE
export const addVehicle = async (vehicleData) => {
  const result = db.runSync(
    `INSERT INTO vehicles (...) VALUES (...)`,
    [values]
  );
  return result.lastInsertRowId;
};

// READ
export const getVehicles = async () => {
  return db.getAllSync(`SELECT * FROM vehicles ORDER BY id DESC`);
};

export const getVehicleById = async (id) => {
  return db.getFirstSync(`SELECT * FROM vehicles WHERE id = ?`, [id]);
};

// UPDATE
export const updateVehicle = async (id, vehicleData) => {
  db.runSync(`UPDATE vehicles SET ... WHERE id = ?`, [..., id]);
};

// DELETE
export const deleteVehicle = async (id) => {
  db.runSync(`DELETE FROM vehicles WHERE id = ?`, [id]);
};
```

### Sistema de Respaldo

```javascript
// Estructura del archivo de respaldo
{
  "timestamp": "2026-07-29T10:30:00.000Z",
  "version": "1.0",
  "app": "Auto Guardian",
  "tables": {
    "vehicles": {
      "tableName": "vehicles",
      "rows": [...]
    },
    "maintenances": {
      "tableName": "maintenances",
      "rows": [...]
    },
    // ... otras tablas
  }
}
```

**Proceso de exportación:**

1. Leer todas las filas de cada tabla
2. Serializar a JSON
3. Guardar en sistema de archivos con timestamp
4. Ofrecer compartir vía sistema operativo

**Proceso de importación:**

1. Seleccionar archivo de respaldo
2. Validar estructura JSON
3. Limpiar todas las tablas
4. Insertar filas desde respaldo
5. Confirmar operación exitosa

---

## Navegación

### Arquitectura de Navegación

Auto-Guardian usa **React Navigation v7** con navegación híbrida:

```
Root Navigator (Stack)
│
├── OnboardingScreen (condicional)
├── CurrencySetupScreen (condicional)
│
└── Main App (Bottom Tabs)
    ├── Tab: Inicio (Stack)
    │   ├── HomeScreen
    │   ├── VehicleDetailScreen
    │   ├── UpdateKmScreen
    │   ├── AddVehicleScreen
    │   └── InvestmentDetailScreen
    │
    ├── Tab: Mantenimiento (Stack)
    │   ├── MaintenanceHistoryScreen
    │   ├── AddMaintenanceScreen
    │   └── AddRepairScreen
    │
    ├── Tab: Documentos (Stack)
    │   ├── DocumentsScreen
    │   ├── VehicleDocumentsScreen
    │   └── AddDocumentScreen
    │
    ├── Tab: Alertas (Stack)
    │   ├── NotificationsScreen
    │   └── AlertSummaryScreen
    │
    └── Tab: Más (Stack)
        ├── MoreScreen
        ├── SettingsScreen
        ├── StatsScreen
        ├── ContactsScreen
        ├── CategoriesScreen
        ├── DocumentTypesScreen
        ├── DataManagementScreen
        ├── TipsScreen
        ├── LearnMoreScreen
        └── AboutScreen
```

### Deep Linking

Configurado en `app.json`:

```json
{
  "scheme": "autoguardian",
  "android": {
    "intentFilters": [
      {
        "action": "VIEW",
        "data": [{ "scheme": "autoguardian" }]
      }
    ]
  }
}
```

---

## Notificaciones

### Sistema de Notificaciones Locales

Auto-Guardian usa **expo-notifications** para alertas programadas:

#### Tipos de Notificaciones

1. **Mantenimiento próximo** (por kilometraje)
2. **Mantenimiento próximo** (por fecha)
3. **Documento por vencer**
4. **Recordatorio diario general**

#### Programación

```javascript
// notificationService.js

export const scheduleAllNotifications = async (getAllNotifications) => {
  // 1. Cancelar notificaciones existentes
  await Notifications.cancelAllScheduledNotificationsAsync();

  // 2. Obtener configuración de notificaciones
  const notifications = await getAllNotifications();

  // 3. Programar cada notificación activa
  for (const notification of notifications) {
    if (notification.isActive) {
      await scheduleNotification(notification);
    }
  }
};

const scheduleNotification = async (notification) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: notification.title,
      body: notification.body,
      data: { vehicleId: notification.vehicleId },
    },
    trigger: {
      hour: notification.triggerHour,
      minute: notification.triggerMinute,
      repeats: true,
    },
  });
};
```

#### Permisos

```javascript
// App.js

const { status } = await Notifications.requestPermissionsAsync();
if (status !== "granted") {
  console.log("Permiso de notificaciones denegado");
}
```

---

## Patrones de Diseño

### 1. Service Layer Pattern

Todos los accesos a datos pasan por servicios:

```javascript
// ❌ NO hacer
db.runSync("INSERT INTO vehicles ...");

// ✅ SÍ hacer
import { addVehicle } from "../services/vehicleService";
await addVehicle(vehicleData);
```

### 2. Provider Pattern (Context API)

Estado global accesible desde cualquier componente:

```javascript
// AppContext.js
export const AppProvider = ({ children }) => {
  const [vehicles, setVehicles] = useState([]);
  // ...
  return (
    <AppContext.Provider value={{ vehicles, ... }}>
      {children}
    </AppContext.Provider>
  );
};

// En componentes
const { vehicles } = useContext(AppContext);
```

### 3. Custom Hooks Pattern

Lógica reutilizable encapsulada:

```javascript
const useVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    const data = await getVehicles();
    setVehicles(data);
    setLoading(false);
  };

  return { vehicles, loading, refresh: loadVehicles };
};
```

### 4. Render Props Pattern

Componentes flexibles con control de renderizado:

```javascript
<DataLoader
  loadData={getVehicles}
  render={(vehicles) => <VehicleList vehicles={vehicles} />}
/>
```

### 5. Compound Components

Componentes relacionados que trabajan juntos:

```javascript
<Card>
  <Card.Header title="Vehículo" />
  <Card.Body>...</Card.Body>
  <Card.Footer>...</Card.Footer>
</Card>
```

---

## Seguridad y Privacidad

### Datos Locales

- **Sin backend**: Todos los datos permanecen en el dispositivo
- **Sin registro de usuario**: No hay cuentas ni autenticación
- **Privacidad por diseño**: Cero telemetría de datos personales

### Permisos de la App

| Permiso            | Propósito                    | Plataforma  |
| ------------------ | ---------------------------- | ----------- |
| **Notificaciones** | Alertas programadas          | iOS/Android |
| **Cámara**         | Tomar fotos de vehículos     | iOS/Android |
| **Galería**        | Seleccionar fotos existentes | iOS/Android |
| **Almacenamiento** | Guardar/cargar respaldos     | Android     |

### Respaldo de Datos

- **Exportación manual**: Usuario controla cuándo y dónde
- **Sin cifrado**: Archivo JSON plano (usuario puede cifrar externamente)
- **Recomendación**: Almacenar respaldos en nube personal (Drive, Dropbox, etc.)

### Actualizaciones

- **OTA (Over-the-Air)**: Vía Expo Updates
- **Verificación de versión**: Chequeo al arranque contra servidor JSON
- **Store Updates**: Notificación de nueva versión en tiendas

---

## Consideraciones de Rendimiento

### Optimizaciones Implementadas

1. **FlatList virtualización**: Listas largas de vehículos/mantenimientos
2. **useMemo/useCallback**: Prevenir re-renders innecesarios
3. **Imágenes optimizadas**: expo-image con caché automático
4. **Consultas indexadas**: Índices en columnas frecuentemente consultadas
5. **Lazy loading**: Navegación con carga diferida de pantallas

### Límites Conocidos

- **SQLite**: Apropiado hasta ~100,000 registros totales
- **Imágenes**: Almacenadas como URIs locales (sin optimización de tamaño)
- **Respaldos**: JSON sin compresión (archivos grandes para muchos datos)

---

## Extensibilidad

### Puntos de Extensión

1. **Nuevos tipos de mantenimiento**: `src/constants/maintenanceTypes.js`
2. **Nuevos tipos de documento**: `src/constants/documentTypes.js`
3. **Nuevas pantallas**: `src/screens/` + actualizar `AppNavigator.js`
4. **Nuevos servicios**: Seguir patrón en `src/services/`
5. **Nuevas notificaciones**: Extender `notificationService.js`

### Roadmap Arquitectónico

- [ ] Migración a TypeScript para type safety
- [ ] Implementar tests unitarios (Jest)
- [ ] Implementar tests E2E (Detox)
- [ ] Compresión de respaldos (gzip)
- [ ] Cifrado opcional de respaldos
- [ ] Sincronización con nube (Firebase/Supabase)
- [ ] Compartir vehículos entre usuarios (multi-device)

---

## Referencias

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
- [SQLite](https://www.sqlite.org/docs.html)

---

**Última revisión**: 2026-07-29  
**Versión del documento**: 1.0.0
