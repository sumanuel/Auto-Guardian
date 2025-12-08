import * as Localization from "expo-localization";

// Mapeo de códigos de país ISO a códigos telefónicos internacionales
const COUNTRY_PHONE_CODES = {
  AR: "54", // Argentina
  BO: "591", // Bolivia
  BR: "55", // Brasil
  CL: "56", // Chile
  CO: "57", // Colombia
  CR: "506", // Costa Rica
  CU: "53", // Cuba
  DO: "1", // República Dominicana
  EC: "593", // Ecuador
  SV: "503", // El Salvador
  GT: "502", // Guatemala
  HN: "504", // Honduras
  MX: "52", // México
  NI: "505", // Nicaragua
  PA: "507", // Panamá
  PY: "595", // Paraguay
  PE: "51", // Perú
  PR: "1", // Puerto Rico
  ES: "34", // España
  UY: "598", // Uruguay
  VE: "58", // Venezuela
  US: "1", // Estados Unidos
  CA: "1", // Canadá
};

// Mapeo de timezones a códigos de país (para detección alternativa)
const TIMEZONE_TO_COUNTRY = {
  "America/Caracas": "VE",
  "America/Bogota": "CO",
  "America/Mexico_City": "MX",
  "America/Argentina/Buenos_Aires": "AR",
  "America/Santiago": "CL",
  "America/Lima": "PE",
  "America/Guayaquil": "EC",
  "America/Panama": "PA",
  "America/Costa_Rica": "CR",
  "America/Sao_Paulo": "BR",
  "America/Montevideo": "UY",
  "America/Asuncion": "PY",
  "America/La_Paz": "BO",
  "America/Guatemala": "GT",
  "America/Tegucigalpa": "HN",
  "America/El_Salvador": "SV",
  "America/Managua": "NI",
  "Europe/Madrid": "ES",
  "America/New_York": "US",
  "America/Los_Angeles": "US",
  "America/Chicago": "US",
  "America/Toronto": "CA",
};

/**
 * Detecta el código de país del usuario usando múltiples métodos
 * @returns {string} Código ISO del país (ej: 'VE', 'CO', 'MX')
 */
const detectCountryCode = () => {
  // Método 1: Usar Localization.region (más confiable cuando funciona)
  if (Localization.region) {
    console.log(
      "[PhoneUtils] Método 1 - Region detectada:",
      Localization.region
    );
    return Localization.region;
  }

  // Método 2: Extraer del locale (ej: 'es-VE' -> 'VE')
  if (Localization.locale && Localization.locale.includes("-")) {
    const countryFromLocale = Localization.locale.split("-")[1];
    console.log(
      "[PhoneUtils] Método 2 - País desde locale:",
      countryFromLocale
    );
    return countryFromLocale;
  }

  // Método 3: Usar timezone como fallback
  if (Localization.timezone) {
    const countryFromTimezone = TIMEZONE_TO_COUNTRY[Localization.timezone];
    if (countryFromTimezone) {
      console.log(
        "[PhoneUtils] Método 3 - País desde timezone:",
        countryFromTimezone
      );
      return countryFromTimezone;
    }
  }

  console.log(
    "[PhoneUtils] No se pudo detectar país, usando Colombia por defecto"
  );
  return "CO"; // Colombia por defecto
};

/**
 * Obtiene el código telefónico del país actual basado en la configuración regional del dispositivo
 * @returns {string} Código telefónico del país (ej: '57' para Colombia)
 */
export const getCountryPhoneCode = () => {
  try {
    const regionCode = detectCountryCode();

    console.log("[PhoneUtils] Código de país final:", regionCode);
    console.log("[PhoneUtils] Locale completo:", Localization.locale);
    console.log("[PhoneUtils] Timezone:", Localization.timezone);

    // Buscar el código telefónico correspondiente
    const phoneCode = COUNTRY_PHONE_CODES[regionCode];

    console.log("[PhoneUtils] Código telefónico encontrado:", phoneCode);

    // Si no se encuentra, usar Colombia como predeterminado
    return phoneCode || "57";
  } catch (error) {
    console.error("Error obteniendo código de país:", error);
    return "57"; // Código por defecto: Colombia
  }
};

/**
 * Formatea un número telefónico para WhatsApp
 * @param {string} phoneNumber - Número telefónico a formatear
 * @returns {string} Número formateado con código de país
 */
export const formatPhoneForWhatsApp = (phoneNumber) => {
  if (!phoneNumber) return "";

  // Limpiar el número (remover espacios, guiones, paréntesis, +)
  let cleanNumber = phoneNumber.replace(/[\s\-\(\)\+]/g, "");

  // Si el número ya tiene un código de país largo (más de 10 dígitos), dejarlo como está
  if (cleanNumber.length > 10) {
    return cleanNumber;
  }

  // Si el número tiene exactamente 10 dígitos, agregar el código del país actual
  if (cleanNumber.length === 10) {
    const countryCode = getCountryPhoneCode();
    return countryCode + cleanNumber;
  }

  // Para números más cortos, agregar el código de país si no lo tiene
  const countryCode = getCountryPhoneCode();
  if (!cleanNumber.startsWith(countryCode)) {
    return countryCode + cleanNumber;
  }

  return cleanNumber;
};

/**
 * Limpia un número telefónico removiendo caracteres especiales
 * @param {string} phoneNumber - Número telefónico a limpiar
 * @returns {string} Número limpio
 */
export const cleanPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return "";
  return phoneNumber.replace(/[\s\-\(\)]/g, "");
};

/**
 * Obtiene información del país actual
 * @returns {object} Objeto con información del país
 */
export const getCurrentCountryInfo = () => {
  try {
    const regionCode = detectCountryCode();
    const phoneCode = COUNTRY_PHONE_CODES[regionCode] || "57";
    const locale = Localization.locale; // Ej: 'es-CO', 'en-US'

    console.log(
      "[getCurrentCountryInfo] Region:",
      regionCode,
      "PhoneCode:",
      phoneCode,
      "Locale:",
      locale
    );

    return {
      regionCode,
      phoneCode,
      locale,
      formattedCode: `+${phoneCode}`,
    };
  } catch (error) {
    console.error("Error obteniendo información del país:", error);
    return {
      regionCode: "CO",
      phoneCode: "57",
      locale: "es-CO",
      formattedCode: "+57",
    };
  }
};
