import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { useResponsive } from "../hooks/useResponsive";

const MoreScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { scale, verticalScale, moderateScale } = useResponsive();

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

  const responsiveStyles = {
    container: {
      flex: 1,
    },
    content: {
      padding: scale(20),
    },
    title: {
      fontSize: moderateScale(24),
      fontWeight: "bold",
      marginBottom: verticalScale(24),
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
    footer: {
      marginTop: verticalScale(40),
      alignItems: "center",
      paddingVertical: verticalScale(20),
    },
    footerText: {
      fontSize: moderateScale(18),
      fontWeight: "bold",
    },
    footerSubtext: {
      fontSize: moderateScale(14),
      marginTop: verticalScale(4),
    },
  };

  return (
    <View
      style={[
        responsiveStyles.container,
        { backgroundColor: colors.background },
      ]}
    >
      <ScrollView style={responsiveStyles.content}>
        <Text style={[responsiveStyles.title, { color: colors.text }]}>
          Más opciones
        </Text>

        <View
          style={[
            responsiveStyles.menuContainer,
            { backgroundColor: colors.cardBackground },
          ]}
        >
          {menuOptions.map((option) => (
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
              {option.comingSoon ? (
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

        <View style={responsiveStyles.footer}>
          <Text
            style={[responsiveStyles.footerText, { color: colors.primary }]}
          >
            Auto-Guardian
          </Text>
          <Text
            style={[
              responsiveStyles.footerSubtext,
              { color: colors.textSecondary },
            ]}
          >
            Tu compañero de confianza
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default MoreScreen;
