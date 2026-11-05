# Actualizaciones OTA (EAS Update)

La app usa `expo-updates` para recibir cambios de JavaScript y recursos sin pasar por Play Store.

## Cómo está configurado

- `app.json` → `runtimeVersion.policy = "appVersion"`: el `runtimeVersion` es el `version` de la app.
  Una actualización OTA solo llega a las instalaciones con **el mismo `version`**.
- `app.json` → `updates.url` apunta al proyecto de EAS; `checkAutomatically = "ON_ERROR_RECOVERY"`
  porque la propia app avisa de las actualizaciones (ver `AppSettingsContext`: `checkForUpdate` / `applyUpdate`).
- `eas.json` → cada perfil de build tiene su canal: `development`, `preview` y `production`.

## Qué se puede enviar por OTA

Solo cambios de JavaScript, textos, estilos e imágenes.

Necesitan un build nuevo (`.aab`) y una nueva versión en Play Console:

- Agregar, quitar o actualizar librerías nativas (por ejemplo, cualquier paquete `expo-*` o `react-native-*` con código nativo).
- Cambios en `app.json` que afecten a la parte nativa: permisos, plugins, iconos, `scheme`, `android.*`.
- Cambio de SDK de Expo.

Al subir un build nuevo con otro `version`, ese build empieza su propia línea de actualizaciones.

## Publicar una actualización

```bash
npx eas-cli update --channel production --message "Descripción del cambio"
```

Para probar antes con el build `preview`:

```bash
npx eas-cli update --channel preview --message "Descripción del cambio"
```

## Volver atrás

```bash
npx eas-cli update:republish --channel production --group <id-del-grupo-anterior>
```

o `npx eas-cli update:rollback`.

## Importante

- El primer build con `expo-updates` (el que se sube a Play Console) debe generarse con el perfil `production`
  para que quede asociado al canal `production`.
- Subir `version` en `app.json` cada vez que se genere un build nuevo con cambios nativos.
