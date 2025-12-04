# Auto Guardian 

Aplicación móvil para llevar control y seguimiento del mantenimiento de tus vehículos.

## Características

-  Gestión de múltiples vehículos
-  Registro de mantenimientos realizados
-  Historial completo de servicios
-  Control de gastos por vehículo
-  Próximos servicios programados
-  Adjuntar fotos de recibos/facturas
-  Estadísticas y análisis

## Tecnologías

- React Native
- Expo
- React Navigation
- SQLite (almacenamiento local)
- Context API (estado global)

## Instalación

1. Asegúrate de tener Node.js instalado
2. Instala Expo CLI globalmente (si no lo tienes):
   ```
   npm install -g expo-cli
   ```

3. Instala las dependencias:
   ```
   npm install
   ```

## Ejecutar la aplicación

### Iniciar el servidor de desarrollo:
```
npm start
```

### Opciones de ejecución:

- Presiona 'a' para abrir en Android
- Presiona 'i' para abrir en iOS (solo en Mac)
- Escanea el código QR con la app Expo Go en tu teléfono

### Ejecutar directamente:
```
npm run android  # Para Android
npm run ios      # Para iOS
```

## Estructura del Proyecto

```
src/
   screens/           # Pantallas de la app
      HomeScreen.js
      VehicleDetailScreen.js
      AddVehicleScreen.js
      AddMaintenanceScreen.js
      MaintenanceHistoryScreen.js
      UpdateKmScreen.js
   components/        # Componentes reutilizables
      common/
      vehicles/
      maintenance/
   navigation/        # Configuración de navegación
      AppNavigator.js
   context/           # Context API
      AppContext.js
   services/          # Lógica de negocio y base de datos
      database.js
      vehicleService.js
      maintenanceService.js
   utils/             # Utilidades
      dateUtils.js
      formatUtils.js
   data/              # Constantes y datos
       constants.js
```

## Funcionalidades Implementadas

###  Pantallas Principales
- [x] HomeScreen - Lista de vehículos
- [x] VehicleDetailScreen - Detalle de vehículo con próximos mantenimientos
- [x] AddVehicleScreen - Agregar/Editar vehículo
- [x] AddMaintenanceScreen - Registrar mantenimiento
- [x] MaintenanceHistoryScreen - Historial completo
- [x] UpdateKmScreen - Actualizar kilometraje

###  Base de Datos SQLite
- [x] Tabla de vehículos
- [x] Tabla de mantenimientos
- [x] Tabla de tipos de mantenimiento
- [x] Relaciones y cascadas

###  Funcionalidades Core
- [x] CRUD completo de vehículos
- [x] CRUD completo de mantenimientos
- [x] Cálculo de próximos servicios
- [x] Estadísticas básicas
- [x] Formato de fechas y monedas
- [x] Subir fotos desde galería

## Próximas Mejoras

- [ ] Notificaciones push para recordatorios
- [ ] Exportar datos a PDF
- [ ] Gráficos de gastos
- [ ] Búsqueda y filtros avanzados
- [ ] Modo oscuro
- [ ] Sincronización en la nube
- [ ] Compartir información del vehículo

## Autor

Desarrollado con  para mantener tus vehículos en perfecto estado

## Licencia

MIT
