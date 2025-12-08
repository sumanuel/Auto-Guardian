import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../context/ThemeContext";

const MoreScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
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
      title: "Exportar datos",
      icon: "cloud-download-outline",
      comingSoon: true,
    },
    {
      id: 4,
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
                  size={24}
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
                  size={20}
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
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },
  menuContainer: {
    borderRadius: 12,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: "500",
  },
  comingSoonBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  comingSoonBadgeText: {
    fontSize: 12,
  },
  footer: {
    marginTop: 40,
    alignItems: "center",
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  footerSubtext: {
    fontSize: 14,
    marginTop: 4,
  },
});

export default MoreScreen;
