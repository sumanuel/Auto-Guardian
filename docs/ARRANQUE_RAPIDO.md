# Arranque rapido: Auto-Guardian

Ultima actualizacion: 2026-06-29

## Requisitos

- Node.js compatible con Expo SDK 54.
- npm.
- Expo CLI via dependencias del proyecto.
- Android Studio, emulador o Expo Go segun el flujo de prueba.

## Variables de entorno y configuracion sensible

Este proyecto no expone un contrato .env de aplicacion propio en el repo.

Puntos a revisar antes de correr o desplegar:

- app.json
- credentials.json
- credentials/
- eas.json

Notas:

- Las coincidencias de process.env en el repo son de Expo o codigo multiplataforma, no una capa de configuracion funcional propia.
- Si se agregan servicios externos nuevos, conviene formalizar un .env.example antes de seguir creciendo.

## Instalacion

```bash
npm install
```

## Desarrollo local

```bash
npm run start
```

Atajos utiles:

```bash
npm run android
npm run web
```

## Smoke test recomendado

Chequeo rapido de calidad minima:

```bash
npm run lint
```

Chequeo funcional minimo manual:

1. abrir la app
2. verificar que no falle el bootstrap inicial
3. entrar a Home
4. abrir una pantalla de vehiculo o configuracion
5. confirmar que la navegacion y la base local arrancan sin error visible

## Despliegue

Flujo base documentado en el repo:

```bash
eas build --platform android
```

Pasos sugeridos:

1. validar cambios con npm run lint
2. revisar app.json y eas.json
3. ejecutar build de EAS para la plataforma objetivo
4. si el cambio afecta comportamiento nativo o tienda, completar luego el flujo de submit o publicacion que uses fuera del repo

## Archivos que conviene leer primero

- CONTEXTO_PROYECTO.md
- App.js
- src/navigation/AppNavigator.js
- README_FUNCIONALIDADES.md
