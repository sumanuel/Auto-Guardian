import { formatKm } from "./formatUtils";

export type KmStatus = "unchanged" | "update" | "invalid" | "lower";

export interface KmCheck {
  status: KmStatus;
  km: number | null;
}

// Evalúa el kilometraje escrito en un formulario frente al actual del vehículo:
// vacío o igual no cambia nada; mayor actualiza; menor o inválido se rechaza.
export const checkKmUpdate = (
  text: string | null | undefined,
  currentKm?: number | null,
): KmCheck => {
  const trimmed = (text ?? "").trim();
  if (!trimmed) return { status: "unchanged", km: null };
  if (!/^\d+$/.test(trimmed)) return { status: "invalid", km: null };

  const km = parseInt(trimmed, 10);
  if (currentKm == null) return { status: "update", km };
  if (km === currentKm) return { status: "unchanged", km };
  return { status: km < currentKm ? "lower" : "update", km };
};

export const kmErrorMessage = (
  check: KmCheck,
  currentKm?: number | null,
): string | null => {
  if (check.status === "invalid") {
    return "Ingresa un kilometraje válido (solo números).";
  }
  if (check.status === "lower") {
    return `El kilometraje no puede ser menor al actual del vehículo (${formatKm(currentKm)}). Corrígelo o déjalo igual.`;
  }
  return null;
};
