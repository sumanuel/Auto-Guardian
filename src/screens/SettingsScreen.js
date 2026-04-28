import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
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
    {
      id: 6,
      title: "Moneda",
      icon: "cash-outline",
      screen: "CurrencySettings",
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[colors.primary, "#0F5FD2", "#0A3F8F"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroGradient}
        >
          <View style={styles.heroMediaRow}>
            <View style={[styles.iconBadge, styles.heroIconBadge]}>
              <Ionicons
                name="settings-outline"
                size={iconSize.lg}
                color="#D6E7FF"
              />
            </View>

            <View style={styles.headerInfo}>
              <Text style={styles.eyebrow}>Centro de ajustes</Text>
              <Text style={styles.title}>Configuración</Text>
              <Text style={styles.subtitle}>
                Personaliza alertas, catálogos, moneda y respaldo desde un panel
                central.
              </Text>
            </View>
          </View>
        </LinearGradient>

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
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  heroGradient: {
    marginHorizontal: -spacing.lg,
    marginTop: -spacing.lg,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  heroMediaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  iconBadge: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  heroIconBadge: {
    width: s(76),
    height: s(76),
    borderRadius: borderRadius.lg,
  },
  headerInfo: {
    flex: 1,
    gap: spacing.xxs,
  },
  eyebrow: {
    fontSize: rf(12),
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#D6E7FF",
  },
  title: {
    fontSize: rf(22),
    fontWeight: "800",
    color: "#fff",
  },
  subtitle: {
    fontSize: rf(13),
    lineHeight: rf(18),
    color: "#D6E7FF",
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
