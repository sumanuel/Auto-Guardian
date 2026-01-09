import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import {
  borderRadius,
  iconSize,
  rf,
  s,
  spacing,
  vs,
} from "../utils/responsive";

const LearnMoreScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();

  const learnOptions = [
    {
      id: 1,
      title: "Consejos",
      icon: "bulb-outline",
      description: "Consejos útiles para el cuidado de tu vehículo",
      screen: "Tips",
    },
    {
      id: 2,
      title: "Recomendaciones",
      icon: "book-outline",
      description: "Recomendaciones generales sobre mantenimiento",
      screen: "Recommendations",
    },
    {
      id: 3,
      title: "Aprende sobre tu auto",
      icon: "search-outline",
      description: "Información detallada sobre componentes del vehículo",
      screen: "LearnCar",
    },
    {
      id: 4,
      title: "Tips de Mantenimiento",
      icon: "construct-outline",
      description:
        "Recomendaciones por tipo de mantenimiento y estación del año",
      screen: "Recommendations",
    },
  ];

  const handleOptionPress = (option) => {
    if (option.screen) {
      navigation.navigate(option.screen);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Tips & Guías</Text>

        <View
          style={[
            styles.menuContainer,
            { backgroundColor: colors.cardBackground },
          ]}
        >
          {learnOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.menuItem}
              onPress={() => handleOptionPress(option)}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons
                  name={option.icon}
                  size={iconSize.md}
                  color={colors.primary}
                  style={styles.menuItemIcon}
                />
                <View style={styles.textContainer}>
                  <Text style={[styles.menuItemText, { color: colors.text }]}>
                    {option.title}
                  </Text>
                  <Text
                    style={[
                      styles.menuItemDescription,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {option.description}
                  </Text>
                </View>
              </View>
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: vs(100),
  },
  title: {
    fontSize: rf(24),
    fontWeight: "bold",
    marginBottom: spacing.lg,
  },
  menuContainer: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: s(1),
    borderBottomColor: "#e0e0e0",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuItemIcon: {
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  menuItemText: {
    fontSize: rf(16),
    fontWeight: "500",
  },
  menuItemDescription: {
    fontSize: rf(14),
    marginTop: spacing.xs,
  },
});

export default LearnMoreScreen;
