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
import { ms, rf } from "../utils/responsive";

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
    {
      id: 2,
      title: "Contactos",
      icon: "people-outline",
      comingSoon: false,
      screen: "Contacts",
    },
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
                  size={ms(24)}
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
                  size={ms(20)}
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
    padding: ms(20),
  },
  title: {
    fontSize: rf(28),
    fontWeight: "bold",
    marginBottom: ms(20),
  },
  menuContainer: {
    borderRadius: ms(12),
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: ms(16),
    borderBottomWidth: ms(1),
    borderBottomColor: "#f0f0f0",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: ms(12),
  },
  menuItemText: {
    fontSize: rf(16),
    fontWeight: "500",
  },
  comingSoonBadge: {
    paddingHorizontal: ms(12),
    paddingVertical: ms(4),
    borderRadius: ms(12),
  },
  comingSoonBadgeText: {
    fontSize: rf(12),
  },
  footer: {
    marginTop: ms(40),
    alignItems: "center",
    paddingVertical: ms(20),
  },
  footerText: {
    fontSize: rf(18),
    fontWeight: "bold",
  },
  footerSubtext: {
    fontSize: rf(14),
    marginTop: ms(4),
  },
});

export default MoreScreen;
