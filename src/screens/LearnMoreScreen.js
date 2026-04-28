import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
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
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[colors.primary, "#2D7EEA", "#0F5FD2"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroMediaRow}>
            <View style={styles.heroIconBadge}>
              <Ionicons
                name="school-outline"
                size={iconSize.lg}
                color="#D6E7FF"
              />
            </View>

            <View style={styles.heroInfo}>
              <Text style={styles.heroEyebrow}>Centro de aprendizaje</Text>
              <Text style={styles.title}>Tips & Guías</Text>
              <Text style={styles.heroSubtitle}>
                Consulta consejos rápidos, criterios de mantenimiento y señales
                clave para entender mejor tu vehículo.
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: vs(100),
  },
  heroCard: {
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    marginBottom: spacing.lg,
  },
  heroMediaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  heroIconBadge: {
    width: s(68),
    height: s(68),
    borderRadius: borderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  heroInfo: {
    flex: 1,
  },
  heroEyebrow: {
    fontSize: rf(12),
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.7,
    color: "rgba(255,255,255,0.74)",
    marginBottom: spacing.xxs,
  },
  title: {
    fontSize: rf(22),
    fontWeight: "800",
    color: "#fff",
  },
  heroSubtitle: {
    fontSize: rf(13),
    lineHeight: rf(18),
    color: "rgba(255,255,255,0.84)",
    marginTop: spacing.xxs,
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
