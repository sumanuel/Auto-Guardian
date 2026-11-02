# Revisión de la app y mejoras

Revisión realizada el 2026-11-02 (lectura de código; no se ejecutó la app ni pruebas).
Estado: ✅ hecho en rama · ⏳ pendiente.

## Crítico (seguridad)

1. **Secretos en git** — `server/.env` (Postgres, `JWT_SECRET`, SMTP) y `credentials.json` (keystore de Android) estaban versionados. ✅ Se sacaron del índice y se agregaron al `.gitignore` (rama `fix/secretos-gitignore`).
   - ⏳ Falta rotar contraseñas y `JWT_SECRET`, limpiar el historial (`git filter-repo` o BFG) y guardar una copia segura del keystore fuera del repo.

## Alto (riesgo de perder datos)

2. **Restauración rompía relaciones** — `importTable` omitía la columna `id`, así que los `vehicleId` podían apuntar al vehículo equivocado. ✅ Ahora conserva los `id` originales (rama `fix/backup-restore`).
3. **Importación sin transacción** — borraba todo y luego insertaba. ✅ Ahora corre en `withTransactionSync`, valida el contenido antes de borrar y solo importa tablas que existen (rama `fix/backup-restore`).
4. **El respaldo no incluye archivos** (fotos de vehículos, documentos adjuntos). ⏳
5. **Foreign keys posiblemente desactivadas** — no hay `PRAGMA foreign_keys = ON`; la limpieza de huérfanos en `database.js` sugiere que no se aplican. ⏳ Activarlo cambia el comportamiento: probar antes en dispositivo.
6. **Migraciones sin versión** — `ALTER TABLE` dentro de `try/catch`. ⏳ Usar `PRAGMA user_version` con migraciones numeradas.

## Medio (mantenibilidad y rendimiento)

7. Pantallas muy grandes: `VehicleDetailScreen` (1721 líneas), `MaintenanceHistoryScreen` (1716), `AddMaintenanceScreen` (1442), `CategoriesScreen` (1422), `InvestmentDetailScreen` (1419). ⏳
8. Rendimiento de listas: solo 24 de 102 usos son `FlatList`; pocos `useMemo`/`useCallback`. ⏳
9. Sin pruebas automáticas (ni Jest ni script de test). Empezar por `maintenanceService`, `dateUtils` y el respaldo. ⏳
10. Todo en JavaScript con `tsconfig` estricto; migrar a TypeScript gradualmente. ⏳
11. Código de plantilla de Expo sin usar (`app/`, `components/`, `hooks/`, `constants/theme.ts`) y `expo-router` duplicando React Navigation.  ✅ Eliminado (rama `chore/limpiar-plantilla-expo`); queda pendiente quitar la dependencia `expo-router` y su plugin en `app.json`.
12. Notificaciones: mensaje aleatorio y programación fija (lunes y miércoles 9 AM); programar con la fecha real de vencimiento y probar permisos en Android 13+. ⏳

## Bajo (orden y limpieza)

13. Quitar `AddMaintenanceScreen.js.bak` y `_autoguardian-update`. ✅ (rama `fix/secretos-gitignore`). `dist/` ya está ignorado.
14. 14 documentos `.md` en la raíz con contenido solapado; moverlos a `docs/` y consolidar. ⏳
15. `console.log` sueltos (`database.js`, `phoneUtils.js`, `responsive.js`); usar logger con `__DEV__`. ⏳
16. Versiones desalineadas: `package.json` 1.0.0 vs `app.json` 0.1.1.260728.  ✅ `package.json` alineado (rama `chore/alinear-version`).
17. `eas.json` con `submit.production` vacío. ⏳
18. Funcionalidad: respaldo automático periódico, cifrado del respaldo, PIN o biometría para documentos. ⏳

## Orden sugerido

1 → 2 y 3 → 9 y 6 → resto.
