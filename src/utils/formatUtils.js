// Formatear moneda
export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return "-";
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(amount);
};

// Formatear kilometraje
export const formatKm = (km) => {
  if (!km && km !== 0) return "-";
  return new Intl.NumberFormat("es-MX").format(km) + " km";
};

// Determinar urgencia del mantenimiento
export const getMaintenanceUrgency = (
  currentKm,
  nextServiceKm,
  nextServiceDate
) => {
  let urgency = "low"; // low, medium, high

  // Verificar por kilometraje
  if (nextServiceKm && currentKm) {
    const kmRemaining = nextServiceKm - currentKm;
    if (kmRemaining <= 0) urgency = "high";
    else if (kmRemaining <= 1000) urgency = "high";
    else if (kmRemaining <= 2000) urgency = "medium";
  }

  // Verificar por fecha
  if (nextServiceDate) {
    const nextDate = new Date(nextServiceDate.split("T")[0]);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysRemaining = Math.floor(
      (nextDate - today) / (1000 * 60 * 60 * 24)
    );
    if (daysRemaining <= 0) urgency = "high";
    else if (daysRemaining <= 7) urgency = "high";
    else if (daysRemaining <= 30) {
      if (urgency === "low") urgency = "medium";
    }
  }

  return urgency;
};

// Obtener color según urgencia
export const getUrgencyColor = (urgency) => {
  switch (urgency) {
    case "high":
      return "#ff4444";
    case "medium":
      return "#ffaa00";
    case "low":
      return "#00C851";
    default:
      return "#666";
  }
};

// Obtener texto de urgencia
export const getUrgencyText = (urgency) => {
  switch (urgency) {
    case "high":
      return "Urgente";
    case "medium":
      return "Próximamente";
    case "low":
      return "Al día";
    default:
      return "";
  }
};

// Formatear días restantes hasta la próxima fecha de servicio
export const formatDaysRemaining = (nextServiceDate) => {
  if (!nextServiceDate) return null;

  const nextDate = new Date(nextServiceDate.split("T")[0]);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysRemaining = Math.floor((nextDate - today) / (1000 * 60 * 60 * 24));

  if (daysRemaining < 0) {
    return `Vencido hace ${Math.abs(daysRemaining)} día${
      Math.abs(daysRemaining) !== 1 ? "s" : ""
    }`;
  } else if (daysRemaining === 0) {
    return "Hoy";
  } else if (daysRemaining <= 7) {
    return `En ${daysRemaining} día${daysRemaining !== 1 ? "s" : ""}`;
  } else if (daysRemaining <= 30) {
    const weeks = Math.floor(daysRemaining / 7);
    return `En ${weeks} semana${weeks !== 1 ? "s" : ""}`;
  } else {
    const months = Math.floor(daysRemaining / 30);
    return `En ${months} mes${months !== 1 ? "es" : ""}`;
  }
};

// Formatear kilometraje restante hasta el próximo servicio
export const formatKmRemaining = (currentKm, nextServiceKm) => {
  if (!nextServiceKm || !currentKm) return null;

  const kmRemaining = nextServiceKm - currentKm;
  if (kmRemaining <= 0) {
    return `Vencido (${formatKm(Math.abs(kmRemaining))})`;
  }
  return `En ${formatKm(kmRemaining)}`;
};

// Obtener color de urgencia por kilometraje
export const getKmUrgencyColor = (currentKm, nextServiceKm) => {
  if (!nextServiceKm || !currentKm) return "#666";

  const kmRemaining = nextServiceKm - currentKm;

  if (kmRemaining <= 0) return "#ff4444"; // Vencido - Rojo
  if (kmRemaining <= 500) return "#ff4444"; // Crítico - Rojo
  if (kmRemaining <= 1000) return "#ff6b00"; // Urgente - Naranja oscuro
  if (kmRemaining <= 2000) return "#ffaa00"; // Advertencia - Naranja
  return "#00C851"; // Al día - Verde
};

// Obtener color de urgencia por fecha
export const getDateUrgencyColor = (nextServiceDate) => {
  if (!nextServiceDate) return "#666";

  const nextDate = new Date(nextServiceDate.split("T")[0]);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysRemaining = Math.floor((nextDate - today) / (1000 * 60 * 60 * 24));

  if (daysRemaining < 0) return "#ff4444"; // Vencido - Rojo
  if (daysRemaining === 0) return "#ff4444"; // Hoy - Rojo
  if (daysRemaining <= 3) return "#ff6b00"; // Muy urgente - Naranja oscuro
  if (daysRemaining <= 7) return "#ffaa00"; // Urgente - Naranja
  if (daysRemaining <= 15) return "#ffc107"; // Próximamente - Amarillo
  if (daysRemaining <= 30) return "#4CAF50"; // Bien - Verde claro
  return "#00C851"; // Al día - Verde
};
