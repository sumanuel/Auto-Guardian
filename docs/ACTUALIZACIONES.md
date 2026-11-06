# Aviso de nueva versión y actualización obligatoria

Al abrir la app se consulta el `version.json` publicado en
`https://raw.githubusercontent.com/sumanuel/autoguardian-update/main/version.json`
(configurado en `app.json` → `extra.storeUpdate.versionCheckUrl`) y se compara con la versión instalada
(`app.json` → `version`).

## Formato del version.json

```json
{
  "latestVersion": "0.1.1.261105",
  "minimumVersion": "0.1.1.260131",
  "url": "https://play.google.com/store/apps/details?id=com.trenkit.autoguardian"
}
```

- `latestVersion`: la última versión publicada en Play Store.
- `minimumVersion` (opcional): la versión más vieja que se sigue permitiendo.
- `url` (opcional): enlace a Play Store; si falta, se abre el de `android.package`.

## Qué hace la app

| Situación | Resultado |
| --- | --- |
| `latestVersion` mayor que la instalada | Modal "Hay una nueva versión" con **Actualizar** y **Más tarde**. Se muestra una vez al día por versión. También aparece la opción en Más y la notificación. |
| `minimumVersion` mayor que la instalada | Modal **"Actualización necesaria"**, sin "Más tarde" y sin poder cerrarlo (ni con el botón atrás). Solo se sale pasando por Play Store. |
| No se puede leer el version.json (sin internet, error) | No pasa nada: nunca se bloquea la app por un fallo de red. |

## Cómo publicar

1. Sube el `.aab` a Play Console y espera a que la versión esté **disponible** para todos.
2. Edita `version.json` en el repositorio `autoguardian-update`:
   - Siempre actualiza `latestVersion`.
   - Sube `minimumVersion` solo si quieres **obligar** a actualizar (por ejemplo, por un error grave o un cambio de datos incompatible). Déjalo igual en actualizaciones normales.
3. No actualices `version.json` antes de que la versión esté publicada: los usuarios verían el aviso sin poder actualizar.

Para quitar la obligación basta con bajar `minimumVersion` de nuevo.
