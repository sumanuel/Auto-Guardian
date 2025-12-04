import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Cargar preferencia de tema al iniciar
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem("@theme_preference");
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === "dark");
      }
    } catch (error) {
      console.error("Error loading theme preference:", error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      await AsyncStorage.setItem(
        "@theme_preference",
        newTheme ? "dark" : "light"
      );
    } catch (error) {
      console.error("Error saving theme preference:", error);
    }
  };

  const theme = {
    isDarkMode,
    colors: isDarkMode ? darkColors : lightColors,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

// Colores para modo claro
const lightColors = {
  // Backgrounds
  background: "#f5f5f5",
  cardBackground: "#fff",
  inputBackground: "#fff",

  // Text
  text: "#333",
  textSecondary: "#666",
  textTertiary: "#999",

  // Primary colors
  primary: "#2196F3",
  primaryDark: "#1976D2",

  // Status colors
  success: "#4CAF50",
  warning: "#FF9800",
  danger: "#f44336",
  info: "#2196F3",

  // Borders
  border: "#e0e0e0",
  borderLight: "#f0f0f0",

  // Shadows
  shadow: "#000",

  // Tab bar
  tabBarBackground: "#fff",
  tabBarBorder: "#f0f0f0",
  tabBarInactive: "#999",

  // Other
  white: "#fff",
  disabled: "#e0e0e0",
  overlay: "rgba(0, 0, 0, 0.5)",
};

// Colores para modo oscuro
const darkColors = {
  // Backgrounds
  background: "#121212",
  cardBackground: "#1e1e1e",
  inputBackground: "#2c2c2c",

  // Text
  text: "#ffffff",
  textSecondary: "#b0b0b0",
  textTertiary: "#808080",

  // Primary colors
  primary: "#64B5F6",
  primaryDark: "#42A5F5",

  // Status colors
  success: "#66BB6A",
  warning: "#FFA726",
  danger: "#EF5350",
  info: "#42A5F5",

  // Borders
  border: "#404040",
  borderLight: "#2c2c2c",

  // Shadows
  shadow: "#000",

  // Tab bar
  tabBarBackground: "#1e1e1e",
  tabBarBorder: "#2c2c2c",
  tabBarInactive: "#808080",

  // Other
  white: "#ffffff",
  disabled: "#404040",
  overlay: "rgba(0, 0, 0, 0.7)",
};
