# 🌍 Detección Automática de País para WhatsApp

## ✨ Funcionalidad Implementada

La aplicación ahora detecta automáticamente el código de país del usuario basándose en la configuración regional de su dispositivo. Esto mejora significativamente la experiencia de usuario al usar WhatsApp, SMS y llamadas.

## 🛠️ Archivos Modificados

### 1. **src/utils/phoneUtils.js** (NUEVO)

Utilidades para manejar números telefónicos y detección de país:

#### Funciones principales:

- **`getCountryPhoneCode()`**: Obtiene el código telefónico del país actual

  - Usa `expo-localization` para detectar la región del dispositivo
  - Retorna códigos como '57' (Colombia), '52' (México), '54' (Argentina), etc.
  - Si no puede detectar, retorna '57' (Colombia) por defecto

- **`formatPhoneForWhatsApp(phoneNumber)`**: Formatea números para WhatsApp

  - Limpia el número de caracteres especiales
  - Agrega automáticamente el código de país si el número tiene 10 dígitos
  - Preserva números que ya tienen código de país

- **`getCurrentCountryInfo()`**: Obtiene información completa del país

  - Retorna: `{ regionCode, phoneCode, locale, formattedCode }`
  - Ejemplo: `{ regionCode: 'CO', phoneCode: '57', locale: 'es-CO', formattedCode: '+57' }`

- **`cleanPhoneNumber(phoneNumber)`**: Limpia números para llamadas y SMS

#### Países soportados:

```javascript
Argentina (AR): +54       Brasil (BR): +55       Chile (CL): +56
Colombia (CO): +57        Costa Rica (CR): +506  Ecuador (EC): +593
El Salvador (SV): +503    Guatemala (GT): +502   Honduras (HN): +504
México (MX): +52          Nicaragua (NI): +505   Panamá (PA): +507
Paraguay (PY): +595       Perú (PE): +51        Uruguay (UY): +598
Venezuela (VE): +58       España (ES): +34       USA/Canadá: +1
```

### 2. **src/screens/ContactsScreen.js**

Actualizado para usar las utilidades de detección automática:

- `handleWhatsApp()`: Usa `formatPhoneForWhatsApp()` para formatear números automáticamente
- `handleCall()`: Usa `cleanPhoneNumber()` para limpiar números
- `handleSMS()`: Usa `cleanPhoneNumber()` para limpiar números
- Muestra el país detectado en mensajes de error para mejor depuración

### 3. **src/screens/AddContactScreen.js**

Mejorado para detectar automáticamente el país al crear nuevos contactos:

- Al crear un **nuevo contacto**: Detecta automáticamente el país basándose en la ubicación del dispositivo
- Al **editar contacto**: Mantiene el país original del número
- Muestra mensaje informativo: "🌍 País detectado automáticamente según tu ubicación"
- El usuario puede cambiar el país manualmente si es necesario

### 4. **app.json**

Configuración actualizada para Android:

```json
"android": {
  "permissions": [
    "android.permission.CALL_PHONE",
    "android.permission.SEND_SMS",
    "android.permission.READ_PHONE_STATE"
  ],
  "queries": {
    "schemes": ["tel", "sms", "mailto"],
    "intents": [{
      "action": "android.intent.action.VIEW",
      "data": {
        "scheme": "https",
        "host": "api.whatsapp.com"
      }
    }]
  }
}
```

## 📱 Cómo Funciona

### Ejemplo: Usuario en Colombia

1. El dispositivo está configurado en Colombia (región: 'CO')
2. Al crear un contacto nuevo, se selecciona automáticamente 🇨🇴 Colombia (+57)
3. El usuario ingresa: `3001234567`
4. Al usar WhatsApp, se envía automáticamente: `573001234567`

### Ejemplo: Usuario en México

1. El dispositivo está configurado en México (región: 'MX')
2. Se selecciona automáticamente 🇲🇽 México (+52)
3. El usuario ingresa: `5512345678`
4. Al usar WhatsApp, se envía: `525512345678`

## 🔧 Ventajas de la Implementación

✅ **Automático**: No requiere que el usuario configure nada  
✅ **Flexible**: El usuario puede cambiar el país manualmente si es necesario  
✅ **Inteligente**: Detecta y formatea números correctamente  
✅ **Compatible**: Funciona en APK, no solo en Expo Go  
✅ **Multi-región**: Soporta 20+ países de Latinoamérica y España

## 🧪 Para Probar

### En Expo Go:

```bash
npx expo start
```

### Para generar APK:

```bash
# Asegúrate de tener configurado EAS Build
eas build --platform android

# O con build local
npx expo prebuild --clean
npx expo run:android
```

## 🐛 Solución de Problemas

### WhatsApp no abre en APK

- ✅ **Solucionado**: Ahora usa `https://api.whatsapp.com/` en lugar de `whatsapp://`
- Esta URL funciona tanto en apps como en navegadores

### Llamadas no funcionan

- ✅ **Verificado**: Los permisos están correctos en `app.json`
- ✅ **Mejorado**: Usa `Linking.openURL()` directamente sin verificaciones innecesarias

### SMS no funciona

- ✅ **Configurado**: El esquema `sms:` está en las queries de Android 11+

### País incorrecto detectado

- El país se detecta basándose en la configuración regional del dispositivo
- En **Configuración > Sistema > Idioma y región** (Android)
- En **Ajustes > General > Idioma y región** (iOS)
- El usuario puede cambiar manualmente el país en la app si es necesario

## 📦 Dependencias

```json
{
  "expo-localization": "~19.0.12", // Para detectar país/región
  "expo-linking": "~8.0.10" // Para abrir WhatsApp, tel, sms
}
```

## 🚀 Próximos Pasos (Opcional)

1. **Validación de números**: Agregar validación según el formato del país
2. **Formato visual**: Mostrar números con formato según el país (ej: +57 300 123 4567)
3. **Detección inteligente**: Si el usuario cambia de país frecuentemente, recordar su preferencia
4. **Sincronización**: Guardar el código de país detectado en AsyncStorage para uso offline

---

**Fecha de implementación**: Diciembre 8, 2025  
**Versión**: 1.0.0
