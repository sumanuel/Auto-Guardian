import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { borderRadius, iconSize, rf, s, spacing } from "../utils/responsive";

const SettingsScreen = ({ navigation }) => {
  const { isDarkMode, toggleTheme, colors } = useTheme();

  const settingsOptions = [
    {
      id: 1,
      title: "Modo oscuro",
      icon: "moon-outline",
      type: "switch",
      value: isDarkMode,
      onValueChange: toggleTheme,
    },
    {
      id: 2,
      title: "Tipos de mantenimientos",
      icon: "list-outline",
      screen: "Categories",
    },
    {
      id: 3,
      title: "Tipos de documentos",
      icon: "document-text-outline",
      screen: "DocumentTypes",
    },
    {
      id: 4,
      title: "Notificaciones",
      icon: "notifications-outline",
      screen: "NotificationsScreen",
    },
    {
      id: 5,
      title: "Gestión de datos",
      icon: "server-outline",
      screen: "DataManagement", // Placeholder screen name
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>
          Configuración
        </Text>

        <View
          style={[
            styles.menuContainer,
            { backgroundColor: colors.cardBackground },
          ]}
        >
          {settingsOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.menuItem}
              disabled={option.comingSoon}
              onPress={() => {
                if (!option.comingSoon && option.screen) {
                  navigation.navigate(option.screen);
                }
              }}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons
                  name={option.icon}
                  size={iconSize.md}
                  color={option.comingSoon ? colors.disabled : colors.primary}
                />
                <Text
                  style={[
                    styles.menuItemText,
                    {
                      color: option.comingSoon ? colors.disabled : colors.text,
                    },
                  ]}
                >
                  {option.title}
                </Text>
              </View>
              {option.type === "switch" ? (
                <Switch
                  value={option.value}
                  onValueChange={option.onValueChange}
                  thumbColor={option.value ? colors.primary : "#ccc"}
                  trackColor={{ false: "#eee", true: colors.primaryDark }}
                />
              ) : option.comingSoon ? (
                <View
                  style={[
                    styles.comingSoonBadge,
                    { backgroundColor: colors.disabled },
                  ]}
                >
                  <Text
                    style={[
                      styles.comingSoonBadgeText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Próximamente
                  </Text>
                </View>
              ) : (
                <Ionicons
                  name="chevron-forward"
                  size={iconSize.sm}
                  color={colors.textTertiary}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  title: {
    fontSize: rf(28),
    fontWeight: "bold",
    marginBottom: spacing.lg,
  },
  menuContainer: {
    borderRadius: borderRadius.md,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    borderBottomWidth: s(1),
    borderBottomColor: "#f0f0f0",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  menuItemText: {
    fontSize: rf(16),
    fontWeight: "500",
  },
  comingSoonBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.md,
  },
  comingSoonBadgeText: {
    fontSize: rf(12),
  },
});

export default SettingsScreen;
