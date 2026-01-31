import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
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
      <ScrollView style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Más opciones</Text>

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
            Versión 1.0.0
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
