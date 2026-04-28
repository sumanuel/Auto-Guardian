import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { borderRadius, iconSize, rf, spacing } from "../utils/responsive";

const TipsScreen = ({ navigation }) => {
  const { colors } = useTheme();

  const tips = [
    "Mantener los neumáticos con la presión correcta puede mejorar tu rendimiento de combustible hasta en un 3%.",
    "Una carga excesiva en el maletero aumenta el consumo. Lleva solo lo necesario.",
    "Los mantenimientos preventivos programados son más baratos que reparar una avería mayor por descuido.",
  ];

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
                name="bulb-outline"
                size={iconSize.lg}
                color="#D6E7FF"
              />
            </View>

            <View style={styles.heroInfo}>
              <Text style={styles.heroEyebrow}>Consejos prácticos</Text>
              <Text style={styles.heroTitle}>Ahorro y combustible</Text>
              <Text style={styles.heroSubtitle}>
                Acciones simples para reducir costos operativos y mejorar el
                rendimiento diario del vehículo.
              </Text>
            </View>
          </View>
        </LinearGradient>

        <Text style={[styles.sectionTitle, { color: colors.primary }]}>
          Recomendaciones rápidas
        </Text>

        {tips.map((tip, index) => (
          <View
            key={index}
            style={[styles.tipCard, { backgroundColor: colors.cardBackground }]}
          >
            <Ionicons
              name="bulb"
              size={iconSize.sm}
              color={colors.primary}
              style={styles.icon}
            />
            <Text style={[styles.tipContent, { color: colors.text }]}>
              {tip}
            </Text>
          </View>
        ))}
        <View style={{ height: 100 }} />
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
    paddingBottom: spacing.xl,
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
    width: spacing.xxxl,
    height: spacing.xxxl,
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
  heroTitle: {
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
  sectionTitle: {
    fontSize: rf(18),
    fontWeight: "bold",
    marginBottom: spacing.lg,
  },
  tipCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  icon: {
    marginRight: spacing.md,
    marginTop: spacing.xs,
  },
  tipContent: {
    fontSize: rf(14),
    lineHeight: rf(20),
    flex: 1,
  },
});

export default TipsScreen;
