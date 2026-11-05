import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useApp } from "../context/AppContext";
import { useTheme } from "../context/ThemeContext";
import { COLORS } from "../data/constants";
import { GUIDE_STEPS } from "../data/guideContent";
import { useGuide } from "../hooks/useGuide";
import {
  borderRadius,
  iconSize,
  rf,
  s,
  spacing,
  vs,
} from "../utils/responsive";

const GettingStartedScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { vehicles } = useApp();
  const guide = useGuide();
  const { markSeen } = guide;

  useFocusEffect(
    useCallback(() => {
      markSeen();
    }, [markSeen]),
  );

  const vehicleId = vehicles[0]?.id;
  // Sin vehículo, los pasos que lo necesitan llevan primero a registrarlo
  const goTo = (key) => {
    const needsVehicle = key !== "vehicle" && key !== "stats";
    if (needsVehicle && !vehicleId) {
      navigation.navigate("Inicio", { screen: "AddVehicle" });
      return;
    }
    const targets = {
      vehicle: ["Inicio", "AddVehicle"],
      schedule: ["Inicio", "AddMaintenance", { vehicleId }],
      complete: ["Inicio", "MaintenanceHistory", { vehicleId }],
      spending: ["MRO", "AddExpense", { vehicleId }],
      documents: [
        "Documentos",
        "AddDocument",
        { vehicleId, vehicle: vehicles[0] },
      ],
      stats: ["MRO", "StatsMain"],
    };
    const [tab, screen, params] = targets[key];
    navigation.navigate(tab, { screen, params });
  };

  const pct = Math.round((guide.doneCount / guide.total) * 100);
  const allDone = guide.doneCount === guide.total;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[colors.primary, "#1673E6", "#0F5FD2"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroMediaRow}>
            <View style={styles.heroIconBadge}>
              <Ionicons
                name="rocket-outline"
                size={iconSize.lg}
                color="#D6E7FF"
              />
            </View>
            <View style={styles.heroInfo}>
              <Text style={styles.heroEyebrow}>Guía paso a paso</Text>
              <Text style={styles.title}>Primeros pasos</Text>
              <Text style={styles.heroSubtitle}>
                Sigue estos pasos en orden para sacarle provecho a la app. Se
                marcan solos cuando los completas.
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.progressTitle, { color: colors.text }]}>
            {allDone
              ? "¡Todo listo!"
              : `${guide.doneCount} de ${guide.total} pasos listos`}
          </Text>
          <View
            style={[styles.progressTrack, { backgroundColor: colors.border }]}
          >
            <View
              style={[
                styles.progressFill,
                { backgroundColor: COLORS.success, width: `${pct}%` },
              ]}
            />
          </View>
        </View>

        {guide.steps.map((step, index) => {
          const info = GUIDE_STEPS[step.key];
          return (
            <View
              key={step.key}
              style={[
                styles.card,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor: step.done ? colors.border : colors.primary,
                  opacity: step.done ? 0.75 : 1,
                },
              ]}
            >
              <View style={styles.stepHeader}>
                <View
                  style={[
                    styles.stepBadge,
                    {
                      backgroundColor: step.done
                        ? COLORS.success
                        : colors.inputBackground,
                    },
                  ]}
                >
                  {step.done ? (
                    <Ionicons
                      name="checkmark"
                      size={iconSize.sm}
                      color="#fff"
                    />
                  ) : (
                    <Text style={[styles.stepNumber, { color: colors.text }]}>
                      {index + 1}
                    </Text>
                  )}
                </View>
                <Text style={[styles.stepTitle, { color: colors.text }]}>
                  {info.title}
                </Text>
                {step.done && (
                  <Text style={[styles.doneLabel, { color: COLORS.success }]}>
                    Listo
                  </Text>
                )}
              </View>
              <Text style={[styles.stepText, { color: colors.textSecondary }]}>
                {info.text}
              </Text>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  step.done
                    ? { borderColor: colors.primary, borderWidth: s(1) }
                    : { backgroundColor: colors.primaryDark },
                ]}
                onPress={() => goTo(step.key)}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.actionText,
                    { color: step.done ? colors.primary : "#fff" },
                  ]}
                >
                  {info.action}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}

        <TouchableOpacity
          style={styles.helpLink}
          onPress={() => navigation.navigate("HelpCenter")}
        >
          <Text style={[styles.helpLinkText, { color: colors.primary }]}>
            Ver centro de ayuda completo
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: vs(100),
  },
  heroCard: {
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
  heroIconBadge: {
    width: s(68),
    height: s(68),
    borderRadius: borderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  heroInfo: { flex: 1 },
  heroEyebrow: {
    fontSize: rf(12),
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.7,
    color: "rgba(255,255,255,0.74)",
    marginBottom: spacing.xxs,
  },
  title: { fontSize: rf(22), fontWeight: "800", color: "#fff" },
  heroSubtitle: {
    fontSize: rf(13),
    lineHeight: rf(18),
    color: "rgba(255,255,255,0.84)",
    marginTop: spacing.xxs,
  },
  card: {
    borderRadius: borderRadius.md,
    borderWidth: s(1),
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  progressTitle: { fontSize: rf(15), fontWeight: "800" },
  progressTrack: {
    height: s(8),
    borderRadius: borderRadius.xs,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: borderRadius.xs },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  stepBadge: {
    width: s(30),
    height: s(30),
    borderRadius: s(15),
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumber: { fontSize: rf(14), fontWeight: "800" },
  stepTitle: { flex: 1, fontSize: rf(15), fontWeight: "800" },
  doneLabel: { fontSize: rf(12), fontWeight: "700" },
  stepText: { fontSize: rf(13), lineHeight: rf(19) },
  actionButton: {
    minHeight: vs(44),
    borderRadius: borderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: { fontSize: rf(14), fontWeight: "700" },
  helpLink: {
    minHeight: vs(48),
    alignItems: "center",
    justifyContent: "center",
  },
  helpLinkText: { fontSize: rf(14), fontWeight: "700" },
});

export default GettingStartedScreen;
