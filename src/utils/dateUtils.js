import { format, parseISO, differenceInDays, addMonths } from "date-fns";
import { es } from "date-fns/locale";

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
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    const days = differenceInDays(new Date(), dateObj);

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
    const dateObj =
      typeof nextServiceDate === "string"
        ? parseISO(nextServiceDate)
        : nextServiceDate;
    return differenceInDays(dateObj, new Date());
  } catch (error) {
    return null;
  }
};
