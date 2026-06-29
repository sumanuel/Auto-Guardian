# Auto-Guardian

App Expo/React Native para gestion personal de vehiculos, mantenimientos, reparaciones, gastos, documentos y alertas.

## Lectura recomendada

- Contexto funcional y tecnico: CONTEXTO_PROYECTO.md
- Arranque operativo: ARRANQUE_RAPIDO.md
- Funcionalidades implementadas: README_FUNCIONALIDADES.md
- Notas adicionales de app: README_APP.md

## Stack

- Expo SDK 54
- React 19
- React Native 0.81
- React Navigation
- SQLite local
- expo-notifications

## Flujo base

La app inicializa onboarding, base de datos, notificaciones y configuracion inicial de moneda antes de montar la navegacion principal.

Puntos de entrada principales:

- App.js
- src/navigation/AppNavigator.js
- src/context
- src/services

## Comandos rapidos

```bash
npm install
npm run start
npm run android
npm run web
npm run lint
```

## Estado de la documentacion

Este README ya no intenta describir todos los modulos. La fuente principal de contexto vivo del proyecto es CONTEXTO_PROYECTO.md y la guia operativa es ARRANQUE_RAPIDO.md.
