# Contexto del proyecto: Auto-Guardian

Ultima actualizacion: 2026-06-29

## Resumen rapido

Auto-Guardian es una app Expo/React Native para gestion personal de vehiculos. El foco funcional actual combina registro de unidades, mantenimientos, reparaciones, gastos, documentos, alertas y respaldo de datos locales.

El proyecto ya tiene bastante superficie funcional. Para futuras sesiones conviene asumir que no es un template Expo, aunque el README raiz todavia conserva contenido generico del scaffold inicial.

## Stack y arquitectura

- Frontend movil: Expo SDK 54, React 19, React Native 0.81.
- Navegacion: React Navigation.
- Persistencia local: SQLite.
- Estado global: contextos en src/context.
- Notificaciones: expo-notifications.
- Archivos y respaldos: expo-file-system, expo-document-picker, expo-sharing.

## Punto de entrada y flujo base

- App principal: App.js
- Navegacion principal: src/navigation/AppNavigator.js
- Contextos relevantes: src/context
- Base de datos local y notificaciones: src/database y src/services

El arranque hace cuatro cosas importantes:

1. Verifica onboarding en AsyncStorage.
2. Inicializa la base principal.
3. Inicializa la base o tabla de notificaciones.
4. Programa notificaciones y decide si primero debe mostrarse configuracion de moneda.

## Modulos funcionales principales

- Vehiculos: alta, detalle, kilometraje, historial y documentos.
- Mantenimiento y reparaciones: registro, historial y seguimiento.
- Gastos e inversiones: gastos por vehiculo y detalle financiero.
- Documentos: tipos, vencimientos y gestion por unidad.
- Alertas y notificaciones: resumen y avisos programados.
- Configuracion: onboarding, moneda, categorias y administracion de datos.
- Respaldo de datos: exportacion e importacion JSON desde DataManagementScreen.

## Pantallas clave

- HomeScreen
- VehicleDetailScreen
- MaintenanceHistoryScreen
- DocumentsScreen
- NotificationsScreen
- StatsScreen
- SettingsScreen
- DataManagementScreen
- OnboardingScreen

## Carpetas que conviene leer primero

- src/screens
- src/context
- src/database
- src/services
- src/utils

## Comandos utiles

```bash
npm install
npm run start
npm run android
npm run web
npm run lint
```

## Estado actual y notas operativas

- El proyecto ya tiene flujo de onboarding implementado.
- La gestion de respaldos existe y esta inspirada en patrones reutilizados desde tienda-app.
- Hay soporte de fotos de vehiculos con migracion a almacenamiento propio de la app para evitar perdida por URIs temporales.
- Hubo observaciones previas de compatibilidad Expo en app.json y dependencias, por lo que conviene validar con expo-doctor cuando se toquen paquetes.

## Riesgos o deuda visible

- README.md raiz desactualizado respecto a la app real.
- Parte del conocimiento funcional esta repartido entre README_FUNCIONALIDADES.md, README_APP.md, CHANGELOG.md y notas del repo.
- Las advertencias de Android grandes pantallas y edge-to-edge dependieron en parte de versiones upstream, no solo de codigo JS.

## Recomendacion para futuras sesiones

Antes de editar, leer en este orden:

1. App.js
2. src/navigation/AppNavigator.js
3. la pantalla objetivo en src/screens
4. el contexto o servicio que persiste esa funcionalidad
