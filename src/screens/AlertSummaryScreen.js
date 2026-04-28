import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useApp } from "../context/AppContext";
import { useTheme } from "../context/ThemeContext";
import { COLORS } from "../data/constants";
import {
  borderRadius,
  hs,
  iconSize,
  rf,
  s,
  spacing,
  vs,
} from "../utils/responsive";

const SummaryHero = ({ summary }) => {
  const overdueCount =
    summary?.alerts?.filter((item) => item.type === "overdue").length || 0;
  const urgentCount =
    summary?.alerts?.filter((item) => item.type === "urgent").length || 0;
  const totalDocuments = summary?.totalDocuments || 0;
  const totalAlerts = overdueCount + urgentCount;

  return (
    <LinearGradient
      colors={[COLORS.primary, "#0F5FD2", "#0A3F8F"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.heroGradient}
    >
      <View style={styles.heroTopRow}>
        <View style={styles.heroMediaRow}>
          <View style={[styles.imagePlaceholder, styles.heroImagePlaceholder]}>
            <Ionicons
              name="notifications-outline"
              size={s(60)}
              color="#D6E7FF"
            />
          </View>

          <View style={styles.headerInfo}>
            <Text style={styles.heroEyebrow}>Centro de alertas</Text>
            <Text style={styles.heroTitle}>Prioridades activas</Text>
            <Text style={styles.heroSubtitle}>
              Revisa vencimientos, mantenimientos críticos y documentos próximos
              a expirar.
            </Text>

            <View style={styles.heroMetaRow}>
              <View style={styles.heroMetaPill}>
                <Text style={styles.heroMetaText}>{totalAlerts} alertas</Text>
              </View>
              <View style={styles.heroMetaPill}>
                <Ionicons
                  name="document-text-outline"
                  size={iconSize.xs}
                  color="#D6E7FF"
                />
                <Text style={styles.heroMetaText}>
                  {totalDocuments} documentos
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

const VehiclesSection = ({ summary }) => {
  const { colors } = useTheme();

  if (!summary) {
    return (
      <View style={styles.sectionBlock}>
        <Text style={[styles.errorText, { color: colors.text }]}>
          No hay información de alertas disponible
        </Text>
      </View>
    );
  }

  const overdueAlerts = summary.alerts.filter((a) => a.type === "overdue");
  const urgentAlerts = summary.alerts.filter((a) => a.type === "urgent");

  const hasAlerts = overdueAlerts.length > 0 || urgentAlerts.length > 0;

  const renderAlertItem = ({ item }) => (
    <View
      style={[
        styles.alertItem,
        { backgroundColor: colors.cardBackground, borderColor: colors.border },
      ]}
    >
      <View style={styles.alertHeader}>
        <View
          style={[
            styles.alertIcon,
            {
              backgroundColor:
                item.type === "overdue"
                  ? "rgba(244,67,54,0.14)"
                  : "rgba(255,170,0,0.14)",
            },
          ]}
        >
          <Ionicons
            name={item.type === "overdue" ? "alert-circle" : "warning"}
            size={iconSize.md}
            color={item.type === "overdue" ? COLORS.danger : COLORS.warning}
          />
        </View>
        <View style={styles.alertContent}>
          <Text style={[styles.alertVehicle, { color: colors.text }]}>
            {item.vehicle}
          </Text>
          <Text
            style={[styles.alertMaintenance, { color: colors.textSecondary }]}
          >
            {item.maintenance}
          </Text>
        </View>
      </View>
      <Text style={[styles.alertReason, { color: colors.textSecondary }]}>
        {item.reason}
      </Text>
    </View>
  );

  return (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionLead}>
        <Text style={[styles.sectionEyebrow, { color: colors.primaryDark }]}>
          Vehículos
        </Text>
        <Text style={[styles.sectionHeading, { color: colors.text }]}>
          Mantenimientos críticos
        </Text>
      </View>
      {!hasAlerts ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No tienes mantenimientos pendientes o vencidos en este momento.
          </Text>
        </View>
      ) : (
        <>
          {overdueAlerts.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons
                  name="alert-circle"
                  size={iconSize.sm}
                  color={COLORS.danger}
                />
                <Text style={[styles.sectionTitle, { color: COLORS.danger }]}>
                  Vencidos ({overdueAlerts.length})
                </Text>
              </View>
              {overdueAlerts.map((item, index) => (
                <View key={`overdue-${index}`}>
                  {renderAlertItem({ item })}
                </View>
              ))}
            </View>
          )}

          {urgentAlerts.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons
                  name="warning"
                  size={iconSize.sm}
                  color={COLORS.warning}
                />
                <Text style={[styles.sectionTitle, { color: COLORS.warning }]}>
                  Urgentes ({urgentAlerts.length})
                </Text>
              </View>
              {urgentAlerts.map((item, index) => (
                <View key={`urgent-${index}`}>{renderAlertItem({ item })}</View>
              ))}
            </View>
          )}
        </>
      )}
    </View>
  );
};

const DocumentsSection = () => {
  const { colors } = useTheme();
  const { getExpiringDocuments, updateAppBadge } = useApp();
  const [expiringDocuments, setExpiringDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadExpiringDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const documents = await getExpiringDocuments(30);
      setExpiringDocuments(documents);

      // Actualizar el badge después de cargar los documentos
      await updateAppBadge();
    } catch (error) {
      console.error("Error loading expiring documents:", error);
    } finally {
      setLoading(false);
    }
  }, [getExpiringDocuments, updateAppBadge]);

  useEffect(() => {
    loadExpiringDocuments();
  }, [loadExpiringDocuments]);

  const renderDocumentItem = ({ item }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day

    // Parse expiry date more carefully
    let expiryDate;
    if (typeof item.expiry_date === "string") {
      // If it's a string like "2025-12-18", parse it correctly
      const [year, month, day] = item.expiry_date.split("-").map(Number);
      expiryDate = new Date(year, month - 1, day); // month is 0-indexed
    } else {
      expiryDate = new Date(item.expiry_date);
    }
    expiryDate.setHours(0, 0, 0, 0); // Reset time to start of day

    // Calculate days remaining more accurately
    const timeDiff = expiryDate.getTime() - today.getTime();
    const daysRemaining = Math.round(timeDiff / (1000 * 60 * 60 * 24));

    // Helper function to format date as dd/mm/yyyy
    const formatDate = (dateString) => {
      const [year, month, day] = dateString.split("-");
      return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
    };

    // Determine color and status
    let iconColor = COLORS.warning;
    let statusText = "";
    let statusColor = colors.textSecondary;

    if (daysRemaining < 0) {
      // Already expired (shouldn't happen with current filter, but just in case)
      iconColor = COLORS.danger;
      statusText = `Venció hace ${Math.abs(daysRemaining)} día${
        Math.abs(daysRemaining) !== 1 ? "s" : ""
      }`;
      statusColor = COLORS.danger;
    } else if (daysRemaining === 0) {
      // Expires today
      iconColor = COLORS.danger;
      statusText = "¡Vence HOY!";
      statusColor = COLORS.danger;
    } else if (daysRemaining === 1) {
      // Expires tomorrow
      iconColor = COLORS.danger;
      statusText = "Vence mañana";
      statusColor = COLORS.danger;
    } else if (daysRemaining <= 7) {
      // Expires this week
      iconColor = COLORS.warning;
      statusText = `Vence en ${daysRemaining} días`;
      statusColor = COLORS.warning;
    } else {
      // Expires later
      iconColor = COLORS.info || COLORS.primary;
      statusText = `Vence en ${daysRemaining} días`;
      statusColor = colors.textSecondary;
    }

    return (
      <View
        style={[
          styles.alertItem,
          {
            backgroundColor: colors.cardBackground,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.alertHeader}>
          <View
            style={[styles.alertIcon, { backgroundColor: `${iconColor}18` }]}
          >
            <Ionicons
              name="document-text"
              size={iconSize.md}
              color={iconColor}
            />
          </View>
          <View style={styles.alertContent}>
            <Text style={[styles.alertVehicle, { color: colors.text }]}>
              {item.document_type_name || "Documento"}
            </Text>
            <Text
              style={[styles.alertMaintenance, { color: colors.textSecondary }]}
            >
              {item.vehicle_name || "Vehículo"}
            </Text>
          </View>
        </View>
        <Text style={[styles.alertReason, { color: statusColor }]}>
          {statusText} ({formatDate(item.expiry_date)})
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.sectionBlock}>
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Cargando documentos...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionLead}>
        <Text style={[styles.sectionEyebrow, { color: colors.primaryDark }]}>
          Documentos
        </Text>
        <Text style={[styles.sectionHeading, { color: colors.text }]}>
          Vencimientos próximos
        </Text>
      </View>
      {expiringDocuments.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons
            name="document-outline"
            size={iconSize.xxl}
            color={colors.textSecondary}
          />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Sin documentos urgentes
          </Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No tienes documentos urgentes que requieran atención.
          </Text>
        </View>
      ) : (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="time" size={iconSize.sm} color={COLORS.warning} />
            <Text style={[styles.sectionTitle, { color: COLORS.warning }]}>
              Urgentes ({expiringDocuments.length})
            </Text>
          </View>
          {expiringDocuments.map((item) => (
            <View key={`document-${item.id}`}>
              {renderDocumentItem({ item })}
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const AlertSummaryScreen = ({ route }) => {
  const { colors } = useTheme();
  const { summary } = route.params;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <SummaryHero summary={summary} />
        </View>
        <VehiclesSection summary={summary} />
        <DocumentsSection />
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
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  header: {
    paddingBottom: spacing.md,
  },
  heroGradient: {
    paddingHorizontal: hs(20),
    paddingTop: vs(26),
    paddingBottom: vs(18),
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  heroMediaRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  imagePlaceholder: {
    width: s(100),
    height: s(100),
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    marginRight: hs(14),
  },
  heroImagePlaceholder: {
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  headerInfo: {
    flex: 1,
  },
  heroEyebrow: {
    fontSize: rf(12),
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: spacing.xs,
    color: "rgba(255,255,255,0.74)",
  },
  heroTitle: {
    fontSize: rf(24),
    fontWeight: "800",
    marginBottom: spacing.xs,
    color: "#fff",
  },
  heroSubtitle: {
    fontSize: rf(14),
    lineHeight: rf(20),
    color: "rgba(255,255,255,0.84)",
    marginBottom: vs(6),
  },
  heroMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  heroMetaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xxs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: s(999),
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  heroMetaText: {
    fontSize: rf(12),
    fontWeight: "700",
    color: "#fff",
  },
  backButton: {
    padding: spacing.xs,
    marginRight: spacing.xs,
  },
  headerContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: iconSize.xl,
    height: iconSize.xl,
    borderRadius: borderRadius.xl,
    backgroundColor: COLORS.warning + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  iconSuccess: {
    backgroundColor: COLORS.success + "20",
  },
  title: {
    fontSize: rf(20),
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: vs(60),
  },
  emptyTitle: {
    fontSize: rf(20),
    fontWeight: "bold",
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptyText: {
    fontSize: rf(16),
    textAlign: "center",
  },
  errorText: {
    fontSize: rf(16),
    textAlign: "center",
    padding: spacing.lg,
  },
  sectionBlock: {
    padding: spacing.md,
    paddingTop: 0,
  },
  sectionLead: {
    marginBottom: spacing.md,
  },
  sectionEyebrow: {
    fontSize: rf(12),
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: spacing.xxs,
  },
  sectionHeading: {
    fontSize: rf(20),
    fontWeight: "800",
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: rf(18),
    fontWeight: "bold",
    marginLeft: spacing.xs,
  },
  alertItem: {
    padding: spacing.md,
    marginBottom: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: s(1),
  },
  alertIcon: {
    width: s(40),
    height: s(40),
    borderRadius: s(20),
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  alertHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  alertContent: {
    flex: 1,
  },
  alertVehicle: {
    fontSize: rf(16),
    fontWeight: "700",
  },
  alertMaintenance: {
    fontSize: rf(14),
  },
  alertReason: {
    fontSize: rf(13),
    lineHeight: rf(18),
  },
});

export default AlertSummaryScreen;
