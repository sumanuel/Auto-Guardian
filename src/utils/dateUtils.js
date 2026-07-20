import { addMonths, differenceInDays, format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

const toLocalDateOnly = (date) => {
  const dateObj = typeof date === "string" ? parseISO(date) : date;

  if (!(dateObj instanceof Date) || Number.isNaN(dateObj.getTime())) {
    return null;
  }

  return new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
};

// Formatear fecha
export const formatDate = (date, formatStr = "dd/MM/yyyy") => {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return format(dateObj, formatStr, { locale: es });
  } catch (error) {
    return date;
  }
};

// Formatear fecha relativa
export const formatRelativeDate = (date) => {
  try {
    const dateOnly = toLocalDateOnly(date);
    const today = toLocalDateOnly(new Date());
    const days = differenceInDays(today, dateOnly);

    if (days < 0) {
      const futureDays = Math.abs(days);

      if (futureDays === 1) return "Mañana";
      if (futureDays < 30) return `En ${futureDays} días`;
      if (futureDays < 365) {
        return `En ${Math.floor(futureDays / 30)} mes${
          Math.floor(futureDays / 30) !== 1 ? "es" : ""
        }`;
      }
      return `En ${Math.floor(futureDays / 365)} año${
        Math.floor(futureDays / 365) !== 1 ? "s" : ""
      }`;
    }

    if (days === 0) return "Hoy";
    if (days === 1) return "Ayer";
    if (days < 7) return `Hace ${days} días`;
    if (days < 30) return `Hace ${Math.floor(days / 7)} semanas`;
    if (days < 365) return `Hace ${Math.floor(days / 30)} meses`;
    return `Hace ${Math.floor(days / 365)} años`;
  } catch (error) {
    return formatDate(date);
  }
};

// Calcular próxima fecha de servicio
export const calculateNextServiceDate = (lastDate, intervalMonths) => {
  try {
    const dateObj =
      typeof lastDate === "string" ? parseISO(lastDate) : lastDate;
    return addMonths(dateObj, intervalMonths);
  } catch (error) {
    return null;
  }
};

// Días hasta el próximo servicio
export const daysUntilService = (nextServiceDate) => {
  try {
    const dateOnly = toLocalDateOnly(nextServiceDate);
    const today = toLocalDateOnly(new Date());
    return differenceInDays(dateOnly, today);
  } catch (error) {
    return null;
  }
};
