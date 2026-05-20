import Constants from "expo-constants";
import { Platform } from "react-native";

const configuredBaseUrl =
  Constants?.expoConfig?.extra?.apiBaseUrl?.trim?.() || "";

export const API_BASE_URL =
  configuredBaseUrl ||
  Platform.select({
    android: "http://10.0.2.2:4000",
    default: "http://localhost:4000",
  });

export const apiRequest = async (
  path,
  { method = "GET", token, body } = {},
) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message || "No se pudo completar la solicitud");
  }

  return data;
};
