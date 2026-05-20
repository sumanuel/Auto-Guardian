import { apiRequest } from "./apiClient";

export const loginRequest = (email, password) =>
  apiRequest("/auth/login", {
    method: "POST",
    body: { email, password },
  });

export const registerRequest = (name, email, password) =>
  apiRequest("/auth/register", {
    method: "POST",
    body: { name, email, password },
  });

export const meRequest = (token) =>
  apiRequest("/auth/me", {
    token,
  });

export const forgotPasswordRequest = (email) =>
  apiRequest("/auth/forgot-password", {
    method: "POST",
    body: { email },
  });

export const resetPasswordRequest = (token, password) =>
  apiRequest("/auth/reset-password", {
    method: "POST",
    body: { token, password },
  });
