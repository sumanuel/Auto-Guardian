import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Constants from "expo-constants";
import { LinearGradient } from "expo-linear-gradient";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAppSettings } from "../context/AppSettingsContext";
import { useTheme } from "../context/ThemeContext";
import {
  borderRadius,
  iconSize,
  rf,
  s,
  spacing,
  vs,
} from "../utils/responsive";

const MoreScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const {
    storeUpdateAvailable,
    storeLatestVersion,
    openStoreUpdate,
    updateAvailable,
    applyUpdate,
  } = useAppSettings();

  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        alert("Permisos de notificación denegados");
      }
    };
    requestPermissions();
  }, []);

  const menuOptions = [
    ...(storeUpdateAvailable
      ? [
          {
            id: -1,
            title: storeLatestVersion
              ? `Nueva versión en Play Store (${storeLatestVersion})`
              : "Nueva versión en Play Store",
            icon: "logo-google-playstore",
            comingSoon: false,
            onPress: openStoreUpdate,
          },
        ]
      : []),
    ...(updateAvailable
      ? [
          {
            id: 0,
            title: "Actualización disponible",
            icon: "download-outline",
            comingSoon: false,
            onPress: applyUpdate,
          },
        ]
      : []),
    {
      id: 1,
      title: "Configuración",
      icon: "settings-outline",
      comingSoon: false,
      screen: "SettingsScreen",
    },
    // {
    //   id: 2,
    //   title: "Contactos",
    //   icon: "people-outline",
    //   comingSoon: false,
    //   screen: "Contacts",
    // },
    {
      id: 3,
      title: "Tips & Guías",
      icon: "help-circle-outline",
      comingSoon: false,
      screen: "LearnMore",
    },
    // {
    //   id: 4,
    //   title: "Exportar datos",
    //   icon: "cloud-download-outline",
    //   comingSoon: true,
    // },
    {
      id: 5,
      title: "Acerca de",
      icon: "information-circle-outline",
      comingSoon: false,
      screen: "About",
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
                name="apps-outline"
                size={iconSize.lg}
                color="#D6E7FF"
              />
            </View>

            <View style={styles.headerInfo}>
              <Text style={styles.eyebrow}>Centro de utilidades</Text>
              <Text style={styles.title}>Más opciones</Text>
              <Text style={styles.subtitle}>
                Reúne accesos secundarios, recursos de aprendizaje y estado de
                versión de la aplicación.
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
          {menuOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.menuItem}
              disabled={option.comingSoon}
              onPress={() => {
                if (option.comingSoon) return;
                if (typeof option.onPress === "function") {
                  option.onPress();
                  return;
                }
                if (option.screen) {
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
              {option.comingSoon && (
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
              )}
              {!option.comingSoon && (
                <Ionicons
                  name="chevron-forward"
                  size={iconSize.sm}
                  color={colors.textTertiary}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.primary }]}>
            Auto-Guardian
          </Text>
          <Text style={[styles.footerSubtext, { color: colors.textSecondary }]}>
            Versión {Constants?.expoConfig?.version || "-"}
          </Text>
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
  footer: {
    marginTop: vs(40),
    alignItems: "center",
    paddingVertical: spacing.lg,
  },
  footerText: {
    fontSize: rf(18),
    fontWeight: "bold",
  },
  footerSubtext: {
    fontSize: rf(14),
    marginTop: spacing.xxs,
  },
});

export default MoreScreen;
