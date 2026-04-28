import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import {
  borderRadius,
  hs,
  iconSize,
  rf,
  s,
  spacing,
  vs,
} from "../utils/responsive";

const AboutScreen = () => {
  const { colors } = useTheme();

  const features = [
    {
      icon: "people-outline",
      text: "Dueños de autos particulares que quieren organización",
    },
    {
      icon: "car-sport-outline",
      text: "Personas que manejan flotillas pequeñas",
    },
    {
      icon: "construct-outline",
      text: "Entusiastas del automovilismo que detallan cada modificación",
    },
    {
      icon: "cash-outline",
      text: "Cualquiera que quiera ahorrar en reparaciones costosas con mantenimiento preventivo",
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header con gradiente */}
        <LinearGradient
          colors={[colors.primary, "#0F5FD2", "#0A3F8F"]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.heroEyebrow}>Información de producto</Text>
          <View style={styles.iconContainer}>
            <Image
              source={require("../../assets/icon.png")}
              style={styles.appIcon}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>Auto-Guardian</Text>
          <Text style={styles.subtitle}>
            Bitácora clara para mantenimiento, documentos y costos del vehículo.
          </Text>
        </LinearGradient>

        {/* Contenido principal */}
        <View style={styles.content}>
          {/* Sección "Nuestra Historia" */}
          <View
            style={[styles.card, { backgroundColor: colors.cardBackground }]}
          >
            <View style={styles.cardHeader}>
              <Ionicons
                name="book-outline"
                size={iconSize.md}
                color={colors.primaryDark}
              />
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Nuestra Historia
              </Text>
            </View>
            <Text style={[styles.text, { color: colors.textSecondary }]}>
              Auto-Guardian nació de una necesidad personal: dejar de depender
              de papeles perdidos y memoria frágil para recordar cuándo le toca
              mantenimiento a nuestro vehículo.
            </Text>
            <Text style={[styles.text, { color: colors.textSecondary }]}>
              Creemos que un auto bien cuidado es sinónimo de{" "}
              <Text style={{ fontWeight: "bold", color: colors.primaryDark }}>
                seguridad, ahorro y tranquilidad
              </Text>
              .
            </Text>
            <Text style={[styles.text, { color: colors.textSecondary }]}>
              Por eso creamos una herramienta sencilla pero poderosa para que
              cualquier persona pueda ser el mejor cuidador de su automóvil.
            </Text>
          </View>

          {/* Sección "Para quién es esta app" */}
          <View
            style={[styles.card, { backgroundColor: colors.cardBackground }]}
          >
            <View style={styles.cardHeader}>
              <Ionicons
                name="people"
                size={iconSize.md}
                color={colors.primaryDark}
              />
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Para quién es esta app
              </Text>
            </View>

            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View
                  style={[
                    styles.iconBadge,
                    { backgroundColor: `${colors.primaryDark}15` },
                  ]}
                >
                  <Ionicons
                    name={feature.icon}
                    size={iconSize.md}
                    color={colors.primaryDark}
                  />
                </View>
                <Text
                  style={[styles.featureText, { color: colors.textSecondary }]}
                >
                  {feature.text}
                </Text>
              </View>
            ))}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Ionicons
              name="heart"
              size={iconSize.sm}
              color={colors.primaryDark}
            />
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              Hecho con amor para cuidar tu auto
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingTop: vs(28),
    paddingBottom: vs(28),
    paddingHorizontal: hs(24),
    alignItems: "center",
    borderBottomLeftRadius: s(30),
    borderBottomRightRadius: s(30),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: s(8),
    elevation: s(8),
  },
  iconContainer: {
    width: s(96),
    height: s(96),
    borderRadius: s(28),
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    padding: s(8),
    borderWidth: s(1.5),
    borderColor: "rgba(255, 255, 255, 0.22)",
  },
  appIcon: {
    width: "100%",
    height: "100%",
  },
  heroEyebrow: {
    fontSize: rf(12),
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.7,
    color: "rgba(255,255,255,0.78)",
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: rf(22),
    fontWeight: "800",
    color: "#fff",
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  subtitle: {
    fontSize: rf(14),
    color: "#fff",
    textAlign: "center",
    opacity: 0.95,
    fontWeight: "500",
    lineHeight: rf(20),
  },
  content: {
    padding: spacing.lg,
  },
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: s(4),
    elevation: s(3),
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  cardTitle: {
    fontSize: rf(18),
    fontWeight: "bold",
  },
  text: {
    fontSize: rf(14),
    lineHeight: rf(22),
    marginBottom: spacing.sm,
    textAlign: "justify",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  iconBadge: {
    width: s(48),
    height: s(48),
    borderRadius: s(24),
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: {
    flex: 1,
    fontSize: rf(14),
    lineHeight: rf(20),
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    marginTop: spacing.lg,
    marginBottom: vs(40),
  },
  footerText: {
    fontSize: rf(14),
    fontStyle: "italic",
  },
});

export default AboutScreen;
