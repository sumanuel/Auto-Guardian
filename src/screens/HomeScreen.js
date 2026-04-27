import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import Button from "../components/common/Button";
import VehicleCard from "../components/vehicles/VehicleCard";
import { useApp } from "../context/AppContext";
import { useTheme } from "../context/ThemeContext";
import { COLORS } from "../data/constants";
import { useDialog } from "../hooks/useDialog";
import {
  borderRadius,
  hs,
  iconSize,
  ms,
  rf,
  s,
  spacing,
  vs,
} from "../utils/responsive";

const StatCard = ({ colors, icon, label, value, tone }) => {
  const toneMap = {
    primary: {
      iconBg: "rgba(255, 255, 255, 0.16)",
      iconColor: "#FFFFFF",
      borderColor: "rgba(255, 255, 255, 0.14)",
      valueColor: "#FFFFFF",
      labelColor: "rgba(255, 255, 255, 0.78)",
    },
    danger: {
      iconBg: "rgba(244, 67, 54, 0.14)",
      iconColor: COLORS.danger,
      borderColor: "rgba(244, 67, 54, 0.18)",
      valueColor: colors.text,
      labelColor: colors.textSecondary,
    },
    warning: {
      iconBg: "rgba(255, 152, 0, 0.14)",
      iconColor: COLORS.warning,
      borderColor: "rgba(255, 152, 0, 0.18)",
      valueColor: colors.text,
      labelColor: colors.textSecondary,
    },
    info: {
      iconBg: "rgba(33, 150, 243, 0.14)",
      iconColor: colors.primary,
      borderColor: colors.border,
      valueColor: colors.text,
      labelColor: colors.textSecondary,
    },
  };

  const palette = toneMap[tone] || toneMap.info;
  const isPrimary = tone === "primary";

  return (
    <View
      style={[
        styles.statCard,
        {
          backgroundColor: isPrimary
            ? "rgba(255,255,255,0.12)"
            : colors.cardBackground,
          borderColor: palette.borderColor,
        },
      ]}
    >
      <View style={[styles.statIconWrap, { backgroundColor: palette.iconBg }]}>
        <Ionicons name={icon} size={iconSize.sm} color={palette.iconColor} />
      </View>
      <View style={styles.statBody}>
        <Text style={[styles.statValue, { color: palette.valueColor }]}>
          {value}
        </Text>
        <Text style={[styles.statLabel, { color: palette.labelColor }]}>
          {label}
        </Text>
      </View>
    </View>
  );
};

const HomeScreen = ({ navigation }) => {
  const {
    vehicles,
    loading,
    loadVehicles,
    removeVehicle,
    getUpcomingMaintenances,
    checkPendingMaintenances,
  } = useApp();
  const { DialogComponent, showDialog } = useDialog();
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = React.useState(false);
  const [alertSummary, setAlertSummary] = React.useState(null);

  const overdueCount = alertSummary?.totalOverdue || 0;
  const urgentCount = alertSummary?.totalUrgent || 0;
  const expiringDocumentsCount = alertSummary?.totalDocuments || 0;
  const totalAlerts = overdueCount + urgentCount + expiringDocumentsCount;

  const loadAlertSummary = React.useCallback(async () => {
    if (!checkPendingMaintenances) return;

    const summary = await checkPendingMaintenances();
    if (summary) {
      setAlertSummary(summary);
    }
  }, [checkPendingMaintenances]);

  React.useEffect(() => {
    loadAlertSummary();
  }, [loadAlertSummary, vehicles]);

  const showAlertDetails = () => {
    navigation.navigate("AlertSummary", { summary: alertSummary });
  };

  const vehiclesWithUpcoming = React.useMemo(
    () =>
      vehicles.map((vehicle) => ({
        ...vehicle,
        upcomingCount: getUpcomingMaintenances(vehicle.id, vehicle.currentKm)
          .length,
      })),
    [vehicles, getUpcomingMaintenances],
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadVehicles();
    setRefreshing(false);
  };

  const renderVehicleCard = ({ item }) => (
    <VehicleCard
      vehicle={item}
      onPress={() =>
        navigation.navigate("VehicleDetail", { vehicleId: item.id })
      }
      onEdit={(vehicle) => navigation.navigate("AddVehicle", { vehicle })}
      onDelete={handleDeleteVehicle}
      showUpcoming
      showDialog={showDialog}
    />
  );

  const handleDeleteVehicle = async (vehicleId) => {
    try {
      await removeVehicle(vehicleId);
    } catch (error) {
      console.error("Error al eliminar vehículo:", error);
    }
  };

  const renderTopContent = (showSearchSection = true) => (
    <>
      <LinearGradient
        colors={[COLORS.primary, "#0F5FD2", "#0A3F8F"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerTopRow}>
          <View style={styles.headerLeft}>
            <View style={styles.eyebrowRow}>
              <Ionicons
                name="shield-checkmark-outline"
                size={iconSize.sm}
                color="rgba(255,255,255,0.88)"
              />
              <Text style={styles.headerEyebrow}>Centro de control</Text>
            </View>
            <Text style={styles.headerTitle}>Auto-Guardian</Text>
            <Text style={styles.headerSubtitle}>
              Supervisa mantenimientos, alertas y documentos desde una sola
              vista.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.helpButtonHeader}
            onPress={() =>
              showDialog({
                title: "Inicio",
                message:
                  "Aquí puedes ver el estado general de tus vehículos, revisar alertas pendientes y entrar rápidamente al detalle de cada unidad.",
                type: "info",
              })
            }
          >
            <Ionicons
              name="information-circle-outline"
              size={iconSize.lg}
                color="#fff"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.heroPanel}>
          <View style={styles.heroPanelHeader}>
            <View style={styles.heroTitleWrap}>
              <Text style={styles.heroPanelLabel}>Estado operativo</Text>
              <Text style={styles.heroPanelTitle}>
                {vehicles.length} vehículo{vehicles.length !== 1 ? "s" : ""} en
                seguimiento
              </Text>
            </View>

            {totalAlerts > 0 ? (
              <TouchableOpacity
                style={styles.alertPill}
                onPress={showAlertDetails}
                activeOpacity={0.85}
              >
                <Ionicons
                  name="notifications"
                  size={iconSize.sm}
                  color="#fff"
                />
                <Text style={styles.alertPillText}>
                  {totalAlerts} alerta{totalAlerts !== 1 ? "s" : ""}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.readyPill}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={iconSize.sm}
                  color="#D8F5E3"
                />
                <Text style={styles.readyPillText}>Todo al día</Text>
              </View>
            )}
          </View>

          <View style={styles.statsGrid}>
            <StatCard
              colors={colors}
              icon="car-sport-outline"
              label="Vehículos"
              value={vehicles.length}
              tone="primary"
            />
            <StatCard
              colors={colors}
              icon="warning-outline"
              label="Vencidos"
              value={overdueCount}
              tone="danger"
            />
            <StatCard
              colors={colors}
              icon="time-outline"
              label="Urgentes"
              value={urgentCount}
              tone="warning"
            />
            <StatCard
              colors={colors}
              icon="document-text-outline"
              label="Documentos"
              value={expiringDocumentsCount}
              tone="info"
            />
          </View>
        </View>
      </LinearGradient>

      {showSearchSection && (
        <View
          style={[
            styles.searchSection,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.border,
              shadowColor: colors.shadow,
            },
          ]}
        >
          <View style={styles.searchHeaderRow}>
            <View>
              <Text style={[styles.sectionEyebrow, { color: colors.primary }]}>
                Garage
              </Text>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Vehículos registrados
              </Text>
            </View>
            <TouchableOpacity
              style={styles.inlineAction}
              onPress={() => navigation.navigate("AddVehicle")}
            >
              <Ionicons
                name="add-circle-outline"
                size={iconSize.sm}
                color={colors.primary}
              />
              <Text
                style={[styles.inlineActionText, { color: colors.primary }]}
              >
                Nuevo
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.summaryStrip}>
            <Text
              style={[styles.summaryStripText, { color: colors.textSecondary }]}
            >
              {vehiclesWithUpcoming.length} vehículo
              {vehiclesWithUpcoming.length !== 1 ? "s" : ""} registrados
            </Text>
            <Text
              style={[styles.summaryStripDivider, { color: colors.border }]}
            >
              •
            </Text>
            <Text
              style={[styles.summaryStripText, { color: colors.textSecondary }]}
            >
              {totalAlerts > 0
                ? `${totalAlerts} alerta${totalAlerts !== 1 ? "s" : ""} activas`
                : "Sin alertas activas"}
            </Text>
          </View>
        </View>
      )}
    </>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <LinearGradient
        colors={["rgba(33, 150, 243, 0.16)", "rgba(33, 150, 243, 0.04)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.emptyBadge}
      >
        <Ionicons name="shield-checkmark-outline" size={ms(34)} color="#fff" />
      </LinearGradient>
      <Ionicons
        name="car-sport-outline"
        size={ms(80)}
        color={colors.textSecondary}
      />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        Tu garage empieza aquí
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        Registra tu primer vehículo para activar recordatorios, historial de
        servicio y control de gastos en un solo lugar.
      </Text>
      <Button
        title="Registrar vehículo"
        onPress={() => navigation.navigate("AddVehicle")}
        style={styles.emptyButton}
      />
    </View>
  );

  if (loading) {
    return (
      <DialogComponent>
        <View style={styles.loadingContainer}>
          <Text>Cargando...</Text>
        </View>
      </DialogComponent>
    );
  }

  return (
    <DialogComponent>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {vehicles.length === 0 ? (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {renderTopContent(false)}
            {renderEmptyState()}
          </ScrollView>
        ) : (
          <FlatList
            data={vehiclesWithUpcoming}
            renderItem={renderVehicleCard}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListHeaderComponent={renderTopContent}
          />
        )}

        {vehicles.length > 0 && (
          <TouchableOpacity
            style={styles.fab}
            onPress={() => navigation.navigate("AddVehicle")}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={iconSize.lg} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </DialogComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerGradient: {
    paddingHorizontal: hs(20),
    paddingTop: vs(42),
    paddingBottom: vs(24),
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerLeft: {
    flex: 1,
  },
  eyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: hs(8),
    marginBottom: vs(8),
  },
  headerEyebrow: {
    fontSize: rf(13),
    fontWeight: "600",
    color: "rgba(255,255,255,0.8)",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  headerTitle: {
    fontSize: rf(27),
    fontWeight: "800",
    color: "#fff",
    marginBottom: vs(4),
  },
  headerSubtitle: {
    fontSize: rf(14),
    color: "rgba(255,255,255,0.86)",
    lineHeight: rf(20),
    maxWidth: "92%",
  },
  helpButtonHeader: {
    width: s(44),
    height: s(44),
    borderRadius: s(22),
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: hs(12),
  },
  heroPanel: {
    marginTop: vs(14),
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  heroPanelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: hs(10),
    marginBottom: vs(10),
  },
  heroTitleWrap: {
    flex: 1,
  },
  heroPanelLabel: {
    fontSize: rf(12),
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.7,
    color: "rgba(255,255,255,0.72)",
    marginBottom: vs(6),
  },
  heroPanelTitle: {
    fontSize: rf(17),
    fontWeight: "700",
    color: "#fff",
  },
  alertPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: hs(6),
    paddingHorizontal: hs(10),
    paddingVertical: vs(6),
    borderRadius: s(999),
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },
  alertPillText: {
    color: "#fff",
    fontSize: rf(13),
    fontWeight: "700",
  },
  readyPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: hs(6),
    paddingHorizontal: hs(10),
    paddingVertical: vs(6),
    borderRadius: s(999),
    backgroundColor: "rgba(126, 214, 159, 0.18)",
  },
  readyPillText: {
    color: "#E8FFF0",
    fontSize: rf(13),
    fontWeight: "700",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: hs(8),
  },
  statCard: {
    width: "48%",
    minHeight: vs(62),
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  statIconWrap: {
    width: s(32),
    height: s(32),
    borderRadius: s(16),
    alignItems: "center",
    justifyContent: "center",
    marginRight: hs(10),
  },
  statBody: {
    flex: 1,
  },
  statValue: {
    fontSize: rf(18),
    fontWeight: "800",
    marginBottom: vs(1),
  },
  statLabel: {
    fontSize: rf(12),
    fontWeight: "600",
  },
  searchSection: {
    marginTop: vs(-10),
    marginHorizontal: hs(16),
    marginBottom: vs(10),
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: s(18),
    elevation: 4,
  },
  searchHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: vs(10),
  },
  sectionEyebrow: {
    fontSize: rf(12),
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: vs(4),
  },
  sectionTitle: {
    fontSize: rf(17),
    fontWeight: "700",
  },
  inlineAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: hs(4),
  },
  inlineActionText: {
    fontSize: rf(14),
    fontWeight: "700",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchBarContainer: {
    flex: 1,
  },
  helpButton: {
    width: s(44),
    height: s(44),
    borderRadius: s(22),
    alignItems: "center",
    justifyContent: "center",
    marginLeft: hs(10),
  },
  summaryStrip: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: vs(8),
    marginBottom: vs(2),
  },
  summaryStripText: {
    fontSize: rf(13),
    fontWeight: "600",
  },
  summaryStripDivider: {
    marginHorizontal: hs(8),
    fontSize: rf(12),
  },
  listContent: {
    paddingBottom: spacing.xxl,
  },
  scrollContent: {
    flexGrow: 1,
  },
  noResultsContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: vs(52),
    paddingHorizontal: hs(20),
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  noResultsText: {
    fontSize: rf(16),
    marginTop: vs(16),
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xxl,
  },
  emptyBadge: {
    width: s(68),
    height: s(68),
    borderRadius: s(34),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: vs(18),
  },
  emptyTitle: {
    fontSize: rf(20),
    fontWeight: "800",
    marginTop: vs(16),
    marginBottom: vs(8),
  },
  emptySubtitle: {
    fontSize: rf(14),
    textAlign: "center",
    lineHeight: rf(21),
    marginBottom: vs(24),
  },
  emptyButton: {
    minWidth: s(200),
  },
  fab: {
    position: "absolute",
    right: hs(20),
    bottom: vs(20),
    backgroundColor: "#0D6EFD",
    width: s(60),
    height: s(60),
    borderRadius: s(30),
    justifyContent: "center",
    alignItems: "center",
    elevation: s(8),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: s(10),
  },
});

export default HomeScreen;
