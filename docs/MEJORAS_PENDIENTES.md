# Revisión de la app y mejoras

Revisión realizada el 2026-11-02 (lectura de código; no se ejecutó la app ni pruebas).
Estado: ✅ hecho en rama · ⏳ pendiente.

## Crítico (seguridad)

1. **Secretos en git** — `server/.env` (Postgres, `JWT_SECRET`, SMTP) y `credentials.json` (keystore de Android) estaban versionados. ✅ Se sacaron del índice y se agregaron al `.gitignore` (rama `fix/secretos-gitignore`).
   - ⏳ Falta rotar contraseñas y `JWT_SECRET`, limpiar el historial (`git filter-repo` o BFG) y guardar una copia segura del keystore fuera del repo.

## Alto (riesgo de perder datos)

2. **Restauración rompía relaciones** — `importTable` omitía la columna `id`, así que los `vehicleId` podían apuntar al vehículo equivocado. ✅ Ahora conserva los `id` originales (rama `fix/backup-restore`).
3. **Importación sin transacción** — borraba todo y luego insertaba. ✅ Ahora corre en `withTransactionSync`, valida el contenido antes de borrar y solo importa tablas que existen (rama `fix/backup-restore`).
4. **El respaldo no incluye archivos** (fotos de vehículos, documentos adjuntos). ✅ Las fotos de vehículos van en el respaldo (rama `fix/backup-archivos`). Las imágenes de mantenimientos/reparaciones se guardan como URI de la galería y no se incluyen.
5. **Foreign keys posiblemente desactivadas** — no hay `PRAGMA foreign_keys = ON`; la limpieza de huérfanos en `database.js` sugiere que no se aplican. ✅ `PRAGMA foreign_keys = ON` al iniciar (rama `fix/db-migraciones-fk`). Probar borrado de vehículos en dispositivo.
6. **Migraciones sin versión** — `ALTER TABLE` dentro de `try/catch`. ✅ Sistema `PRAGMA user_version` con lista `VERSIONED_MIGRATIONS` (rama `fix/db-migraciones-fk`); las comprobaciones antiguas quedan como versión 1.

## Medio (mantenibilidad y rendimiento)

7. Pantallas muy grandes: `VehicleDetailScreen` (1721 líneas), `MaintenanceHistoryScreen` (1716), `AddMaintenanceScreen` (1442), `CategoriesScreen` (1422), `InvestmentDetailScreen` (1419). 🟡 Parcial: estilos de `VehicleDetailScreen` y `MaintenanceHistoryScreen` en archivos `.styles.js` y `QuickActionCard` extraído a `src/components/maintenance/` (ramas `refactor/extraer-estilos`, `refactor/quick-action-card`). Falta dividir la lógica y el JSX restante en subcomponentes.
8. Rendimiento de listas: solo 24 de 102 usos son `FlatList`; pocos `useMemo`/`useCallback`. ✅ Revisado: las listas con datos sin límite ya usan `FlatList`; los `ScrollView` son formularios o listas acotadas (`slice(0, 3)`). No requiere cambios.
9. Sin pruebas automáticas (ni Jest ni script de test). Empezar por `maintenanceService`, `dateUtils` y el respaldo. ✅ Jest con `jest-expo` y 10 pruebas (`npm test`, rama `test/jest-base`). Falta ampliar cobertura.
10. Todo en JavaScript con `tsconfig` estricto; migrar a TypeScript gradualmente. 🟡 Parcial: `logger`, utilidades (`dateUtils`, `formatUtils`, `phoneUtils`, `maintenanceIcons`, `vehiclePhotoStorage`), `appLockService` y los servicios de vehículos, gastos, reparaciones y contactos en TypeScript, con tipos en `src/types/models.ts`; `tsc --noEmit` sin errores (ramas `refactor/typescript-*`). Faltan `database`, `maintenanceService`, `notificationService`, `documentService`, `vehicleDocumentService`, contextos y pantallas.
11. Código de plantilla de Expo sin usar (`app/`, `components/`, `hooks/`, `constants/theme.ts`) y `expo-router` duplicando React Navigation.  ✅ Eliminado (rama `chore/limpiar-plantilla-expo`); `expo-router` también eliminado (rama `chore/quitar-expo-router`).
12. Notificaciones: mensaje aleatorio y programación fija (lunes y miércoles 9 AM); programar con la fecha real de vencimiento y probar permisos en Android 13+. ✅ Avisos puntuales 3 días antes y el día del vencimiento, a las 9:00 (rama `feat/notificaciones-vencimiento`). Falta probar en Android 13+ real.

## Bajo (orden y limpieza)

13. Quitar `AddMaintenanceScreen.js.bak` y `_autoguardian-update`. ✅ (rama `fix/secretos-gitignore`). `dist/` ya está ignorado.
14. 14 documentos `.md` en la raíz con contenido solapado; moverlos a `docs/` y consolidar. ✅ Movidos a `docs/` (rama `docs/mover-documentacion`).
15. `console.log` sueltos (`database.js`, `phoneUtils.js`, `responsive.js`); usar logger con `__DEV__`. ✅ Logger solo en desarrollo (rama `chore/logger-dev`).
16. Versiones desalineadas: `package.json` 1.0.0 vs `app.json` 0.1.1.260728.  ✅ `package.json` alineado (rama `chore/alinear-version`).
17. `eas.json` con `submit.production` vacío. ✅ `submit.production` apunta a `google-service-account.json` (ignorado en git; hay que crearlo en Play Console) (rama `chore/eas-submit`).
18. Funcionalidad: respaldo automático periódico, cifrado del respaldo, PIN o biometría para documentos. 🟡 Parcial: respaldo automático semanal con 5 copias (rama `feat/respaldo-automatico`) y bloqueo opcional con huella, rostro o PIN del dispositivo (rama `feat/bloqueo-app`; agrega `expo-local-authentication`, **requiere nuevo build nativo**). Pendiente: cifrado del respaldo (necesita una librería AES y definir cómo el usuario guarda la contraseña).

## Orden sugerido

1 → 2 y 3 → 9 y 6 → resto.

## Hallazgos adicionales

- `phoneUtils` usaba `Localization.region/locale/timezone`, eliminados en expo-localization 17: la detección de país siempre caía en Colombia (+57). Corregido con `getLocales()`/`getCalendars()` y probado (rama `refactor/typescript-utils-2`).

## Actualización a Expo SDK 58 (rama `chore/sdk-58`)

- Expo 54 → 58, React Native 0.81 → 0.88, React 19.1 → 19.3, Reanimated 4.7, Gesture Handler 3.3, Jest 30.
- `expo-doctor` 20/20, `tsc` sin errores, 22 pruebas en verde, `expo export` para Android compila.
- `app.json`: se quitaron `newArchEnabled` y `android.edgeToEdgeEnabled` (ya son obligatorios) y `android.queries` pasó al plugin `expo-build-properties` (`manifestQueries`), con los mismos esquemas (`tel`, `sms`, `mailto`, `whatsapp`) y el intent de `api.whatsapp.com`.
- Se eliminó `@react-navigation/material-top-tabs` (no se usaba) y se agregó `@react-native/jest-preset`.
- ESLint 58 trae reglas del React Compiler que el código actual incumple (62 avisos: `set-state-in-effect`, `refs`, `immutability`, `static-components`). Quedaron como aviso; conviene corregirlas poco a poco.
- **Probar en dispositivo antes de publicar:** reordenar tipos en `CategoriesScreen` (`react-native-draggable-flatlist` 4.0.3 con Gesture Handler 3), notificaciones, WhatsApp/llamadas (queries del manifiesto), bloqueo biométrico, y el aspecto con edge-to-edge. Requiere un build nuevo con EAS.
