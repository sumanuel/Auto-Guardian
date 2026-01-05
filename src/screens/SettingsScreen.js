import { Ionicons } from "@expo/vector-icons";
import { Switch, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { useResponsive } from "../hooks/useResponsive";

const SettingsScreen = ({ navigation }) => {
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const { scale, verticalScale, moderateScale } = useResponsive();

  const responsiveStyles = {
    container: {
      flex: 1,
    },
    content: {
      flex: 1,
      padding: scale(20),
    },
    title: {
      fontSize: moderateScale(28),
      fontWeight: "bold",
      marginBottom: verticalScale(20),
    },
    menuContainer: {
      borderRadius: scale(12),
      overflow: "hidden",
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: scale(16),
      borderBottomWidth: 1,
      borderBottomColor: "#f0f0f0",
    },
    menuItemLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(12),
    },
    menuItemText: {
      fontSize: moderateScale(16),
      fontWeight: "500",
    },
    comingSoonBadge: {
      paddingHorizontal: scale(12),
      paddingVertical: verticalScale(4),
      borderRadius: scale(12),
    },
    comingSoonBadgeText: {
      fontSize: moderateScale(12),
    },
  };

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
    <View
      style={[
        responsiveStyles.container,
        { backgroundColor: colors.background },
      ]}
    >
      <View style={responsiveStyles.content}>
        <Text style={[responsiveStyles.title, { color: colors.text }]}>
          Configuración
        </Text>

        <View
          style={[
            responsiveStyles.menuContainer,
            { backgroundColor: colors.cardBackground },
          ]}
        >
          {settingsOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={responsiveStyles.menuItem}
              disabled={option.comingSoon}
              onPress={() => {
                if (!option.comingSoon && option.screen) {
                  navigation.navigate(option.screen);
                }
              }}
            >
              <View style={responsiveStyles.menuItemLeft}>
                <Ionicons
                  name={option.icon}
                  size={24}
                  color={option.comingSoon ? colors.disabled : colors.primary}
                />
                <Text
                  style={[
                    responsiveStyles.menuItemText,
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
                    responsiveStyles.comingSoonBadge,
                    { backgroundColor: colors.disabled },
                  ]}
                >
                  <Text
                    style={[
                      responsiveStyles.comingSoonBadgeText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Próximamente
                  </Text>
                </View>
              ) : (
                <Ionicons
                  name="chevron-forward"
                  size={20}
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
