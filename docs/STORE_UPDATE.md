# Chequeo de actualización (Play Store)

La app muestra el aviso **“Nueva versión en Play Store”** comparando la versión instalada con un valor publicado en un endpoint JSON.

Esto evita hacer _scraping_ del HTML de Play Store (que es frágil y suele romperse).

Importante: **no necesitas una API**. Solo necesitas **un archivo JSON estático** accesible por URL (puede estar en GitHub).

## Configuración

En [app.json](app.json) define:

```json
{
  "expo": {
    "extra": {
      "storeUpdate": {
        "androidPackage": "com.trenkit.autoguardian",
        "versionCheckUrl": "https://TU_DOMINIO/autoguardian/version.json",
        "timeoutMs": 7000,
        "allowDevChecks": false
      }
    }
  }
}
```

## Formato del JSON remoto

Ejemplo de `version.json`:

```json
{
  "latestVersion": "0.1.1.260202",
  "url": "https://play.google.com/store/apps/details?id=com.trenkit.autoguardian"
}
```

- `latestVersion`: versión más reciente disponible en Play Store.
- `url` (opcional): si no se define, la app abrirá Play Store usando `androidPackage`.

## Cómo hacerlo sin API (opción recomendada)

### Opción A: GitHub (archivo público + URL raw)

1. Crea un repo público (por ejemplo `autoguardian-update`).
2. Agrega un archivo `version.json` en la raíz con el formato de arriba.
3. Usa la URL **raw** como `versionCheckUrl`:

Ejemplo con tu usuario (sumanuel) y un repo sugerido `autoguardian-update`:

`https://raw.githubusercontent.com/sumanuel/autoguardian-update/main/version.json`

Cada vez que publiques una nueva versión en Play Store, solo actualizas `latestVersion` en ese archivo.

Tip: en este proyecto ya dejé un ejemplo listo como [version.json](version.json) para que lo subas tal cual al repo.

### Opción B: GitHub Gist

1. Crea un Gist público con el contenido JSON.
2. Usa la URL raw del Gist como `versionCheckUrl`.

## Alternativa (sin mantener JSON): In-App Updates

Si prefieres no mantener un `version.json`, se puede integrar el flujo de **Google Play In-App Updates** (Play Core) para que Play Store reporte si hay update disponible.

Nota: esto requiere agregar una dependencia nativa (y normalmente EAS build / prebuild), así que es un poco más “pesado” que el JSON estático.

## Notas

- La comparación soporta versiones tipo `0.1.1.260131` (segmentos numéricos separados por `.`).
- En `__DEV__` el chequeo está deshabilitado por defecto; se puede habilitar con `allowDevChecks: true`.
